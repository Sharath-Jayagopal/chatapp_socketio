const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const server = http.createServer(app)

const io = require('socket.io')(server)

const formatMessage = require('./utils/messages')
const { userJoin , getCurrentUser , userLeave , getRoomUsers } = require('./utils/users')

// set static folder 
app.use(express.static(path.join(__dirname,'public')))

const botName = 'ChatCord Bot'

// Run when a client connects 

io.on('connection',(socket)=>{
    console.log('New socket connection');

    // new user from qs from client
    socket.on('joinRoom',({username , room})=>{

        const user = userJoin(socket.id , username , room)

        socket.join(user.room)

        //~ emits to single client ( or newly connected user )
        // Welcomes current user ! 
        socket.emit('message', formatMessage(botName ,' Welcome to chatCord'))

        // Broacast when a user connects ~ sents message to all users except connecting users
        // Broadcast Specifically to user room  
        socket.broadcast.to(user.room).emit('message', formatMessage(botName ,' ' + user.username + ' has joined the chat '))
        // socket.broadcast.emit('message', formatMessage(botName ,'A user has joined the chat ')) broadcast to everyone not specifically 
    
        //Send users and user info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    })

    // Listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username ,msg))
    })

    // Runs when a client disconnect 
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id)

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName ,`${user.username} has left the chat !`))
        }

        //Send users and user info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
        
    })

    //emits to all users 
    //io.emit()
})

server.listen(3000,()=>{
    console.log("Server Started at 3000");
})