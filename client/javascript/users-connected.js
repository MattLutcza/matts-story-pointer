function initializeUsersConnected(socket) {
    
    var numberOfUsersDisplay = document.getElementById('numberOfUsers');
    var usersConnectedDisplay = document.getElementById('usersConnected');
    var adminRadioSelection = document.getElementById('adminRadioSelection');
    
    socket.on('users in room', function (message) {
        console.log('users in room');
        console.log(message);
        // update the number of users display
        numberOfUsersDisplay.textContent = message.usersInRoom.length;

        // remove all elements from user display list
        while (usersConnectedDisplay.firstChild) {
            usersConnectedDisplay.removeChild(usersConnectedDisplay.lastChild);
        }

        while (adminRadioSelection.firstChild) {
            adminRadioSelection.removeChild(adminRadioSelection.lastChild);
        }

        // update user display list with newest users
        message.usersInRoom.forEach(user => {
            var userDisplay = document.createElement('li');
            userDisplay.textContent = user;
            userDisplay.className = "list-group-item";
            usersConnectedDisplay.appendChild(userDisplay);

            //update admin selection (only visible if admin)
            var adminRadioOptionDiv = document.createElement('div');
            adminRadioOptionDiv.className = "form-check";
            var adminRadioOptionInput = document.createElement('input');
            adminRadioOptionInput.type = "radio";
            adminRadioOptionInput.className = "form-check-input";
            adminRadioOptionInput.name = "adminSelection";
            adminRadioOptionInput.id = "adminSelection" + user;
            adminRadioOptionInput.value = user;            
            var adminRadioOptionLabel = document.createElement('label');
            adminRadioOptionLabel.className = "form-check-label";
            adminRadioOptionLabel.htmlFor = "adminSelection" + user;
            adminRadioOptionLabel.textContent = user;

            adminRadioOptionDiv.appendChild(adminRadioOptionInput);
            adminRadioOptionDiv.appendChild(adminRadioOptionLabel);
            adminRadioSelection.appendChild(adminRadioOptionDiv);
        });

        var adminButton = document.getElementById('adminButton');
        var adminRadioButtons = document.getElementsByName('adminSelection');
        adminButton.onclick = function() {
            var newAdmin;
            for(adminRadioButtonIndex in adminRadioButtons) {
                if (adminRadioButtons[adminRadioButtonIndex].checked) {
                    newAdmin = adminRadioButtons[adminRadioButtonIndex].value;
                }
            }
            socket.emit("admin change", newAdmin);
        };       
    });

}
