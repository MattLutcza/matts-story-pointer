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

        // if admin - show what the admin can see.
        if (isAdmin) {            
            voteButtons.style.display = "block";
            // show admin selection in the admin info layer
            adminSelection.style.display = "block";
        } else {
            // otherwise hide those sections            
            voteButtons.style.display = "none";
            adminSelection.style.display = "none";
        }

    });
}