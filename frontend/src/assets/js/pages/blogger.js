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
    
    // Xử lý các nút expand cho bài viết có bản dịch
    initExpandButtons();
    
    // Xử lý các nút xóa bài viết
    initDeletePostButtons();
    
    // Xử lý các trường có thể chỉnh sửa trong trang profile
    initEditableFields();
    
    // Xử lý chức năng chọn theme và ngôn ngữ trong trang settings
    initThemeAndLanguageSettings();
    
    // Xử lý form bình luận trong trang chi tiết bài viết
    initCommentForm();
});

// Khởi tạo các nút dropdown trong bảng
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

// Khởi tạo các nút expand/collapse cho bài viết có bản dịch
function initExpandButtons() {
    const expandButtons = document.querySelectorAll('.expand-btn');
    
    if (expandButtons.length > 0) {
        expandButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Lấy ID của bài viết
                const postId = button.getAttribute('data-post-id');
                // Tìm phần bài viết phụ tương ứng
                const translationContainer = document.getElementById(`translation-${postId}`);
                
                if (translationContainer) {
                    // Toggle class expanded để hiện/ẩn bài viết phụ
                    translationContainer.classList.toggle('expanded');
                    
                    // Xoay biểu tượng mũi tên
                    const icon = button.querySelector('i');
                    if (translationContainer.classList.contains('expanded')) {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    } else {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    }
                }
            });
        });
    }
}

// Khởi tạo các nút xóa bài viết (từ dropdown menu và từ nút xóa trực tiếp ở các bản dịch)
function initDeletePostButtons() {
    // Xử lý nút xóa từ dropdown menu (xóa bài viết gốc)
    const deletePostButtons = document.querySelectorAll('.action-dropdown a[class*="text-red-600"]');
    
    if (deletePostButtons.length > 0) {
        deletePostButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Xác nhận trước khi xóa
                if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Tất cả bản dịch cũng sẽ bị xóa.')) {
                    // Tìm phần tử bài viết cần xóa (div cha với class post-item)
                    const postItem = this.closest('.post-item');
                    
                    if (postItem) {
                        // Xóa bài viết khỏi DOM
                        postItem.remove();
                        
                        // Cập nhật số lượng bài viết
                        updatePostCount();
                    }
                }
            });
        });
    }
    
    // Xử lý nút xóa cho các bản dịch (chỉ xóa bản dịch đó)
    const deleteTranslationButtons = document.querySelectorAll('.translation-container .fa-trash');
    
    if (deleteTranslationButtons.length > 0) {
        deleteTranslationButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Xác nhận trước khi xóa
                if (confirm('Bạn có chắc chắn muốn xóa bản dịch này không?')) {
                    // Tìm phần tử bản dịch cần xóa (div cha với class bg-white)
                    const translationItem = this.closest('.bg-white.rounded-lg');
                    
                    if (translationItem) {
                        // Xóa bản dịch khỏi DOM
                        translationItem.remove();
                    }
                }
            });
        });
    }
}

// Cập nhật số lượng bài viết được hiển thị
function updatePostCount() {
    const postCountElement = document.querySelector('.px-6.py-4.border-b h3');
    const postsContainer = document.querySelector('.divide-y.divide-gray-200');
    
    if (postCountElement && postsContainer) {
        // Đếm số lượng bài viết còn lại
        const remainingPosts = postsContainer.querySelectorAll('.post-item').length;
        
        // Cập nhật text hiển thị
        postCountElement.textContent = `All Posts (${remainingPosts})`;
        
        // Cập nhật phần paging bên dưới
        const pagingText = document.querySelector('.px-6.py-4.border-t .text-sm.text-gray-500');
        if (pagingText) {
            pagingText.textContent = `Showing 1-${remainingPosts} of ${remainingPosts} posts`;
        }
    }
}

// Khởi tạo chức năng xóa comment
function initDeleteCommentButtons() {
    // Tìm tất cả các nút xóa trong các dropdown
    const deleteButtons = document.querySelectorAll('.action-dropdown a');
    
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Chỉ xử lý nút xóa (có icon fa-trash)
                if (this.querySelector('.fa-trash')) {
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

// Khởi tạo chức năng thêm bình luận mới
function initCommentForm() {
    const commentForm = document.querySelector('.post-comment-form');
    const commentTextarea = document.getElementById('comment');
    
    if (commentForm && commentTextarea) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = commentTextarea.value.trim();
            
            if (commentText) {
                // Tạo bình luận mới
                const newComment = createNewComment(commentText);
                
                // Thêm bình luận vào danh sách
                const commentSection = document.querySelector('.post-comment-container');
                
                // Nếu đã có bình luận, thêm vào sau bình luận đầu tiên
                const firstComment = document.querySelector('.post-comment-article');
                if (firstComment) {
                    firstComment.insertAdjacentHTML('afterend', newComment);
                } else {
                    // Nếu chưa có bình luận nào, thêm vào cuối form
                    commentForm.insertAdjacentHTML('afterend', newComment);
                }
                
                // Xóa nội dung textarea
                commentTextarea.value = '';
                
                // Cập nhật số lượng bình luận trong tiêu đề
                updateCommentCountInTitle();
                
                // Khởi tạo dropdown cho bình luận mới
                initCommentDropdowns();
            }
        });
    }
}

// Tạo HTML cho bình luận mới
function createNewComment(commentText) {
    // Lấy ngày hiện tại
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Tạo ID ngẫu nhiên cho dropdown
    const dropdownId = 'dropdown-' + Math.floor(Math.random() * 1000000);
    
    return `
    <article class="post-comment-article p-6 mb-6 text-base bg-white rounded-lg comment-item">
        <footer class="comment-footer flex justify-between items-center mb-2">
            <div class="comment-author flex items-center">
                <p class="inline-flex items-center mr-3 font-semibold text-sm text-gray-900 commenter-name">
                    <img class="commenter-image mr-2 w-6 h-6 rounded-full"
                        src="https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256"
                        alt="User Avatar">
                    thanhthikalyce
                </p>
                <p class="comment-date text-sm text-gray-600">
                    <time pubdate datetime="${now.toISOString()}" title="${formattedDate}">${formattedDate}</time>
                </p>
            </div>
            <button id="dropdownButton${dropdownId}" data-dropdown-toggle="${dropdownId}"
                class="comment-dropdown-button inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
                type="button">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                </svg>
                <span class="sr-only">Comment settings</span>
            </button>
            <!-- Dropdown menu -->
            <div id="${dropdownId}"
                class="comment-dropdown hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow">
                <ul class="dropdown-menu py-1 text-sm text-gray-700 rounded-lg"
                    aria-labelledby="dropdownButton${dropdownId}">
                    <li class="dropdown-item">
                        <a href="#"
                            class="dropdown-link block py-2 px-4 hover:bg-gray-100">Edit</a>
                    </li>
                    <li class="dropdown-item">
                        <a href="#"
                            class="dropdown-link block py-2 px-4 hover:bg-gray-100">Remove</a>
                    </li>
                </ul>
            </div>
        </footer>
        <p class="comment-text">${commentText}</p>
    </article>
    `;
}

// Khởi tạo dropdown cho bình luận
function initCommentDropdowns() {
    const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
    
    dropdownButtons.forEach(button => {
        if (!button.hasAttribute('data-initialized')) {
            const targetId = button.getAttribute('data-dropdown-toggle');
            const dropdown = document.getElementById(targetId);
            
            if (dropdown) {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Đóng tất cả các dropdown khác
                    document.querySelectorAll('.comment-dropdown').forEach(otherDropdown => {
                        if (otherDropdown.id !== targetId) {
                            otherDropdown.classList.add('hidden');
                        }
                    });
                    
                    // Toggle dropdown hiện tại
                    dropdown.classList.toggle('hidden');
                });
                
                // Đánh dấu đã khởi tạo
                button.setAttribute('data-initialized', 'true');
            }
        }
    });
    
    // Đóng tất cả các dropdown khi click bên ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[data-dropdown-toggle]')) {
            document.querySelectorAll('.comment-dropdown').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }
    });
}

// Cập nhật số lượng bình luận trong tiêu đề
function updateCommentCountInTitle() {
    const titleElement = document.querySelector('.post-comment-title');
    if (titleElement) {
        const commentCount = document.querySelectorAll('.post-comment-article').length;
        titleElement.textContent = `Discussion (${commentCount})`;
    }
}

// Khởi tạo các trường có thể chỉnh sửa trong trang profile
function initEditableFields() {
    const editableFields = document.querySelectorAll('.editable-field');
    const saveButton = document.getElementById('saveButton');
    
    if (editableFields.length > 0 && saveButton) {
        // Gắn sự kiện input cho các trường có thể chỉnh sửa
        editableFields.forEach(field => {
            field.addEventListener('input', () => {
                const originalValue = field.dataset.originalValue;
                if (field.textContent.trim() !== originalValue) {
                    saveButton.classList.remove('hidden');
                } else {
                    // Kiểm tra nếu tất cả các trường đều có giá trị ban đầu
                    const anyFieldChanged = Array.from(editableFields).some(field => 
                        field.textContent.trim() !== field.dataset.originalValue
                    );
                    
                    if (!anyFieldChanged) {
                        saveButton.classList.add('hidden');
                    }
                }
            });
        });

        // Gắn sự kiện click cho nút Save
        saveButton.addEventListener('click', () => {
            editableFields.forEach(field => {
                field.dataset.originalValue = field.textContent.trim();
            });
            saveButton.classList.add('hidden');
            // Thông báo lưu thành công
            alert('Thông tin đã được lưu thành công!');
        });
    }
}

// Khởi tạo chức năng chọn theme và ngôn ngữ trong trang settings
function initThemeAndLanguageSettings() {
    // Xử lý theme selection
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    if (themeRadios.length > 0) {
        themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            });
        });
    }

    // Xử lý language selection
    const languageSelect = document.querySelector('select');
    if (languageSelect) {
        languageSelect.addEventListener('change', () => {
            // Thông báo đã chọn ngôn ngữ
            const selectedLanguage = languageSelect.options[languageSelect.selectedIndex].text;
            console.log(`Ngôn ngữ đã chọn: ${selectedLanguage}`);
        });
    }
}

