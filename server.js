const express =  require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');

const port = 8000 || process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socket(server);
var connectedClients = [];
var newClientId = " ";

//set folder for html, css and js
app.use(express.static(path.join(__dirname, 'static')));

//when a client connects
io.on('connection', socket =>{
    console.log("New WebSocket Connection: " + socket.id);
    connectedClients.push(socket.id);    
    console.log(connectedClients);

    socket.on('newClientJoined', data=>{
        if(connectedClients.length == 1){
            socket.emit('currentState', "You are the only client");
            console.log("First client");
        }else if(connectedClients.length > 1){
            newClientId = socket.id;
            console.log("Sender client:"+connectedClients[0]);
            io.to(connectedClients[0]).emit('newClientJoined', 'New Client has joined')
            console.log("Not first client");
        }
    });

    socket.on( 'totalWhiteboards', data => {
        console.log("total no of whiteboards= " + data[0]);
        io.to(newClientId).emit('totalWhiteboards', data)
    });


    // socket.on('currentState', data =>{
    //     console.log(data);
    //     io.to(newClientId).emit('currentState', data);
    //     console.log("data sent to " + newClientId);
    // });

    socket.on('pencil', data =>{
        socket.broadcast.emit('pencil', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('eraser', data =>{
        socket.broadcast.emit('eraser', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('shapes', data =>{
        socket.broadcast.emit('shapes', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('text', data =>{
        socket.broadcast.emit('text', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('clearWhiteboard', data =>{
        socket.broadcast.emit('clearWhiteboard', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('undo', data =>{
        socket.broadcast.emit('undo', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('redo', data =>{
        socket.broadcast.emit('redo', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('addWhiteboard', data =>{
        socket.broadcast.emit('addWhiteboard', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('previousWhiteboard', data =>{
        socket.broadcast.emit('previousWhiteboard', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('nextWhiteboard', data =>{
        socket.broadcast.emit('nextWhiteboard', data);
        console.log('Broadcasted to Clients');
    });
    socket.on('disconnect', function(){
        var i = 0;
        while (i < connectedClients.length) { 

            if (connectedClients[i] === socket.id) { 
                connectedClients.splice(i, 1);
                console.log(connectedClients);
                break;
            } 

            i++;
        }

        console.log("user left");
    })
})

server.listen(port, function(error){
    if(error){
        console.log("Something went wrong");
        console.log("Error:", error);
    }else{
        console.log("Server is listening on port " + port );
    }
});

