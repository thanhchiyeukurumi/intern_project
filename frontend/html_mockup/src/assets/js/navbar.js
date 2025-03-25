document.addEventListener("DOMContentLoaded", function () {
    const avatarButton = document.getElementById("avatar-button");
    const avatarDropdown = document.getElementById("avatar-dropdown");

    // Toggle menu khi click vào avatar
    avatarButton.addEventListener("click", function (event) {
        event.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
        avatarDropdown.classList.toggle("hidden");
    });

    // Đóng menu nếu click ra ngoài
    document.addEventListener("click", function (event) {
        if (!avatarButton.contains(event.target) && !avatarDropdown.contains(event.target)) {
            avatarDropdown.classList.add("hidden");
        }
    });
});
