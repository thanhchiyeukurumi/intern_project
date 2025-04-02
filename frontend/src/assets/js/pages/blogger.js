// Xử lý Dropdown cho User Profile
document.addEventListener('DOMContentLoaded', function() {
    // Dropdown Toggle
    const dropdownButton = document.getElementById('userDropdownButton');
    const dropdown = document.getElementById('userDropdown');

    if (dropdownButton && dropdown) {
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
            dropdown.classList.toggle('hidden', isExpanded);
            dropdownButton.setAttribute('aria-expanded', !isExpanded);
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.add('hidden');
                dropdownButton.setAttribute('aria-expanded', 'false');
                
                // Đồng thời đóng các action dropdown
                document.querySelectorAll('.action-dropdown').forEach(dropdown => {
                    dropdown.classList.add('hidden');
                });
            }
        });
    }
    
    // Xử lý Action button dropdowns
    initActionDropdowns();
    
    // Xử lý các nút xóa comment
    initDeleteCommentButtons();
});

// Khởi tạo các nút dropdown trong bảng comments
function initActionDropdowns() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    if (actionButtons.length > 0) {
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetDropdown = document.getElementById(button.dataset.dropdown);
                
                if (targetDropdown) {
                    // Đóng tất cả các dropdown khác
                    document.querySelectorAll('.action-dropdown').forEach(dropdown => {
                        if (dropdown.id !== button.dataset.dropdown) {
                            dropdown.classList.add('hidden');
                        }
                    });
                    
                    // Hiển thị/ẩn dropdown hiện tại
                    targetDropdown.classList.toggle('hidden');
                }
            });
        });
        
        // Đóng tất cả các dropdown khi click bên ngoài
        document.addEventListener('click', () => {
            document.querySelectorAll('.action-dropdown').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        });
    }
}

// Khởi tạo chức năng xóa comment
function initDeleteCommentButtons() {
    // Tìm tất cả các nút xóa trong các dropdown
    const deleteButtons = document.querySelectorAll('.action-dropdown a');
    
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Xác nhận trước khi xóa
                if (confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
                    // Tìm phần tử comment cần xóa (div cha chứa cả comment và nút dropdown)
                    const commentItem = this.closest('.px-6.py-4.flex');
                    
                    if (commentItem) {
                        // Xóa comment khỏi DOM
                        commentItem.remove();
                        
                        // Cập nhật số lượng comment
                        updateCommentCount();
                    }
                }
            });
        });
    }
}

// Cập nhật số lượng comments được hiển thị
function updateCommentCount() {
    const commentCountElement = document.querySelector('.px-6.py-4.border-b h3');
    const commentsContainer = document.querySelector('.divide-y.divide-gray-200');
    
    if (commentCountElement && commentsContainer) {
        // Đếm số lượng comment còn lại
        const remainingComments = commentsContainer.querySelectorAll('.px-6.py-4.flex').length;
        
        // Cập nhật text hiển thị
        commentCountElement.textContent = `All Comments (${remainingComments})`;
        
        // Cập nhật phần paging bên dưới
        const pagingText = document.querySelector('.px-6.py-4.border-t .text-sm.text-gray-500');
        if (pagingText) {
            pagingText.textContent = `Showing 1-${remainingComments} of ${remainingComments} comments`;
        }
    }
}

