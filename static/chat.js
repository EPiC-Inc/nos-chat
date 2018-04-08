// Vars
var socket = io();
var key = document.getElementById("passkey"); // Passkey input
var user = document.getElementById("user"); // User input
var keyPage = document.getElementById("keyPage"); // Div holding the key elements
var m = document.getElementById("m"); // Message input
var messages = document.getElementById("messages"); // Messages
var sendMsgBtn = document.getElementById("sendMsg");
var passwd = -1022586720;
var room = getUrlVars()['room'];

var uName = '';

// Functions
//Change favicon
function changeIco(ref) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = ref;
    document.getElementsByTagName('head')[0].appendChild(link);
}

// See if the page is visible (for favicon changing)
var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

function getUrlVars() {
    var vars = {};
    var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function connect() {
    if (room !== undefined) {
        socket.emit('switch', [room, uName]);
    }
    else {
        room = 'lobby'; // Set the default room to 'lobby'
        socket.emit('switch', [room, uName]);
    }
    console.log('connection established - '+uName);
}

function sendMsg() {
    if (room !== undefined && m.value !== '') {
        socket.emit('message', {'room':room, 'data':[uName, m.value.substring(0, 401)]});
        m.value=''; // Reset chat bar
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function login() {
    if (hashCode(key.value) == passwd && uName.length > 0) {
        uName = user.value.substring(0, 21);
        if (uName == '_System') {
            uName = 'I_tried_to_hack_the_system._Sorry.'
        }
        document.cookie='key='+passwd;
        document.cookie='user='+uName;
        key.value = '';
        key.disabled = true;
        user.value = '';
        user.disabled = true;
        keyPage.style.visibility = 'hidden';
        connect();
    }
}

// Jquery
$(function () {
    $('form').submit(function(){
        sendMsg();
        return false;
    });
});

// On load
var ckey=getCookie("key");
if (ckey == passwd) {
    //alert("Welcome back");
    key.value = '';
    key.disabled = true;
    keyPage.style.visibility = 'hidden';
    //connect();
}
var cuser=getCookie("user");
if (cuser !== '') {
    //alert("Welcome back");
    //key.value = '';
    //key.disabled = true;
    //keyPage.style.visibility = 'hidden';
    uName = cuser;
}
if (cuser !== '' && ckey == passwd) {
    connect();
}

//TEMP
vis(function(){
    if (vis()) {changeIco('/static/favicon.png');}
    //changeIco(vis() ? '/static/favicon.png' : '/static/alert.png');
});

// Callbacks
socket.on('message', function(data){
    var message = '';
    if (data[1].includes('@'+uName)) {
        if (!vis()) {changeIco('/static/alert.png');}
        message = '<div class="alert"> ['+data[0]+'] '+data[1]+'</div>';
    } else {
        message = '<div>['+data[0]+'] '+data[1]+'</div>';
    }
    messages.innerHTML += message;
    if (data[1] == '?kick '+uName) {socket.disconnect();}
    window.scrollTo(0,document.body.scrollHeight);
});

// Rest of the JS
console.log("Room: "+room);
