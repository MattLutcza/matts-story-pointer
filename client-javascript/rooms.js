function createRoomInteractions(socket) {
    
    var numberOfRoomsDisplay = document.getElementById('numberOfRooms');
    var existingRoomsSection = document.getElementById('existingRooms');

    socket.on('users connected', (rooms) => {
        console.log('event users');
        console.log(rooms);
        const roomMap = new Map(rooms.availableRoomMap);      
        console.log(roomMap);  

        // remove all rooms from room display list
        while (existingRoomsSection.firstChild) {
            existingRoomsSection.removeChild(existingRoomsSection.lastChild);
        }

        // rebuild room display list with newest rooms
        var roomCounter = 0;
        roomMap.forEach((room, roomName) => {
            if (room.usersInRoom.length !== 0) {
                roomCounter += 1;                             

                // card title div
                var cardTitleDiv = document.createElement('div');
                cardTitleDiv.className = "card-body";
                // card title header
                var cardTitleHeader = document.createElement('h5');
                cardTitleHeader.className = "card-title";
                cardTitleHeader.textContent = "Room Name: " + roomName;
                cardTitleDiv.appendChild(cardTitleHeader);

                var cardList = document.createElement('ul');
                cardList.className = "list-group list-group-flush";
                var cardUsersListItem = document.createElement('li');
                cardUsersListItem.textContent = "Users In Room: " + room.usersInRoom.length;
                cardUsersListItem.className = "list-group-item";
                var cardTypeListItem = document.createElement('li');
                cardTypeListItem.textContent = room.isPrivate ? "Private Room" : "Public Room";                           
                cardTypeListItem.className = "list-group-item";
                cardList.appendChild(cardUsersListItem);
                cardList.appendChild(cardTypeListItem);

                // card link div
                var cardLinkDiv = document.createElement('div');
                cardLinkDiv.className = "card-body";
                // card link
                var cardLink = document.createElement('a');
                cardLink.href = "/room?roomName=" + roomName;
                cardLink.className = "btn btn-primary";
                cardLink.textContent = "Join Room";
                cardLinkDiv.appendChild(cardLink);

                // overall card div
                var cardDiv = document.createElement('div');
                cardDiv.className = "card mt-3";
                // combine elements
                cardDiv.appendChild(cardTitleDiv);
                cardDiv.appendChild(cardList);
                cardDiv.appendChild(cardLinkDiv);
                existingRoomsSection.appendChild(cardDiv);
            }            
        });
        numberOfRoomsDisplay.textContent = roomCounter;
    });

    var createRoomButton = document.getElementById('createAndNavigate');
    var roomNameInput = document.getElementById('roomNameInput');
    var roomTypeRadioButtons = document.getElementsByName('roomTypeInput');
    var roomPasswordInput = document.getElementById('roomPassword');
    createRoomButton.onclick = function () {
        console.log("hit");
        if (roomNameInput.value) {
            let isPrivateRoom = false;
            for(roomTypeRadioButtonIndex in roomTypeRadioButtons) {
                if (roomTypeRadioButtons[roomTypeRadioButtonIndex].checked) {
                    isPrivateRoom = roomTypeRadioButtons[roomTypeRadioButtonIndex].value === "private";
                }
            }
            console.log(roomPasswordInput.value);
            socket.emit('create room', {
                "roomName": roomNameInput.value,
                "isPrivate": isPrivateRoom,
                "password": roomPasswordInput.value
            });
            window.location.href = "/room?roomName=" + roomNameInput.value;
        }
    };

}

function handleRoomTypeClick(roomTypeRadio) {
    var passwordSection = document.getElementById('passwordSection');
    if(roomTypeRadio.checked && roomTypeRadio.value === "private") {
        passwordSection.style.display = "block";
    } else {
        passwordSection.style.display = "none";
    }
}