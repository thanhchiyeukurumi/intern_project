// Lưu trữ theme trong localStorage
function setTheme(theme) {
    localStorage.setItem('blogger-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// Đọc theme từ localStorage hoặc sử dụng theme mặc định
function initTheme() {
    const savedTheme = localStorage.getItem('blogger-theme');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Nếu đã lưu theme trong localStorage thì sử dụng, nếu không thì dựa vào cài đặt hệ thống
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Chuyển đổi giữa light và dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    updateThemeIcon(newTheme);
}

// Cập nhật biểu tượng của nút chuyển đổi theme
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Khởi tạo nút chuyển đổi theme
function initThemeToggle() {
    // Kiểm tra xem đang ở trang settings hay không
    const isSettingsPage = window.location.pathname.includes('/settings.html');
    
    // Nếu đang ở trang settings, không tạo nút toggle
    if (isSettingsPage) return;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle fixed bottom-4 right-4 z-50';
    toggleButton.setAttribute('id', 'theme-toggle');
    toggleButton.setAttribute('aria-label', 'Chuyển đổi chế độ tối/sáng');
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-moon';
    icon.setAttribute('id', 'theme-icon');
    
    toggleButton.appendChild(icon);
    document.body.appendChild(toggleButton);
    
    toggleButton.addEventListener('click', toggleTheme);
    
    // Cập nhật biểu tượng dựa trên theme hiện tại
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(currentTheme);
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initThemeToggle();
});

// Đối với các trang sử dụng JavaScript để tải nội dung động
// thêm đoạn mã sau vào phần xử lý sau khi tải trang
if (document.readyState === 'complete') {
    initTheme();
    initThemeToggle();
}

// Export các hàm để có thể sử dụng từ các file khác
window.setTheme = setTheme;
window.toggleTheme = toggleTheme; 