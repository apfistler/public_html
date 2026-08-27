function init() {
    var menuVisibility = document.getElementById("menu_visibility");
    var menu = document.getElementById("menu");
    var content = document.getElementById("content");

    menu.addEventListener("click", function(event) {
        var target = event.target;
        if (target.classList.contains("parent")) {
            // Find the child menu associated with the clicked parent
            var childMenu = target.nextElementSibling;
            if (childMenu && childMenu.classList.contains("child-menu")) {
                // Toggle the visibility of child menu
                childMenu.classList.toggle("hidden");
                
                // Add or remove 'active' class from parent menu item
                target.classList.toggle("active");
            }
        }
    });

    // Function to hide the menu
    function hideMenu() {
        menu.style.display = "none";
        menuVisibility.querySelector(".hamburger-icon").style.display = "inline";
        menuVisibility.querySelector(".close-icon").style.display = "none";
        // Add class to content for hidden menu styles
        content.classList.add("hidden-menu");
        // Adjust right margin of content to align with header
        content.style.marginRight = "0";
        // Add a class to the body to indicate menu visibility
        document.body.classList.remove("visible");
    }

    // Function to show the menu
    function showMenu() {
        menu.style.display = "block";
        menuVisibility.querySelector(".hamburger-icon").style.display = "none";
        menuVisibility.querySelector(".close-icon").style.display = "inline";
        // Remove class from content for visible menu styles
        content.classList.remove("hidden-menu");
        // Adjust right margin of content to align with header
        content.style.marginRight = menu.offsetWidth + "px";
        // Add a class to the body to indicate menu visibility
        document.body.classList.add("visible");
    }

    // Function to check screen width and adjust menu and content
    function checkScreenWidth() {
        if (window.innerWidth < 1280) {
            hideMenu();
        } else {
            showMenu();
        }
    }

    // Event listener to handle menu toggle
    menuVisibility.addEventListener("click", function(event) {
        event.preventDefault();
        if (menu.style.display === "none" || menu.style.display === "") {
            showMenu();
        } else {
            hideMenu();
        }
    });

    // Check screen width on page load
    checkScreenWidth();

    // Check screen width when the window is resized
    window.addEventListener("resize", checkScreenWidth);

    // Menu Button Close Functionality
    const messageBox = document.querySelector('.message-box');
    const closeButton = document.querySelector('.close-btn');

    messageBox.style.display = "flex";

    closeButton.addEventListener('click', function () {
        messageBox.style.display = "none";
    });

}

document.addEventListener("DOMContentLoaded", init);

