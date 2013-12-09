var socket = io.connect();

function addMessage(time, user, message) {
        $("#chat_entries").prepend('<div class="message"><p>' + user + ' : ' + message + ' @' + time + '</p></div>');
}

function updateUsers(num) {
		$("#user_number").text(num);
}

function sentMessage() {
	if($('#message_input').val() != "") {
		// emit message event
		socket.emit('message', $('#message_input').val());
		addMessage(new Date().toISOString(), 'Me', $('#message_input').val());
		$('#message_input').val('');		
	}
}

function setUser() {
	if($('#name_input').val() != "") {
		socket.emit('setUser', $('#name_input').val());
		$('#chat_controls').show();
		$('#name_input').hide();
		$('#name_set').hide();
	}
}

// receive message
socket.on('message', function(data) {
	addMessage(data['time'], data['user'], data['message']);
});

// update number of user
socket.on('updateUsers', function(data) {
	updateUsers(data);
});

$(function(){
	$('#chat_controls').hide();
	// set name 
	$('#name_set').click(function() {
		setUser();
	});
	// sent message
	$('#submit').click(function() {
		sentMessage();
	});
});
