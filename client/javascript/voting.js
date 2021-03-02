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

    
    startVotesButton.onclick = function() {
        socket.emit('start voting');            
        startVotesButton.disabled = true;
    }    
    
    clearVotesButton.onclick = function() {
        socket.emit('clear votes');
        startVotesButton.disabled = false;
    }
    
    showVotesButton.onclick = function() {
        socket.emit('show vote results');
        startVotesButton.disabled = false;
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

    // Triggered when voting starts, or when someone submits their vote
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

        // rebuild user voted list
        voteResults.allUsersVoting.forEach(user => {
            var userVoteListItem = createUserVoteWaitListItem(user, voteResults.userVotes);            
            usersVotedDisplay.appendChild(userVoteListItem);
        });

        // if the client voted, then display their vote on their point display
        const userIndex = voteResults.userVotes.findIndex(userVoteInfo => {
            return userVoteInfo.name === socket.appData.userName;
        });  
        if (userIndex === -1) {
            pointSelectionDisplay.textContent = "";
        }

        // depending on if all the users have voted, update headers and 
        // decide if the admin can show the votes
        if (voteResults.allUsersVoting.length === voteResults.userVotes.length) {                      
            voteWaitingHeader.style.display = "none";
            voteCompleteHeader.style.display = "block";                     
            showVotesButton.disabled = false;
            
        } else {
            voteWaitingHeader.style.display = "block";
            voteCompleteHeader.style.display = "none";
            showVotesButton.disabled = true;
        }
    });

    socket.on('clear votes', () => {        
        // clear the user's vote
        pointSelectionDisplay.textContent = "";

        // hide voting ability
        voteSelectionHeader.style.display = "none";
        voteSelectionDisplay.style.display = "none";

        // hide vote waiting section
        voteWaitingDisplay.style.display = "none";

        // clear votes in the waiting section for next time
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }
       
        // and switch headers for next time 
        voteCompleteHeader.style.display = "none";
        voteWaitingHeader.style.display = "block";

        // hide vote results section
        voteResultsDisplay.style.display = "none";

        // disable show votes button (for admin)        
        showVotesButton.disabled = true;        
    }); 
}

function createUserVoteWaitListItem(user, allVotes) {
    // create list item 
    var userVoteDisplay = document.createElement('li');
    userVoteDisplay.className = "list-group-item";
    userVoteDisplay.textContent = user;  

    // if the user has a vote, add badge indicating the user has voted
    const userIndex = allVotes.findIndex(userVoteInfo => {
        return userVoteInfo.name === user;
    });
    if (userIndex >= 0 && allVotes[userIndex].vote) {
        let badge = document.createElement('span');
        badge.textContent += 'voted';
        badge.className = "badge bg-success ms-3";
        userVoteDisplay.appendChild(badge);
    }                
    return userVoteDisplay;
}