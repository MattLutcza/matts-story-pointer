function initializeVotingInteractions(socket) {
    
    var voteSelectionHeader = document.getElementById('voteSectionVote');
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
            socket.emit('start voting');            
            startVotesButton.disabled = true;
        }
    }
    if (clearVotesButton) {
        clearVotesButton.onclick = function() {
            socket.emit('clear votes');
            startVotesButton.disabled = false;
        }   
    }
    if (showVotesButton) {
        showVotesButton.onclick = function() {
            socket.emit('show vote results');
            startVotesButton.disabled = false;
        }
    }    
    
    voteButton.onclick = function() {
        for(radioButtonIndex in pointRadioButtons) {
            if (pointRadioButtons[radioButtonIndex].checked) {
                const voteAmount = pointRadioButtons[radioButtonIndex].value;
                socket.emit('user voted', voteAmount);
                pointSelectionDisplay.textContent = voteAmount;                    
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
    };

    // When someone votes - Handle updating the waiting section
    socket.on('user voted', (voteResults) => {        
        // Show the voting section
        voteSelectionHeader.style.display = "block";
        voteSelectionDisplay.style.display = "block";

        // Show the vote waiting section
        voteWaitingDisplay.style.display = "block";

        // hide vote results section until done voting
        voteResultsDisplay.style.display = "none";

        // remove all elements from user voted list
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }
        console.log(voteResults.allUsersVoting);
        console.log(voteResults.userVotes);
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

        const userIndex = voteResults.userVotes.findIndex(userVoteInfo => {
            return userVoteInfo.name === socket.appData.userName;
        });  
        if (userIndex === -1) {
            pointSelectionDisplay.textContent = "";
        }

        if (voteResults.allUsersVoting.length === voteResults.userVotes.length) {                      
            voteWaitingHeader.style.display = "none";
            voteCompleteHeader.style.display = "block";
            // enable the show votes button (if it exists on the page)
            if(showVotesButton) {
                showVotesButton.disabled = false;
            }
        } else {
            voteWaitingHeader.style.display = "block";
            voteCompleteHeader.style.display = "none";
            showVotesButton.disabled = true;
        }
    });

    socket.on('clear votes', () => {
        // hide voting ability
        pointSelectionDisplay.textContent = "";
        voteSelectionHeader.style.display = "none";
        voteSelectionDisplay.style.display = "none";

        // clear vote section
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }
        // hide vote waiting section
        voteWaitingDisplay.style.display = "none";        
        voteWaitingHeader.style.display = "block";
        voteCompleteHeader.style.display = "none";

        // hide vote results section
        voteResultsDisplay.style.display = "none";

        // disable show votes button (if it exists on the page)
        if(showVotesButton) {
            showVotesButton.disabled = true;
        }
    }); 

}