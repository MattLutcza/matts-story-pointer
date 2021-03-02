function createAdminInteractions(socket) {

    var currentAdmin = document.getElementById('currentAdmin');
    var adminSelection = document.getElementById('adminSelection');    
    var voteButtons = document.getElementById('voteButtons');

    socket.on('new admin', (newAdmin) => {
        // update content in admin information layer
        currentAdmin.textContent = newAdmin.admin;
        
        // check to see if the user is the new admin
        const isAdmin = newAdmin.admin === socket.appData.userName;
        socket.appData.isAdmin = isAdmin;

        // if the client is the admin then show what the admin can see.
        // - the vote controls (buttons)
        // - the ability to change the admin (in admin setting layer)
        if (isAdmin) {            
            voteButtons.style.display = "block";
            adminSelection.style.display = "block";
        } else {               
            voteButtons.style.display = "none";
            adminSelection.style.display = "none";
        }

    });
}