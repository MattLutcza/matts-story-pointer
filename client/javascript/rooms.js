function createRoomInteractions(socket) {
    
    var numberOfRoomsDisplay = document.getElementById('numberOfRooms');
    var existingRoomsSection = document.getElementById('existingRooms');

    socket.on('users connected', (rooms) => {
        const roomMap = new Map(rooms.availableRoomMap);

        // remove all rooms from room display list
        while (existingRoomsSection.firstChild) {
            existingRoomsSection.removeChild(existingRoomsSection.lastChild);
        }

        // rebuild room display list with newest rooms
        var roomCounter = 0;
        roomMap.forEach((room, roomName) => {
            // don't show newly created rooms with no one in them yet. 
            if (room.usersInRoom.length !== 0) {
                roomCounter += 1;
                const roomCard = buildRoomCard(room, roomName);                
                existingRoomsSection.appendChild(roomCard);
            }            
        });
        numberOfRoomsDisplay.textContent = roomCounter;
    });    
}

function buildRoomCard(room, roomName) {
    // overall card div
    var cardDiv = document.createElement('div');
    cardDiv.className = "card mt-3";
    // add child elements
    cardDiv.appendChild(buildRoomCardTitle(roomName));
    cardDiv.appendChild(buildRoomCardListContent(room));
    cardDiv.appendChild(buildRoomCardLink(roomName));
    return cardDiv;
}

function buildRoomCardTitle(roomName) {    
    // card title header
    var cardTitleHeader = document.createElement('h5');
    cardTitleHeader.className = "card-title";
    cardTitleHeader.textContent = "Room Name: " + roomName;
    // card title div
    var cardTitleDiv = document.createElement('div');
    cardTitleDiv.className = "card-body";
    cardTitleDiv.appendChild(cardTitleHeader);
    return cardTitleDiv;
}

function buildRoomCardListContent(room) {
    // Number of users in room list item
    var cardUsersListItem = document.createElement('li');
    cardUsersListItem.textContent = "Users In Room: " + room.usersInRoom.length;
    cardUsersListItem.className = "list-group-item";
    // Room type list item
    var cardTypeListItem = document.createElement('li');
    cardTypeListItem.textContent = room.isPrivate ? "Private Room" : "Public Room";                           
    cardTypeListItem.className = "list-group-item";
    // The list content combined
    var cardList = document.createElement('ul');
    cardList.className = "list-group list-group-flush";
    cardList.appendChild(cardUsersListItem);
    cardList.appendChild(cardTypeListItem);
    return cardList;
}

function buildRoomCardLink(roomName) {    
    // card link
    var cardLink = document.createElement('a');
    cardLink.href = "/room?roomName=" + roomName;
    cardLink.className = "btn btn-primary";
    cardLink.textContent = "Join Room";
    // card link div
    var cardLinkDiv = document.createElement('div');
    cardLinkDiv.className = "card-body";
    cardLinkDiv.appendChild(cardLink);
    return cardLinkDiv;
}

function handleCreateRoomButtonClick() {
    var roomNameInput = document.getElementById('roomNameInput');    
    var roomPasswordInput = document.getElementById('roomPassword');

    // only act if room name has a value
    if (roomNameInput.value) {
        let isPrivateRoom = isSelectedRoomTypePrivateRoom();        
        // make sure password is filled out if private room is selected
        if (!isPrivateRoom || (isPrivateRoom && roomPasswordInput.value)) {
            socket.emit('create room', {
                "roomName": roomNameInput.value,
                "isPrivate": isPrivateRoom,
                "password": roomPasswordInput.value
            });
            window.location.href = "/room?roomName=" + roomNameInput.value;
        }        
    }
}

function isSelectedRoomTypePrivateRoom() {
    var roomTypeRadioButtons = document.getElementsByName('roomTypeInput');

    let isPrivateRoom = false;
    for(roomTypeRadioButtonIndex in roomTypeRadioButtons) {
        if (roomTypeRadioButtons[roomTypeRadioButtonIndex].checked) {
            isPrivateRoom = roomTypeRadioButtons[roomTypeRadioButtonIndex].value === "private";
            break;
        }
    }
    return isPrivateRoom;
}

// used by the create room layer to determine if the password 
// input needs to be filled out or not
function handleRoomTypeClick(roomTypeRadio) {
    var passwordSection = document.getElementById('passwordSection');
    if(roomTypeRadio.checked && roomTypeRadio.value === "private") {
        passwordSection.style.display = "block";
    } else {
        passwordSection.style.display = "none";
    }
}