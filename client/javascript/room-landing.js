function initialRoomLandingInteractions(socket) {

    // create app data for the client
    socket.appData = {};

    // get the room name from the query parameter
    const roomName = getParameterByName('roomName');

    // if there is a valid query parameter, get the room information from the server
    if (roomName) {
        socket.emit('get room information', roomName);
    } else {
        // if no valid query parameter, send them back to the home page
        window.location.href = "/home";
    }

    var passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    let timer;
    
    socket.on('room information', roomInformation => {
        // if the room exists, is marked private, and you are not the one who created 
        // the private room (you are not the first user) then open up the password layer
        if (roomInformation && 
            roomInformation.isPrivate &&
            roomInformation.usersInRoom.length > 0) {
            // ten seconds to submit the password before sent to homepage
            timer = setTimeout(()=> {                    
                window.location.href = "/home";
            }, 10_000);
            passwordModal.show();
        } else {
            // if room doesn't exist, or if it is public, or if you are the person who created the 
            // private room (no users currently in the private room), then you can simply join
            socket.emit('join room', {
                "roomName": roomName
            });
        }
    });

    // handle password layer
    var roomPasswordInput = document.getElementById('roomPassword');        
    var withPasswordButton = document.getElementById('withPasswordButton');
    withPasswordButton.onclick = function () {
        if (roomPasswordInput.value) {
            if (timer) {
                clearTimeout(timer)
            }                
            socket.emit('join room', {
                "roomName": roomName,
                "password": roomPasswordInput.value
            });
            passwordModal.hide();
        }
    };
    
    socket.on('access denied', () => {
        window.location.href = "/home";
    });
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}