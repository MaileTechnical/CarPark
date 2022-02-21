var stompClient = null;

var vm = new Vue({
	el: '#main-content',
	data: {
	    VehicleWaitingDisabled: false,
	    VehicleExitedDisabled : true,
	    InsertedTicketDisabled: true,
	    BarrierOpen: false,
	    ShowMsgs: false
    }
})

function initialize() {
    vm.VehicleWaitingDisabled = false;
	vm.VehicleExitedDisabled = true;
	vm.InsertedTicketDisabled = true;
	vm.BarrierOpen = false;
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

// When connecting, subscribe to a location-specific topic to receive
// messages sent from the server.  Also open a socket so that intercom 
// messages can be sent out of this client.
function connect() {
    var socket = new SockJS('/CarparkExit-websocket');
    var intercomSocket = new SockJS( '/CarparkIntercom-websocket');
    stompIntercom = Stomp.over(intercomSocket);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/ExitStand/' + $("#location").val(), function (message) {
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

function toggleMsgs() {
    vm.ShowMsgs = !vm.ShowMsgs;
}

// Client-to-server messages.
function sendToServer( messageName ) {
    stompClient.send("/app/" + messageName, {}, JSON.stringify({'location': $("#location").val()}));
    if ( messageName == "VehicleWaiting" ) {
    	vm.InsertedTicketDisabled = false;
    	vm.VehicleWaitingDisabled = true;
    } else if ( messageName == "VehicleExited" )
    	vm.VehicleWaitingDisabled = false;
}

function sendInsertedTicket() {
    if ( $("#TicketNumber").val() != 0 ) {
        stompClient.send("/app/InsertedTicket", {}, 
          JSON.stringify({'location': $("#location").val(), 'ticketNumber': $("#TicketNumber").val()}));
        vm.InsertedTicketDisabled = true;
    }
}

// Client-to-client messages - in fact, uses client-server-client path.
function sendToOperator( messageName ) {
    stompIntercom.send("/app/" + messageName, {}, 
                     JSON.stringify({'location': $("#location").val(), 'peripheral': "Exit"}));
}


// Display a message received from the server and 
// update the enable/disable states of buttons based on the 
// the incoming message.
function showReply(message) {
    $("#replies").append("<tr><td>" + message + "</td></tr>");
    var messageName = JSON.parse(message.body).messageName;
    if ( messageName == "OpenBarrier" ) {
    	vm.VehicleExitedDisabled = false;
    	vm.BarrierOpen = true;
    } else if ( messageName == "CloseBarrier" ) {
    	vm.VehicleExitedDisabled = true;
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
    $( "#InsertedTicket" ).click(function() { sendInsertedTicket(); });
    $( "#VehicleExited" ).click(function() { sendToServer( "VehicleExited" ); });
    $( "#msgdisplay" ).click(function() { toggleMsgs(); });
    $( "#help" ).click(function() { sendToOperator( "HelpRequest" ); });
});