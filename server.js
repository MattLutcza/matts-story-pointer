const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('client/javascript'));

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/client/templates/home.html');
});

app.get('/room', (req, res) => {
  res.sendFile(__dirname + '/client/templates/room.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// What the room object looks like
let roomObject = {
  roomName: "testRoom",
  isPrivate: true,
  password: "test",
  usersInRoom: [],
  roomAdmin: "testUser",
  isRoomCurrentlyVoting: false,
  votesForStory: []
};

// server side room storage - contains all the rooms state
let roomMap = new Map();
let roomPasswordMap = new Map(); // keep passwords separate and only on server side

io.on('connection', (socket) => {
  console.log("user connected");  
  // initialize user data with only their initial name
  socket.appData = {};
  socket.appData.userName = socket.id;

  // on connection, emit which users are connected (for home page)
  // TODO - can this just be socket emit?
  io.emit('users connected', {
    availableRoomMap: Array.from(roomMap)
  });

  socket.on('create room', (newRoomInfo) => {
    console.log("creating room");

    const roomName = newRoomInfo.roomName;
    
    // if room already exists, then there is nothing to add
    if (roomMap.has(roomName)) {
      return;
    }

    // create and add new room to room map
    const newRoom = {
      "roomName": newRoomInfo.roomName,
      "isPrivate": newRoomInfo.isPrivate,
      "usersInRoom": []      
    };
    roomMap.set(roomName, newRoom);

    // if the room is private, keep track of the password separately
    if (newRoomInfo.isPrivate) {
      roomPasswordMap.set(roomName, newRoomInfo.password);
    }
    
    // emit the room map with the newly added room
    io.emit('users connected', {
      availableRoomMap: Array.from(roomMap)
    });
  });

  socket.on('get room information', (roomName) => {
    console.log("get room info");    
    socket.emit('room information', roomMap.get(roomName));
  });

  socket.on('join room', (roomInfo) => {
    console.log("attempt to join room");
    
    const userName = socket.appData.userName;
    const roomName = roomInfo.roomName;
    const password = roomInfo.password;
    
    // if the room exists AND its private AND you are not the person who created the room AND the password does not match
    // send back access denied.
    if (roomMap.has(roomName) && 
      roomMap.get(roomName).isPrivate &&
      roomMap.get(roomName).usersInRoom.length > 0 &&
      roomPasswordMap.get(roomName) !== password) {
        socket.emit('access denied');
        return;
    }

    // otherwise join the room and save it on the socket   
    socket.join(roomName);
    socket.appData.roomName = roomName;
    
    // user needs to know their name inside a room
    // emit their name to them
    socket.emit("name set", userName);    

    // room can already exist when...
    // - the user themself created it on home page and is now about to join
    // - others have already created/joined the room
    if (roomMap.has(roomName)) {    
      // add the user to the room  
      const currentRoomUsers = roomMap.get(roomName).usersInRoom; 
      currentRoomUsers.push(userName);
      // if the user is the only one in the room, then also make the user the admin
      if (currentRoomUsers.length === 1) {
        roomMap.get(roomName).roomAdmin = userName;
      } 

      // if voting is in progress in the room when a user joins, send new voting info to everyone
      if (roomMap.get(roomName).isRoomCurrentlyVoting) {      
        io.to(roomName).emit('user voted', {
          userVotes: roomMap.get(roomName).votesForStory,
          allUsersVoting: roomMap.get(roomName).usersInRoom
        });
      }
    } else {
      // if the room doesn't exist (user navigates to a URL directly) then create a 
      // new PUBLIC room with them as the admin and only user.
      const newRoom = {
        "roomName": roomName,
        "usersInRoom": [socket.appData.userName],
        "roomAdmin": socket.appData.userName
      };
      roomMap.set(roomName, newRoom);
    }
    
    // emit to the room the new admin (TODO: can this just be socket.emit?)
    io.to(roomName).emit('new admin', {
      admin: roomMap.get(roomName).roomAdmin
    });
    
    // emit to room the users in the room (with the newly joined user)
    io.to(roomName).emit('users in room', {
      usersInRoom: roomMap.get(roomName).usersInRoom
    });        
    
    // emit to ALL users the available room map.   
    io.emit('users connected', {
      availableRoomMap: Array.from(roomMap)
    });
  });

  socket.on('admin change', (newAdmin) => {
    console.log("manual admin change");
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);
    
    // check if the new admin exists in the room
    const indexOfNewAdmin = room.usersInRoom.lastIndexOf(socket.appData.userName);
    if (indexOfNewAdmin >= 0) {
      room.roomAdmin = newAdmin;
    }

    // emit to the room the new admin
    io.to(roomName).emit('new admin', {
      admin: room.roomAdmin
    });
  });

  socket.on('name change', (newName) => {
    // do nothing if name message is empty
    console.log('name change');
    if (!newName) {
      return;
    }
   
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);
    const usersInRoom = room.usersInRoom;
    
    // do nothing if the name already exists 
    // TODO send back an error?
    if (usersInRoom.lastIndexOf(newName) >= 0) {
      return;
    }

    // save the old name before we change it
    const oldName = socket.appData.userName;

    // update and emit back the new name
    socket.appData.userName = newName;
    socket.emit("name set", socket.appData.userName);

    // find the user in the list and update the name at that position
    usersInRoom[usersInRoom.lastIndexOf(oldName)] = newName;    
    
    // emit to room the room users (with the new name)
    io.to(roomName).emit('users in room', {
      usersInRoom: usersInRoom
    });

    // if the user was an admin, change the admin name too
    if (room.roomAdmin === oldName) {
      room.roomAdmin = newName;
      io.to(roomName).emit('new admin', {
        admin: room.roomAdmin
      });   
    }

    // if room is currently voting, update that name too
    if (room.isRoomCurrentlyVoting) {
      // if user voted already, need to update the name on their last vote too
      const userIndex = room.votesForStory.findIndex(userVote => {
        return userVote.name === oldName;
      });
      if (userIndex !== -1) {
        room.votesForStory[userIndex].name = newName;
      }

      io.to(roomName).emit('user voted', {
        userVotes: room.votesForStory,
        allUsersVoting: usersInRoom
      });
    }
    
    // emit to ALL users the available room map (With the new name).   
    io.emit('users connected', {
      availableRoomMap: Array.from(roomMap)
    });
  });

  // When votes are cleared, the round is over and no one is currently voting.
  socket.on('clear votes', () => {
    console.log('votes cleared');
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);

    // do nothing if the admin didn't start the voting
    if (socket.appData.userName !== room.roomAdmin) {
      return;
    }

    // clear out any votes and mark the room as not voting    
    room.isRoomCurrentlyVoting = false;
    room.votesForStory = [];

    // emit to the room that voting has ended
    io.to(roomName).emit('clear votes');
  });

  socket.on('start voting', () => {
    console.log('voting started');
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);
    // do nothing if the admin didn't start the voting
    if (socket.appData.userName !== room.roomAdmin) {
      return;
    }
    
    // do nothing if the room is already voting
    if (room.isRoomCurrentlyVoting) {
      return;
    }

    // mark the room as having begun voting
    room.isRoomCurrentlyVoting = true;
    room.votesForStory = [];
    
    // emit all the users that should be voting (TODO - can this just be done on the client side?)
    io.to(roomName).emit('user voted', {
      userVotes: room.votesForStory,
      allUsersVoting: room.usersInRoom
    });
  });

  socket.on('user voted', (voteAmount) => {
    console.log("a user voted");
    const userName = socket.appData.userName;
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);    

    // create vote object
    const newUserVote = {
      name: userName,
      vote: voteAmount
    };

    // check if the user has already voted
    const userIndex = room.votesForStory.findIndex(userVote => {
      return userVote.name === userName;
    });

    // if they already voted, replace their current vote
    if (userIndex !== -1) {
      room.votesForStory[userIndex] = newUserVote;
    } else {
      // otherwise, just add the new vote
      room.votesForStory.push(newUserVote);
    }

    // emit the new votes to the room
    io.to(roomName).emit('user voted', {
      userVotes: room.votesForStory,
      allUsersVoting: room.usersInRoom
    });
  });

  socket.on('show vote results', () => {
    console.log("show vote results");
    const roomName = socket.appData.roomName;
    const room = roomMap.get(roomName);

    // do nothing if the admin didn't start the voting
    if (socket.appData.userName !== room.roomAdmin) {
      return;
    }    
    
    // Only show results to the room if the room was currently voting
    if (room.isRoomCurrentlyVoting === true) {
      // if results are shown then voting is over
      room.isRoomCurrentlyVoting = false;
      io.to(roomName).emit('show vote results', {
        userVotes: room.votesForStory
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('disconnect');

    // if user not in a room, don't need to do anythin
    if (socket.appData.roomName) {      
      removeUserFromRoom(socket.appData.userName, socket.appData.roomName);    
    }
  });
});

function removeUserFromRoom(userName, roomName) {
  // get users in room    
  const room = roomMap.get(roomName);
  const usersInRoom = room.usersInRoom;
  
  // find and remove the user who disconnected
  const indexOfUser = usersInRoom.lastIndexOf(userName);  
  usersInRoom.splice(indexOfUser, 1);

  // if there are no more users in the room, delete the room (and it's password)
  if (usersInRoom.length === 0) {    
    roomMap.delete(roomName);
    roomPasswordMap.delete(roomName);    
  } else {    
    // if the person who left was the admin - give admin to next user in list and emit new admin
    if (room.roomAdmin === userName) {      
      room.roomAdmin = usersInRoom[0];      
      io.to(roomName).emit('new admin', {
        admin: room.roomAdmin
      });
    }
    // if the room was currently voting then we need to remove them
    // from voting data too
    if (room.isRoomCurrentlyVoting) {
      // Remove their vote if they voted
      const userIndex = room.votesForStory.findIndex(userVote => {
        return userVote.name === userName;
      });
      if (userIndex !== -1) {
        room.votesForStory.splice(userIndex, 1);
      }
      io.to(roomName).emit('user voted', {
        userVotes: room.votesForStory,
        allUsersVoting: room.usersInRoom
      });
    }

    // emit to room the new list of users (with the user removed)
    io.to(roomName).emit('users in room', {
      usersInRoom: room.usersInRoom
    });    
  }
  
  // emit to ALL users the updated available room map (with user removed AND/OR room removed).   
  io.emit('users connected', {
    availableRoomMap: Array.from(roomMap)
  });     
}
