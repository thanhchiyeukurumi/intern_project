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
    loadComponent('#navbar-out','../components/NavBar-logout.html');
    loadComponent("#footer", "../components/Footer.html");
  });
  