/**
 * File: admin.js
 * Chức năng: Xử lý các tính năng của trang admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các chức năng liên quan đến ngôn ngữ nếu đang ở trang settings
    initLanguageSettings();
});

/**
 * Khởi tạo các chức năng quản lý ngôn ngữ
 */
function initLanguageSettings() {
    const languageForm = document.getElementById('language-form');
    
    if (languageForm) {
        languageForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const languageInput = document.getElementById('language');
            const languageList = document.getElementById('language-list');
            const newLanguage = languageInput.value.trim();
            
            if (newLanguage) {
                const listItem = document.createElement('li');
                listItem.className = 'flex justify-between items-center p-2 bg-gray-100 rounded-lg';
                listItem.innerHTML = `
                    <span>${newLanguage}</span>
                    <button class="text-red-500 hover:text-red-700 focus:outline-none" onclick="removeLanguage(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                languageList.appendChild(listItem);
                languageInput.value = '';
            }
        });
    }
}

/**
 * Xóa ngôn ngữ khỏi danh sách
 * @param {HTMLElement} button - Nút xóa được nhấn
 */
function removeLanguage(button) {
    const listItem = button.parentElement;
    listItem.remove();
}

/**
 * Xử lý sự kiện khi nhấn vào nút menu trên mobile
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            // Thêm chức năng xử lý menu mobile ở đây
            // TODO: Thêm logic khi cần thiết
        });
    }
}

