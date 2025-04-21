// Hàm này OK
function setTheme(theme) {
    localStorage.setItem('blogger-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Gọi cập nhật icon ngay khi set theme
    updateThemeIcon(theme);
}

// Hàm này cần xem xét kỹ
function initTheme() {
    // Ưu tiên 1: Lấy theme đã lưu
    const savedTheme = localStorage.getItem('blogger-theme');

    // Ưu tiên 2: Lấy theme từ hệ thống OS
    // !!window.matchMedia(...) trả về true nếu media query khớp, false nếu không
    const prefersDarkMode = !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let currentTheme;

    if (savedTheme) {
        // Nếu có lưu trong localStorage, dùng nó
        currentTheme = savedTheme;
    } else if (prefersDarkMode) {
        // Nếu không có trong localStorage VÀ hệ thống đang là dark mode, dùng dark
        currentTheme = 'dark';
    } else {
        // Mặc định là light nếu không có gì ở trên
        currentTheme = 'light';
    }

    // Áp dụng theme tìm được
    document.documentElement.setAttribute('data-theme', currentTheme);
    // Cập nhật icon dựa trên theme vừa áp dụng
    updateThemeIcon(currentTheme);
}

// Hàm này OK
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme); // setTheme đã bao gồm updateThemeIcon
}

// Hàm này OK, nhưng cần đảm bảo ID icon đúng
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return; // Quan trọng: kiểm tra icon tồn tại

    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Hàm này sẽ thay đổi nếu bạn đưa nút vào HTML
function initThemeToggle() {
    // Kiểm tra xem có phải trang settings không (để không tạo nút ở trang settings)
    const isSettingsPage = window.location.pathname.includes('/settings.html');
    if (isSettingsPage) return; // Giữ nguyên logic này

    // --- PHẦN TẠO NÚT ĐỘNG ---
    // Bạn có thể giữ nguyên phần này nếu muốn, hoặc làm theo Bước 4 bên dưới

    const existingToggleButton = document.getElementById('theme-toggle');
    // Chỉ tạo nút nếu nó chưa tồn tại
    if (!existingToggleButton) {
        const toggleButton = document.createElement('button');
        // Quan trọng: Gán ID để có thể tìm thấy sau này nếu cần
        toggleButton.setAttribute('id', 'theme-toggle');
        // Thêm class để định vị và tạo kiểu CƠ BẢN (màu sắc nên dùng var)
        toggleButton.className = 'theme-toggle fixed bottom-4 right-4 z-50 p-3 rounded-full bg-[var(--blogger-bg-card)] text-[var(--blogger-text-primary)] shadow-md border border-[var(--blogger-border-color)]'; // Ví dụ class
        toggleButton.setAttribute('aria-label', 'Chuyển đổi chế độ tối/sáng');

        const icon = document.createElement('i');
        icon.className = 'fas'; // Chỉ cần class fas ban đầu
        icon.setAttribute('id', 'theme-icon'); // ID cho icon để updateThemeIcon hoạt động

        toggleButton.appendChild(icon);
        document.body.appendChild(toggleButton);

        toggleButton.addEventListener('click', toggleTheme);
    } else {
         // Nếu nút đã tồn tại (do ở trong HTML hoặc tạo trước đó), chỉ cần gắn listener
         existingToggleButton.removeEventListener('click', toggleTheme); // Xóa listener cũ phòng trường hợp chạy lại
         existingToggleButton.addEventListener('click', toggleTheme);
    }

     // Cập nhật biểu tượng dựa trên theme hiện tại (đã được gọi trong initTheme)
     // const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
     // updateThemeIcon(currentTheme); // Dòng này có thể không cần nếu initTheme đã gọi
}

// --- Phần khởi chạy ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    initTheme(); // Chạy initTheme ĐẦU TIÊN để xác định và áp dụng theme
    initThemeToggle(); // Sau đó mới khởi tạo nút (hoặc gắn listener cho nút có sẵn)
});

// Bạn có thể bỏ phần kiểm tra readystate này nếu đã dùng DOMContentLoaded
// if (document.readyState === 'complete') {
//     initTheme();
//     initThemeToggle();
// }

// Vẫn giữ export nếu cần gọi từ nơi khác (ít khả năng)
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;