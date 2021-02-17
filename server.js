const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('client-javascript'));

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

const connectedUsers = [];

// State Data
let userVotesForRound = [];
let participantsCurrentlyVoting = false;

io.on('connection', (socket) => {  
  addUserToRoom(socket);

  socket.on('name change', (nameMessage) => {
    if (nameMessage) {
      // do nothing if the name already exists
      if (connectedUsers.lastIndexOf(nameMessage) >= 0) {
        return;
      }

      const indexOfUser = connectedUsers.lastIndexOf(socket.userName);
      connectedUsers[indexOfUser] = nameMessage;
      socket.userName = nameMessage;
      socket.emit("name set", socket.userName);
      emitUsers();
    }    
  });

  // When votes are cleared, the round is over and no one is currently voting.
  socket.on('clear votes', () => {    
    userVotesForRound = [];
    participantsCurrentlyVoting = false;
    io.emit('clear votes');
  });

  socket.on('start votes', () => {
    // Only start voting if the users are not currently voting.
    if (participantsCurrentlyVoting === false) {
      participantsCurrentlyVoting = true;
      io.emit('start votes', {
        allUsersVoting: connectedUsers
      });
    }    
  });

  socket.on('vote amount', (voteAmount) => {
    const userVote = {
      name: socket.userName,
      vote: voteAmount
    };
    const userIndex = userVotesForRound.findIndex(userVoteInfo => {
      return userVoteInfo.name === userVote.name;
    });
    if (userIndex >= 0) {
      userVotesForRound[userIndex] = userVote;
    } else {
      userVotesForRound.push(userVote);
    }
    io.emit('user voted', {
      userVotes: userVotesForRound,
      allUsersVoting: connectedUsers
    });
  });

  socket.on('show vote results', () => {
    // Only show results if people were voting
    if (participantsCurrentlyVoting === true) {
      io.emit('show vote results', {
        userVotes: userVotesForRound
      });
    }
  });

  socket.on('disconnect', () => {
    removeUserFromRoom(socket);    
  });
});

function addUserToRoom(socket) {
  socket.userName = socket.id;
  connectedUsers.push(socket.userName);
  socket.emit("name set", socket.userName);
  emitUsers();
}

function removeUserFromRoom(socket) {
  const indexOfUser = connectedUsers.lastIndexOf(socket.userName);
  connectedUsers.splice(indexOfUser, 1);
  emitUsers();
}

function emitUsers() {
  io.emit('number of users', {
    numberOfUsersConnected: connectedUsers.length,
    users: connectedUsers
  });
}

