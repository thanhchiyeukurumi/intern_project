/**
 * File: admin.js
 * Chức năng: Xử lý các tính năng của trang admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo menu mobile cho tất cả các trang
    initMobileMenu();
    
    // Khởi tạo các tính năng cho từng trang cụ thể
    initCategoriesPage();
    initPostsPage();
    initUsersPage();
    initLanguageSettings();
});

/**
 * ==============================
 * CHỨC NĂNG DÙNG CHUNG CHO CÁC TRANG
 * ==============================
 */

/**
 * Xử lý sự kiện khi nhấn vào nút menu trên mobile
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.querySelector('aside');
    
    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
        });
    }
}

/**
 * ==============================
 * CHỨC NĂNG CHO TRANG CATEGORIES
 * ==============================
 */

/**
 * Khởi tạo chức năng cho trang quản lý danh mục
 */
function initCategoriesPage() {
    // Khởi tạo toggle form thêm danh mục
    window.toggleAddForm = function() {
        const form = document.getElementById("addCategoryForm");
        if (form) {
            form.classList.toggle("hidden");
        }
    };

    // Xử lý xóa danh mục
    document.addEventListener("click", function(e) {
        if (e.target.closest(".delete-category-btn")) {
            if (confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
                e.target.closest("tr").remove();
            }
        }
    });

    // Xử lý thêm danh mục
    const addCategoryButton = document.querySelector("button[type='submit-form']");
    if (addCategoryButton) {
        addCategoryButton.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const formElement = this.closest('form');
            const categoryNameInput = formElement.querySelector('input');
            const parentCategorySelect = formElement.querySelector('select');
            
            const categoryName = categoryNameInput.value.trim();
            const parentCategory = parentCategorySelect.options[parentCategorySelect.selectedIndex].text;
            
            // Kiểm tra tên danh mục không được để trống
            if (!categoryName) {
                alert("Vui lòng nhập tên danh mục");
                return;
            }
            
            // Tạo dòng mới cho bảng
            const tableBody = document.querySelector('tbody');
            const newRow = document.createElement('tr');
            
            // Tạo cấu trúc HTML cho dòng mới
            newRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <input type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${categoryName}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button class="text-red-600 hover:text-red-900 delete-category-btn"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            
            // Thêm dòng mới vào bảng
            tableBody.appendChild(newRow);
            
            // Làm sạch form
            categoryNameInput.value = '';
            parentCategorySelect.selectedIndex = 0;
            
            // Hiển thị thông báo thành công
            alert("Đã thêm danh mục thành công!");
            
            // Ẩn form sau khi thêm
            toggleAddForm();
        });
    }

    // Xử lý checkbox chọn tất cả
    const selectAllCheckbox = document.querySelector("thead input[type='checkbox']");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function() {
            document.querySelectorAll("tbody input[type='checkbox']").forEach(cb => cb.checked = this.checked);
        });
    }

    // Xử lý bulk action
    const bulkActionButton = document.querySelector("button[text='Apply']");
    if (bulkActionButton) {
        bulkActionButton.addEventListener("click", function() {
            const action = document.querySelector("select").value;
            if (action === "delete") {
                if (confirm("Bạn có chắc chắn muốn xóa các danh mục đã chọn không?")) {
                    document.querySelectorAll("tbody input[type='checkbox']:checked").forEach(cb => cb.closest("tr").remove());
                }
            }
        });
    }
}

/**
 * ==============================
 * CHỨC NĂNG CHO TRANG POSTS
 * ==============================
 */

/**
 * Khởi tạo chức năng cho trang quản lý bài viết
 */
function initPostsPage() {
    // Xử lý xóa bài viết
    document.addEventListener("click", function(e) {
        if (e.target.closest(".text-red-600")) {
            if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
                e.target.closest("tr").remove();
            }
        }
    });

    // Xử lý checkbox chọn tất cả
    const selectAllCheckbox = document.querySelector("thead input[type='checkbox']");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function() {
            document.querySelectorAll("tbody input[type='checkbox']").forEach(cb => cb.checked = this.checked);
        });
    }

    // Xử lý bulk action
    const bulkActionSelect = document.querySelector("select");
    const applyButton = document.querySelector("button.ml-2");

    if (applyButton) {
        applyButton.addEventListener("click", function() {
            const selectedAction = bulkActionSelect.value;
            if (!selectedAction) {
                alert("Vui lòng chọn một hành động.");
                return;
            }
            
            const selectedPosts = Array.from(document.querySelectorAll("tbody input[type='checkbox']")).filter(checkbox => checkbox.checked);
            if (selectedPosts.length === 0) {
                alert("Vui lòng chọn ít nhất một bài viết.");
                return;
            }

            const confirmAction = confirm(`Bạn có chắc chắn muốn ${selectedAction} ${selectedPosts.length} bài viết đã chọn không?`);
            if (confirmAction) {
                alert(`Đã áp dụng hành động '${selectedAction}' cho ${selectedPosts.length} bài viết.`);
            }
        });
    }
}

/**
 * ==============================
 * CHỨC NĂNG CHO TRANG USERS
 * ==============================
 */

/**
 * Khởi tạo chức năng cho trang quản lý người dùng
 */
function initUsersPage() {
    // Xử lý xóa người dùng
    document.addEventListener("click", function(e) {
        if (e.target.closest(".text-red-600")) {
            if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
                e.target.closest("tr").remove();
            }
        }
    });

    // Xử lý checkbox chọn tất cả
    const selectAllCheckbox = document.querySelector("thead input[type='checkbox']");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function() {
            document.querySelectorAll("tbody input[type='checkbox']").forEach(cb => cb.checked = this.checked);
        });
    }

    // Xử lý bulk action
    const bulkActionSelect = document.querySelector("select");
    const bulkApplyButton = document.querySelector("button.bg-gray-200");
    
    if (bulkApplyButton) {
        bulkApplyButton.addEventListener("click", function() {
            const selectedAction = bulkActionSelect.value;
            const selectedUsers = [...document.querySelectorAll("tbody input[type='checkbox']")].filter(checkbox => checkbox.checked);
            
            if (selectedUsers.length === 0) {
                alert("Vui lòng chọn ít nhất một người dùng.");
                return;
            }
            
            if (selectedAction === "delete") {
                if (!confirm("Bạn có chắc chắn muốn xóa các người dùng đã chọn không?")) {
                    return;
                }
                
                selectedUsers.forEach(user => user.closest("tr").remove());
            }
        });
    }
}

/**
 * ==============================
 * CHỨC NĂNG CHO TRANG SETTINGS
 * ==============================
 */

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

    // Thêm hàm xóa ngôn ngữ vào window để có thể gọi từ onclick
    window.removeLanguage = function(button) {
        const listItem = button.closest('li');
        if (listItem) {
            listItem.remove();
        }
    };
}

