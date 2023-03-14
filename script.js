var redirect_uri = ""; // change this your value

 

var client_id = ""; 
var client_secret = ""; // In a real app you should not expose your client_secret to the user

var splitPlay = false; //Split Play/Resume into two buttons
var extraMedia = false; //Extra media controls: Shuffle, Repeat
var btnTheme = 'theme2'; // 1-Default, 2-Spotify

var Changing = false
var access_token = null;
var refresh_token = null;
var currentPlaylist = "";
var radioButtons = [];
let IntID;
var rebtnco = ``;
var ReStates = ["off","context","track"]

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";
const REPEAT = "https://api.spotify.com/v1/me/player/repeat";

function onPageLoad(){
    const CTheme = localStorage.getItem("CTheme");
    if (CTheme != null) {
    //changeTheme(localStorage.getItem("CTheme"));
    }
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            // we don't have an access token so present token section
            document.getElementById("login-button").style.display = 'flex';  
        }
        else {
            // we have an access token so present device section  
            refreshDevices();
            currentlyPlaying();
            document.getElementById("login-button").style.display = 'none';
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        //alert(this.responseText);
    }
}

function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        //alert(this.responseText);
    }
}

function addDevice(item){
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node); 
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}



function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function PlayPause(){
    if (localStorage.getItem("splitPlay") === "false"){
    currentlyPlaying()
    if (!(data.is_playing && data.is_playing != null) ){
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), null, handleApiResponse );
    startInt(currentlyPlaying)
    }
    else {
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
    clearInterval(IntID);
    }}
    else{
    callApi( "PUT", PLAY + "?device_id=" + deviceId(), null, handleApiResponse );
    startInt(currentlyPlaying)
    }

}

function pause(){
    callApi( "PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse );
    clearInterval(IntID);
}

function shuffle(){
    const State = sessionStorage.shuffle_state;
    callApi( "PUT", SHUFFLE + "?state=" + State + "&device_id=" + deviceId(), null, handleApiResponse );
}

function repeat(){
    const State = sessionStorage.repeat_state //document.getElementById("repeat-button").className

    const index = ReStates.indexOf(State);
    if (index !== -1) {
        var nextText = ReStates[(index + 1) % 3];
    } 
    callApi( "PUT", REPEAT + "?state=" + nextText + "&device_id=" + deviceId(), null, handleApiResponse );
}

function next(){
    callApi( "POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse );
    currentlyPlaying();
}

function previous(){
    callApi( "POST", PREVIOUS + "?device_id=" + deviceId(), null, handleApiResponse );
    currentlyPlaying();
}

function transfer(){
    let body = {};
    body.device_ids = [];
    body.device_ids.push(deviceId())
    callApi( "PUT", PLAYER, JSON.stringify(body), handleApiResponse );
}

function refreshSetting() {
    const extraMedia = localStorage.getItem("extraMedia")
    const splitPlay = localStorage.getItem("splitPlay")
    if (splitPlay === "true"){
        document.getElementById("pause-button").style.display = 'block';
    } else {
        document.getElementById("pause-button").style.display = 'none';
    }
    if (extraMedia === "true"){
        document.getElementById("repeat-button").style.display = 'block';
        document.getElementById("shuffle-button").style.display = 'block';
    } else {
        document.getElementById("repeat-button").style.display = 'none';
        document.getElementById("shuffle-button").style.display = 'none';
    }     
}

document.addEventListener("DOMContentLoaded", function() { //Content load
    changeTheme(btnTheme)
    refreshSetting();
    TIMESLIDER = document.querySelector('.slider-range');
    TIMESLIDER.addEventListener("change", function(event) {
      callApi( "PUT", PLAYER + "/seek?position_ms=" + TIMESLIDER.value, null, handleApiResponse );
      currentlyPlaying();
    });
  });



function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        //alert(this.responseText);
    }    
}

function deviceId(){
    return document.getElementById("devices").value;
}



function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        data = JSON.parse(this.responseText);
        //console.log(data);
        if ( data.item != null ){
            btnColor();
            document.getElementById("albumImage").src = data.item.album.images[0].url;
            document.getElementById('albumImage').style.marginRight = "20px"
            document.getElementById("trackTitle").innerHTML = data.item.name;
            document.getElementById("trackArtist").innerHTML = data.item.artists[0].name;
            sessionStorage.repeat_state = data.repeat_state;
            sessionStorage.shuffle_state = !(data.shuffle_state);
            //document.getElementById("repeat-button").className = data.repeat_state;

            // TIMESLIDER dont change when held
            TIMESLIDER.onmousedown = function() {
                TIMESLIDER.isDragging = true;
                setInterval(() => {
                    document.querySelector('.slider-progress').style.width = updateSlider()
                }, 100);
            };
              TIMESLIDER.onmouseup = function() {
                setTimeout(() => {
                    TIMESLIDER.isDragging = false;
                }, 1500);
              };
            if (!TIMESLIDER.isDragging){
                document.getElementById('track-time-slider').value = data.progress_ms;
                document.getElementById('track-time-slider').max = data.item.duration_ms;
                document.querySelector('.slider-progress').style.width = updateSlider()
            }
        
            document.getElementById('current-time').textContent = clock(data.progress_ms)
            document.getElementById('duration').textContent = clock(data.item.duration_ms)
            
            //Check if not split then changes icon
            const ppbtn = document.getElementById("pp-btn-ico");
            if (localStorage.getItem("splitPlay") === "false"){
                if (!(data.is_playing && data.is_playing != null) ){
                ppbtn.className = "ico-play";
                ppbtn.parentElement.style.paddingLeft = "";
                }
                else {
                ppbtn.parentElement.style.paddingLeft = "6px";
                ppbtn.className = "ico-pause";
            }} else {
                ppbtn.className = "ico-play";
                ppbtn.parentElement.style.paddingLeft = "";
            }
            if (data.is_playing){
                startInt(currentlyPlaying);
            }
        }
        if ( data.device != null ){
            // select device
            currentDevice = data.device.id;
            document.getElementById('devices').value=currentDevice;
        }
    }
    else if ( this.status == 204 ){
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        //alert(this.responseText);
    }
}

function clock(progressMs){
    const minutes = Math.floor(progressMs / 60000);
    const seconds = Math.floor((progressMs % 60000) / 1000);
    const formattedProgress = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return formattedProgress;

}

function updateSlider(){
const sliderRange = document.querySelector('.slider-range');
const slidervalue = sliderRange.value / sliderRange.max;
const sliderwidth = slidervalue * 100;
return sliderwidth + '%';
}

function startInt(func) {
    if (IntID) {
      clearInterval(IntID);
    }
    IntID = setInterval(func, 1000);
  }

function btnColor() {
var r = document.querySelector(':root');
const rbtn = document.getElementById("r-btn-ico")
if (data != null){
    if (data.shuffle_state == true){
        r.style.setProperty('--shuffle', '#1db954');
    }else{
        r.style.setProperty('--shuffle', 'hsla(0,0%,100%,.7)');
    }
    if (data.repeat_state === "context"){
        r.style.setProperty('--repeat', '#1db954');
        } else if (data.repeat_state === "track"){
        r.style.setProperty('--repeat', '#1db954');
        rbtn.className = "ico-repeat-1";
        } else {
        rbtn.className = "ico-repeat";
        if (localStorage.getItem("CTheme") == "theme1"){
        r.style.setProperty('--repeat', '#fff');
        } else {
        r.style.setProperty('--repeat', 'hsla(0,0%,100%,.7)');
        }
    }
}
}

function changeTheme(className) {
    const elementNames = ["shuffle-button", "previous-button", "play-button", "pause-button", "next-button", "repeat-button"];
    const knownThemes = ["theme1", "theme2"];
  
    knownThemes.forEach(function(theme) {
      elementNames.forEach(function(name) {
        const element = document.getElementById(name);
        if (element) {
          element.classList.remove(theme);
        }
      });
    });
  
    if (className) {
      elementNames.forEach(function(name) {
        const element = document.getElementById(name);
        if (element) {
          element.classList.add(className);
        }
      });
    }
  }

//Drop menu
document.addEventListener("DOMContentLoaded", () => {
const dropdownBtn = document.querySelector(".settingBtn");
const dropdownContent = document.querySelector(".dropdown-content");

dropdownBtn.addEventListener("click", () => dropdownContent.classList.toggle("show"));

document.addEventListener("click", ({ target }) => {
  if (!target.matches(".settingBtn") && !target.closest(".dropdown-content")) {
    dropdownContent.classList.remove("show");
  }
});



//Sliders
const ExtraSlider = document.querySelector("#extra-sliderBtn");
const splitSlider = document.querySelector("#split-sliderBtn");

if (localStorage.getItem("extraMedia") === "true"){
    ExtraSlider.classList.toggle("active");
}
ExtraSlider.addEventListener("click", () => {
    ExtraSlider.classList.toggle("active");
  if (ExtraSlider.classList.contains("active")){ 
    localStorage.setItem("extraMedia", true);
    refreshSetting();
  } else {
    localStorage.setItem("extraMedia", false);
    refreshSetting();
  }
});

if (localStorage.getItem("splitPlay") === "true"){
    splitSlider.classList.toggle("active");
}
splitSlider.addEventListener("click", () => {
    splitSlider.classList.toggle("active");
  if (splitSlider.classList.contains("active")){ 
    localStorage.setItem("splitPlay", true);
    refreshSetting();
  } else {
    localStorage.setItem("splitPlay", false);
    refreshSetting();
  }
});

});

