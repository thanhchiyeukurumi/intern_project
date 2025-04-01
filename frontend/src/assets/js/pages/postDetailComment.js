/**
 * File: postDetailComment.js
 * Chức năng: Xử lý các tính năng liên quan đến bình luận trong trang chi tiết bài viết
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các sự kiện comment
    initCommentDropdowns();
    setupCommentForm();
});

/**
 * Khởi tạo các chức năng dropdown cho bình luận
 */
function initCommentDropdowns() {
    // Dropdown functionality
    const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
    
    dropdownButtons.forEach(button => {
        const targetId = button.getAttribute('data-dropdown-toggle');
        const dropdown = document.getElementById(targetId);
        
        if (button && dropdown) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
                
                // Position the dropdown below the button
                const buttonRect = this.getBoundingClientRect();
                dropdown.style.position = 'absolute';
                dropdown.style.top = (buttonRect.bottom + window.scrollY) + 'px';
                dropdown.style.right = (window.innerWidth - buttonRect.right) + 'px';
            });
        }
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
        const dropdowns = document.querySelectorAll('.comment-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
}

/**
 * Thiết lập form bình luận
 */
function setupCommentForm() {
    const commentForm = document.querySelector('.post-comment-form');
    
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = document.getElementById('comment').value.trim();
            
            if (commentText) {
                // Gửi bình luận (sẽ thêm chức năng gửi AJAX về sau)
                console.log('Đã gửi bình luận:', commentText);
                
                // Reset form
                document.getElementById('comment').value = '';
                
                // Hiển thị thông báo thành công (tùy chọn) -> this shit chỉ là để thông báo, sao mình k đi lấy mấy cái component có sẵn nhể ?:((((
                alert('Bình luận của bạn đã được gửi thành công!');
            }
        });
    }
}
