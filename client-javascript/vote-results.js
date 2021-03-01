function handleShowVotingResults(socket) {

    var voteSelectionDisplay = document.getElementById('voteSection');
    var voteWaitingDisplay = document.getElementById('voteWaitingSection');
    var usersVotedDisplay = document.getElementById('usersVoted');   

    var voteResultsDisplay = document.getElementById('voteResultsSection');
    
    // Table Headers
    var headerNA = document.getElementById('headerNA');
    var headerMoreInfo = document.getElementById('headerNeedMoreInfo');  

    // Table Values
    var resultsNA = document.getElementById('resultsNA');
    var resultsMoreInfo = document.getElementById('resultsNeedMoreInfo');
    var resultsAverage = document.getElementById('resultsAverage');

    // When show results is pressed - Handle showing the results
    socket.on('show vote results', (voteResults) => {

        // hide voting ability        
        voteSelectionDisplay.style.display = "none";

        // clear vote section
        while (usersVotedDisplay.firstChild) {
            usersVotedDisplay.removeChild(usersVotedDisplay.lastChild);
        }
        // hide vote waiting section
        voteWaitingDisplay.style.display = "none";

        let voteResultsMap = new Map();
        voteResultsMap.set('1', 0);
        voteResultsMap.set('2', 0);
        voteResultsMap.set('3', 0);
        voteResultsMap.set('5', 0);
        voteResultsMap.set('8', 0);
        voteResultsMap.set('13', 0);
        voteResultsMap.set('Need More Info', 0);
        voteResultsMap.set('N/A', 0);
        let voteSum = 0;
        let counterForAverage = 0;
        
        // Go through results, figure out how many points have how many votes
        for(voteResultIndex in voteResults.userVotes) {
            let vote = voteResults.userVotes[voteResultIndex].vote;           
            voteResultsMap.set(vote, voteResultsMap.get(vote) + 1);
            
            // if the vote is a number, count it towards the average
            if (isNaN(vote) === false) {
                voteSum += Number(vote);
                counterForAverage += 1;
            }
        }

        // Show the results section
        voteResultsDisplay.style.display = "block";
        
        // Calculate and display average result (easiest)
        const average = counterForAverage === 0 ? 0 : voteSum / counterForAverage;                        
        resultsAverage.textContent = average;
        
        // Populate Table with results
        for (const [key, value] of voteResultsMap.entries()) {
            // if the key is a number, then we can do a trick to easily populate the result display
            if (isNaN(key) === false) {
                const resultDisplay = document.getElementById('resultsPoints' + key);
                const headerDisplay = document.getElementById('headerPoints' + key);
                // if value === 0, don't show column              
                if (value === 0) {
                    headerDisplay.style.display = "none";
                    resultDisplay.style.display = "none";
                } else {
                    headerDisplay.style.display = "table-cell";
                    resultDisplay.style.display = "table-cell";
                    resultDisplay.textContent = value;
                }
                
            } else if(key === 'Need More Info') { // Otherwise, we need to check the key to know where it belongs
                if (value === 0) {
                    headerMoreInfo.style.display = "none";
                    resultsMoreInfo.style.display = "none";
                } else {
                    headerMoreInfo.style.display = "table-cell";
                    resultsMoreInfo.style.display = "table-cell";
                    resultsMoreInfo.textContent = value;
                }
                
            } else if(key === 'N/A') {
                if (value === 0) {
                    headerNA.style.display = "none";
                    resultsNA.style.display = "none";
                } else {
                    headerNA.style.display = "table-cell";
                    resultsNA.style.display = "table-cell";
                    resultsNA.textContent = value;
                }
            } else {
                console.log("Unknown Key");
            }
        }
    });   

}