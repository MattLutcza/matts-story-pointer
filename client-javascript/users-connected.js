function initializeUsersConnected(socket) {
    
    var numberOfUsersDisplay = document.getElementById('numberOfUsers');
    var usersConnectedDisplay = document.getElementById('usersConnected');
    
    socket.on('number of users', function (message) {
        // update the number of users display
        numberOfUsersDisplay.textContent = message.numberOfUsersConnected;

        // remove all elements from user display list
        while (usersConnectedDisplay.firstChild) {
            usersConnectedDisplay.removeChild(usersConnectedDisplay.lastChild);
        }

        // update user display list with newest users
        message.users.forEach(user => {
            var userDisplay = document.createElement('li');
            userDisplay.textContent = user;
            userDisplay.className = "list-group-item";
            usersConnectedDisplay.appendChild(userDisplay);
        });
    });

}