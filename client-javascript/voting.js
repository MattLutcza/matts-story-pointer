function initializeVotingInteractions(socket) {
    
    var voteSelectionDisplay = document.getElementById('voteSection');
    var pointRadioButtons = document.getElementsByName('pointSelection');
    var pointSelectionDisplay = document.getElementById('pointVote');
    var voteButton = document.getElementById('voteButton');
    
    var voteWaitingDisplay = document.getElementById('voteWaitingSection');
    var voteWaitingHeader = document.getElementById('voteWaitingHeader');
    var voteCompleteHeader = document.getElementById('voteCompleteHeader');
    var usersVotedDisplay = document.getElementById('usersVoted');   

    var startVotesButton = document.getElementById('startVotesButton');
    var clearVotesButton = document.getElementById('clearVotesButton');    
    var showVotesButton = document.getElementById('showVotesButton');

    var voteResultsDisplay = document.getElementById('voteResultsSection');

    if (startVotesButton) {
        startVotesButton.onclick = function() {
            socket.emit('start votes');
        }
    }
    if (clearVotesButton) {
        clearVotesButton.onclick = function() {
            socket.emit('clear votes');
        }   
    }
    if (showVotesButton) {
        showVotesButton.onclick = function() {
            socket.emit('show vote results');
        }
    }

    // When start voting is pressed - Handle that
    socket.on('start votes', (startVotingData) => {
        // Show the voting section
        voteSelectionDisplay.style.display = "block";

        // Show the vote waiting section
        voteWaitingDisplay.style.display = "block";

        // Build initial list of voters
        startVotingData.allUsersVoting.forEach(user => {
            var userVoteDisplay = document.createElement('li');
            userVoteDisplay.textContent = user;
            userVoteDisplay.className = "list-group-item";
            usersVotedDisplay.appendChild(userVoteDisplay);
        });

        voteWaitingHeader.style.display = "block";
        voteCompleteHeader.style.display = "none";
    });
    
    voteButton.onclick = function() {
        for(radioButtonIndex in pointRadioButtons) {
            if (pointRadioButtons[radioButtonIndex].checked) {
                const voteAmount = pointRadioButtons[radioButtonIndex].value;
                socket.emit('vote amount', voteAmount);
                pointSelectionDisplay.textContent = voteAmount;                    
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
    };

    // When someone votes - Handle updating the waiting section
    socket.on('user voted', (voteResults) => {

        // remove all elements from user voted list
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }

        voteResults.allUsersVoting.forEach(user => {
            var userVoteDisplay = document.createElement('li');
            userVoteDisplay.textContent = user;                              
            const userIndex = voteResults.userVotes.findIndex(userVoteInfo => {
                return userVoteInfo.name === user;
            });                
            if (userIndex >= 0 && voteResults.userVotes[userIndex].vote) {
                let badge = document.createElement('span');
                badge.textContent += 'voted';
                badge.className = "badge bg-success ms-3";
                userVoteDisplay.appendChild(badge);
            }
            userVoteDisplay.className = "list-group-item";
            usersVotedDisplay.appendChild(userVoteDisplay);
        });

        if (voteResults.allUsersVoting.length === voteResults.userVotes.length) {                      
            voteWaitingHeader.style.display = "none";
            voteCompleteHeader.style.display = "block";
            // enable the show votes button (if it exists on the page)
            if(showVotesButton) {
                showVotesButton.disabled = false;
            }
        }          
    });

    socket.on('clear votes', () => {
        // hide voting ability
        pointSelectionDisplay.textContent = "";
        voteSelectionDisplay.style.display = "none";

        // clear vote section
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }
        // hide vote waiting section
        voteWaitingDisplay.style.display = "none";

        // hide vote results section
        voteResultsDisplay.style.display = "none";

        // disable show votes button (if it exists on the page)
        if(showVotesButton) {
            showVotesButton.disabled = true;
        }
    }); 

}