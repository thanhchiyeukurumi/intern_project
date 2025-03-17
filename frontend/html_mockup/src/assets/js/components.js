document.addEventListener("DOMContentLoaded", function () {
  function loadComponent(selector, file, callback) {
    // Kiểm tra xem selector có tồn tại không
    const element = document.querySelector(selector);
    if (!element) return;
    
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        element.innerHTML = data;
        if (callback) callback();
      })
      .catch((error) => console.error("Error loading component:", error));
  }


  const basePath = "https://thanhchiyeukurumi.github.io/intern_project/html_mockup/src/components/";
  
  loadComponent("#navbar", basePath + "NavBar.html");
  loadComponent('#navbar-guest', basePath + "NavBar-guest.html");
  loadComponent("#navbar-user", basePath + "NavBar-user.html");
  loadComponent("#navbar-owner", basePath + "NavBar-user.html"); 
  
  loadComponent("#footer", basePath + "Footer.html");
});