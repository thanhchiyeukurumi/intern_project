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
  
  loadComponent("#navbar", "/frontend/html_mockup/src/components/NavBar.html");
  loadComponent('#navbar-guest', "/frontend/html_mockup/src/components/NavBar-guest.html");
  loadComponent("#navbar-user", "/frontend/html_mockup/src/components/NavBar-user.html");
  loadComponent("#navbar-owner", "/frontend/html_mockup/src/components/NavBar-user.html");

  loadComponent("#footer", "/frontend/html_mockup/src/components/Footer.html");
  });
  