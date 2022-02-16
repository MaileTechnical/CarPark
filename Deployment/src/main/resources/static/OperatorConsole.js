var stompClient = null;

const entrystands = new Map()
const exitstands = new Map()

var vm = new Vue({
	el: '#main-content',
	data: {
	    DateTime: "",
	    Capacity: "",
	    Occupancy: "",
	    Availability: "",
	    ShowMsgs: false
    }
})

const EntryStand = {
  template: '#entry-console-display',
  data: function () {
    return {
      location: '',
      activated: false,
      ticketStatus: 'NOTREQUESTED',
      barrier: 'CLOSED',
      delayed: false,
      help: false
    }
  },
  methods: {
    setLocation: function(location) {
      this.location = location;
    },
    setActive(activated) {
      this.activated = activated;
    },
    setTicketStatus(ticketStatus) {
      this.ticketStatus = ticketStatus;
    },
    setBarrier(barrier) {
      this.barrier = barrier;
    },
    setDelayed(delayed) {
      this.delayed = delayed;
    },
    setHelp(help) {
      this.help = help;
    },
    reset() {
      this.activated = false;
      this.ticketStatus = "NOTREQUESTED";
      this.barrier = "CLOSED";
      this.delayed = false;
      this.help = false;
    }
  }
}

const ExitStand = {
  template: '#exit-console-display',
  data: function () {
    return {
      location: '',
      activated: false,
      ticketStatus: 'NOTINSERTED',
      exitDeadline: 'NONE',
      barrier: 'CLOSED',
      ticketNumber: '',
      additionalCharge: '',
      overstay: '',
      charge: '',
      duration: '', 
      tardyExit: false,
      unpaidStayExit: false,
      help: false
    }
  },
  methods: {
    setLocation: function(location) {
      this.location = location;
    },
    setActive(activated) {
      this.activated = activated;
    },
    setTicketStatus(ticketStatus) {
      this.ticketStatus = ticketStatus;
    },
    setExitDeadline(deadline) {
      this.exitDeadline = deadline;
    },
    setBarrier(barrier) {
      this.barrier = barrier;
    },
    setTicketNumber(number) {
      this.ticketNumber = number;
    },
    setAdditionalCharge(amount) {
      this.additionalCharge = amount;
    },
    setOverstay(amount) {
      this.overstay = amount;
    },
    setCharge(amount) {
      this.charge = amount;
    },
    setDuration(amount) {
      this.duration = amount;
    },
    setTardyExit(condition) {
      this.tardyExit = condition;
    },
    setUnpaidStayExit(condition) {
      this.unpaidStayExit = condition;
    },
    setHelp(help) {
      this.help = help;
    },
    reset() {
      this.activated = false;
      this.ticketStatus = "NOTINSERTED";
      this.exitDeadline = "NONE";
      this.barrier = "CLOSED";
      this.tardyExit = false;
      this.unpaidStayExit = false;
      this.help = false;
    }
  }
}

function initialize() {
	vm.DateTime = "";
	vm.Capacity = "";
	vm.Occupancy = "";
	vm.Availability = "";
}

function makeEntry(location) {
    const entryClass = Vue.extend(EntryStand);
    var theEntry = new entryClass;
    entry = theEntry.$mount();
    document.getElementById('entry-consoles').appendChild(theEntry.$el);
    entry.setLocation(location);
    entrystands.set( entry.location, entry )
}

function makeExit(location) {
    const exitClass = Vue.extend(ExitStand);
    var theExit= new exitClass;
    exit = theExit.$mount();
    document.getElementById('exit-consoles').appendChild(theExit.$el);
    exit.setLocation(location)
    exitstands.set( exit.location, exit )
}

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (!connected) {
        initialize();
    }
    $("#replies").html("");
}

// When connecting, subscribe to a topic to receive
// messages sent from the server.  All operator consoles
// subscribe to the same topic, so they all see the same data.
function connect() {
    var socket = new SockJS('/Carpark-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/OperatorConsole', function (message) {
            handleReply(message);
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

function toggleMsgs() {
    vm.ShowMsgs = !vm.ShowMsgs;
}

// Client-to-server messages.
function sendToServer( messageName, paramName, paramValue ) {
	var messageBody = {};
	messageBody[paramName] = paramValue;
    stompClient.send("/app/" + messageName, {}, JSON.stringify( messageBody ));
}

// Display a message received from the server and
// update data as necessary.
function handleReply(message) {
    var location ="";
    var barrier = "";
    var ticketStatus = "";
    var visible = false;
    var ticketNumber = "";
    var exitDeadline = "";
    var amount = "";
    var duration = "";
    var peripheral = "";
   
    var messageName = JSON.parse( message.body ).messageName;
    var payload = JSON.parse( message.body ).payload;
    if ( messageName !== "DateTimeUpdate" ) {
        $("#replies").append("<tr><td>" + JSON.stringify( JSON.parse( message.body ) ) + "</td></tr>");
    }

    if ( messageName == "Register" ) {
    	location = JSON.parse( payload ).location;
    	peripheral = JSON.parse( payload ).peripheral;
    	if ( peripheral == "Entry" ) {
    	  if ( ! entrystands.has( location ) ) {
    	      makeEntry(location);
    	  }
    	} else if ( peripheral == "Exit" ) {
    	  if ( ! exitstands.has( location ) ) {
    	      makeExit(location);
    	  }
    	}
    }
    
    // Instance-specific messages.
    if ( messageName == "ActivateEntryStand" ) {
    	location = JSON.parse( payload ).location;
    	barrier = JSON.parse( payload ).barrier;
    	ticketStatus = JSON.parse( payload ).ticket;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.setTicketStatus(ticketStatus);
    	  entry.setBarrier(barrier);
    	  entry.setActive(true);
    	}
    } else if ( messageName == "ActivateExitStand" ) {
    	location = JSON.parse( payload ).location;
    	barrier = JSON.parse( payload ).barrier;
    	ticketStatus = JSON.parse( payload ).ticket;
    	exitDeadline = JSON.parse( payload ).exitDeadline;
    	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketStatus(ticketStatus);
    	  exit.setBarrier(barrier);
    	  exit.setExitDeadline(exitDeadline);
    	  exit.setActive(true);
    	}
    } else if ( messageName == "DeactivateEntryStand" ) {
    	location = JSON.parse( payload ).location;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.reset();
    	}
    } else if ( messageName == "DeactivateExitStand" ) {
    	location = JSON.parse( payload ).location;
    	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.reset();
    	}
    } else if ( messageName == "DelayedEntry" ) {
    	location = JSON.parse( payload ).location;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.setDelayed(true);
    	}
    } else if ( messageName == "TardyExit" ) {
    	location = JSON.parse( payload ).location;
    	ticketNumber = JSON.parse( payload ).ticketNumber;
    	amount = Number( JSON.parse( payload ).additionalCharge ).toFixed(2);
    	duration = Number( JSON.parse( payload ).overstay ).toFixed(2);
     	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketNumber(ticketNumber);
    	  exit.setAdditionalCharge(amount);
    	  exit.setOverstay(duration);
    	  exit.setTardyExit(true);
    	}
    } else if ( messageName == "UnpaidStayExit" ) {
    	location = JSON.parse( payload ).location;
    	ticketNumber = JSON.parse( payload ).ticketNumber;
    	amount = Number( JSON.parse( payload ).charge ).toFixed(2);
    	duration = Number( JSON.parse( payload ).duration ).toFixed(2);
     	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketNumber(ticketNumber);
    	  exit.setCharge(amount);
    	  exit.setDuration(duration);
    	  exit.setUnpaidStayExit(true);
    	}
    } else if ( messageName == "HelpRequest" ) {
    	location = JSON.parse( payload ).location;
    	peripheral = JSON.parse( payload ).peripheral;
    	if ( peripheral == "Entry" ) {
    	  entry = entrystands.get(location);
    	  if ( entry ) {
    	    entry.setActive(true);
    	    entry.setHelp(true);
    	  }
    	}
    	if ( peripheral == "Exit" ) {
    	  exit = exitstands.get(location);
    	  if ( exit ) {
    	    exit.setActive(true);
    	    exit.setHelp(true);
    	  }
    	}
    // Non-instance-specific.
    } else if ( messageName == "OccupancyUpdate" ) {
    	vm.Occupancy = JSON.parse( payload ).occupancy;
    	vm.Capacity = JSON.parse( payload ).capacity;
    	vm.Availability = JSON.parse( payload ).availability;
    } else if ( messageName == "DateTimeUpdate" ) {
    	vm.DateTime = JSON.parse( payload ).dateTime;
    }
}


// Act on instance button clicks
function OpenEntry( element ) {
  parent = element.parentNode.parentNode;  // Seek to identify which instance owns the button that was clicked.
  for ( entry of entrystands.values() ) {
    if ( entry.$el == parent ) {
      sendToServer( "OpenEntryBarrier", "location", entry.location );
      entry.setHelp(false);
      break;
    }
  }
}

function IssueTicket( element ) {
  parent = element.parentNode.parentNode;
  for ( entry of entrystands.values() ) {
    if ( entry.$el == parent ) {
      sendToServer( "OperatorIssueTicket", "location", entry.location );
      entry.setHelp(false);
      break;
    }
  }
}

function OpenExit( element ) {
  parent = element.parentNode.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "OpenExitBarrier", "location", exit.location );
      exit.setHelp(false);
      break;
    }
  }
}

function FeeWaived( element ) {
  parent = element.parentNode.parentNode.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "FeeWaived", "ticketNumber", exit.ticketNumber );
      exit.setHelp(false);
      break;
    }
  }
}

function FeeCollected( element ) {
  parent = element.parentNode.parentNode.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "FeeCollected", "ticketNumber", exit.ticketNumber );
      exit.setHelp(false);
      break;
    }
  }
}

// Map non-instance buttons to functions.
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#msgdisplay" ).click(function() { toggleMsgs(); });
});