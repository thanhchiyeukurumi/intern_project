document.addEventListener("DOMContentLoaded", function () {
    function loadComponent(selector, file, callback) {
      fetch(file)
        .then((response) => response.text())
        .then((data) => {
          document.querySelector(selector).innerHTML = data;
          if (callback) callback();
        })
        .catch((error) => console.error("Error loading component:", error));
    }
  
    loadComponent("#navbar", "../components/NavBar.html");
    loadComponent('#navbar-guest','../components/NavBar-guest.html');
    loadComponent("#navbar-user", "../components/Navbar-user.html");
    loadComponent("#navbar-owner", "../components/Navbar-user.html");

    loadComponent("#footer", "../components/Footer.html");
  });
  