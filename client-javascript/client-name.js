function initializeNameInteractions(socket) {
    
    var nameButton = document.getElementById('nameButton');
    var nameInput = document.getElementById('nameInput');
    nameButton.onclick = function () {
        if (nameInput.value) {
            socket.emit('name change', nameInput.value);
        }
    };

    var nameDisplay = document.getElementById('currentName');
    socket.on('name set', (name) => {
        nameDisplay.textContent = name;
    });
}