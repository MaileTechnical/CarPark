var stompClient = null;

var vm = new Vue({
	el: '#main-content',
})

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#replies").html("");
}

// When connecting, subscribe to a topic to receive
// messages sent from the server.
function connect() {
    var socket = new SockJS('/CarparkTestControl-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/TestControl', function (message) {
            showReply(message);
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

// Client-to-server messages.
function sendAdvanceTime() {
	var minutes = $("#minutes").val();
	var hours = $("#hours").val();
	
	// Assume a zero value for any fields left blank by the user
	if ( minutes.length == 0 )
		minutes = "0";
	if ( hours.length == 0 )
		hours = "0";
    stompClient.send("/app/AdvanceTime", {}, 
      JSON.stringify({'hours': hours, 'minutes': minutes}));
}

function sendSetTime() {
	// Use the current date and time for any field left blank by the user.
	// The user enters a date/time in the local time zone, but the 
	// BridgePoint TIM EE operates in UTC, so the date/time sent from
	// this function must be in UTC.
	var dateTime = new Date();
	var year = $("#year").val();
	var month = $("#month").val();
	var day = $("#day").val();
	var hour = $("#hour").val();
	var minute = $("#minute").val();
	if ( year.length != 0 )
		dateTime.setFullYear( year );
	if ( month.length != 0 )
		dateTime.setMonth( month - 1 );  // JavaScript is 0-based
	if ( day.length != 0 )
		dateTime.setDate( day );
	if ( hour.length != 0 )
		dateTime.setHours( hour );
	if ( minute.length != 0 )
		dateTime.setMinutes( minute );
    stompClient.send("/app/SetTime", {}, 
      JSON.stringify({'year': dateTime.getUTCFullYear(),
    	              'month': dateTime.getUTCMonth() + 1,  // JavaScript is 0-based, TIM is 1-based
    	              'day': dateTime.getUTCDate(),
    	              'hour': dateTime.getUTCHours(),
    	              'minute': dateTime.getUTCMinutes()}));
}

// Display a message received from the server.
function showReply(message) {
    $("#replies").append("<tr><td>" + message + "</td></tr>");
}

// Map buttons to functions.
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#AdvanceTime" ).click(function() { sendAdvanceTime(); });
    $( "#SetTime" ).click(function() { sendSetTime(); });
});