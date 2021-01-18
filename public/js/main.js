const socket = io();

const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

// Get username and room id from URL ( query string)
const {username , room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

console.log({
    username,
    room
})

// Join chatroom
socket.emit('joinRoom',{username , room })

// Get room and users 
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message' , message => {
    console.log(message)
    outputMessage(message)

    // Scroll down to bottom , Everytime we get a new message 
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

// Message submit 
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    const message = e.target.elements.msg.value
    // console.log(message)
    
    // emiting a message to server
    socket.emit('chatMessage',message)

    // Clear the input after sending message and focus it
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

const outputMessage = (msg) => {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${msg.username} : <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}

const outputRoomName = (room) => {
    roomName.innerText = room;
};

const outputUsers = (users) => {
    userList.innerHTML = `
        ${users.map(user =>`<li> ${user.username} </li>`).join('')}
    `;
};;