var express = require('express'),
	hbs = require('hbs'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	port = '3001',
	users = 0,
	usersArray = [];

app.configure(function(){
	'use strict';

	//app.set('port', process.env.PORT || 3001);
	app.use(express.static(__dirname + '/public'));	//serve up static content (e.g. assets)
	app.engine('html', require('hbs').__express);
	app.set('views', __dirname + '/views');			//this is where your views/markup goes
	app.set('view engine', 'html');
});

app.configure('development', function(){
 	'use static';

 	app.use(express.errorHandler());  				//prettier way to show errors
});

app.get('/', function(req, res){
	res.render('index.html', 
		{ 
			layout : false ,
			'title' : 'Chat room wiht Node.js and Socket.io' 
		}
	);
});

server.listen(port);
console.log('Server listening on :' + port);

io.sockets.on('connection', function(socket) {
	updateUserCount();

	socket.on('setUser', function(data){
		++users;									// as user connection and login, then add one. 
		updateUserCount();							// send the number of user to all users

		console.log('debug - user count: ' + users);	

		if(usersArray.indexOf(data) == -1) {		// user name shouldn't be the same
			socket.set('user', data, function(){
				usersArray.push(data);
				socket.emit('userStatus', 'ok');
				console.log('debug - user: ' + data + ' connect!');
			});
		} else {
			socket.emit('userStatus', 'error');
		}
	});

	socket.on('message', function(data){
		console.log(getUser(socket));
		if(getUser(socket)) {
			var transmit = {time: new Date().toISOString(), user: getUser(socket), message: data};
			socket.broadcast.emit('message', transmit);
			console.log('debug - ' + transmit['user'] + ': ' + data);
		}
	});

	socket.on('disconnect', function(){
		if(users > 0) {
			--users;
			updateUserCount();
			if(getUser(socket)) {
				var user,
					index;
				socket.get('user', function(err, name){
					user = name;
				});
				index = usersArray.indexOf(user);
				usersArray.splice(index - 1, 1);
			}
		}
	});
});

function updateUserCount() {
	io.sockets.emit('updateUsers', users);
}

function getUser(socket) {
	var user;
	socket.get('user',function(err, name){
		if(name == null)
			user = false;
		else 
			user = name;
	});
	return user;
}