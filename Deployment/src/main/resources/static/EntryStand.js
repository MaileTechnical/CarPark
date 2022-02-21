var stompClient = null;

var vm = new Vue({
	el: '#main-content',
	data: {
	    TicketRequestDisabled: true,
	    TicketCollectedDisabled : true,
	    VehicleEnteredDisabled: true,
	    BarrierOpen: false,
	    ShowMsgs: false
    }
})

function initialize() {
	vm.TicketRequestDisabled = true;
	vm.TicketCollectedDisabled = true;
	vm.VehicleEnteredDisabled = true;
	BarrierOpen = false;
}

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        stompClient.send("/app/Register", {}, JSON.stringify({'location': $("#location").val()}));
    }
    else {
        initialize();
    }
    $("#replies").html("");
}

function toggleMsgs() {
    vm.ShowMsgs = !vm.ShowMsgs;
}

// When connecting, subscribe to a location-specific topic to receive
// messages sent from the server.  Also open a socket so that intercom 
// messages can be sent out of this client.
function connect() {
    var socket = new SockJS('/CarparkEntry-websocket');
    var intercomSocket = new SockJS( '/CarparkIntercom-websocket');
    stompIntercom = Stomp.over(intercomSocket);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/EntryStand/' + $("#location").val(), function (message) {
            showReply(message);
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    if (stompIntercom !== null) {
    	stompIntercom.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

// Client-to-server messages.
function sendToServer( messageName ) {
    stompClient.send("/app/" + messageName, {}, JSON.stringify({'location': $("#location").val()}));
}

// Client-to-client messages - in fact, uses client-server-client path.
function sendToOperator( messageName ) {
    stompIntercom.send("/app/" + messageName, {}, 
                     JSON.stringify({'location': $("#location").val(), 'peripheral': "Entry"}));
}

// Display a message received from the server and 
// update the enable/disable states of buttons based on the 
// the incoming message.
function showReply(message) {
    $("#replies").append("<tr><td>" + message + "</td></tr>");
    var messageName = JSON.parse(message.body).messageName;
    if ( messageName == "TicketRequestEnabled" ) {
    	vm.TicketRequestDisabled = false;
    } else if ( messageName == "OpenBarrier" ) {
    	vm.VehicleEnteredDisabled = false;
    	vm.TicketCollectedDisabled = true;
    	vm.BarrierOpen = true;
    } else if ( messageName == "IssueTicket" ) {
    	vm.TicketRequestDisabled = true;
    	vm.TicketCollectedDisabled = false;
    } else if ( messageName == "CloseBarrier" ) {
    	vm.VehicleEnteredDisabled = true;
    	vm.BarrierOpen = false;
    }
}

// Map buttons to functions.
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#VehicleWaiting" ).click(function() { sendToServer( "VehicleWaiting" ); });
    $( "#TicketRequest" ).click(function() { sendToServer( "TicketRequested" ); });
    $( "#TicketCollected" ).click(function() { sendToServer( "TicketCollected" ); });
    $( "#VehicleEntered" ).click(function() { sendToServer( "VehicleEntered" ); });
    $( "#msgdisplay" ).click(function() { toggleMsgs(); });
    $( "#help" ).click(function() { sendToOperator( "HelpRequest" ); });
});