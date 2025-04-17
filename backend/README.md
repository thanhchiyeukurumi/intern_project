# Hệ thống Authentication & Authorization

## Giới thiệu

Hệ thống xác thực và phân quyền cho ứng dụng Blog, được xây dựng với NodeJS và Sequelize. Hệ thống hỗ trợ:

- Đăng ký, đăng nhập cho người dùng
- Xác thực thông qua OAuth 2.0 với Google và GitHub
- Phân quyền theo vai trò (RBAC) với 4 vai trò: Guest, User, Blogger, Admin
- JWT cho quản lý phiên đăng nhập

## Cài đặt

1. Cài đặt các dependencies:

```bash
npm install
```

2. Cấu hình môi trường:

- Sao chép file `.env.example` thành `.env`
- Cập nhật các biến môi trường cần thiết

3. Khởi tạo cơ sở dữ liệu:

```bash
npm run seed:dev
```

4. Khởi tạo vai trò (roles):

```bash
node scripts/init-roles.js
```

5. Khởi động ứng dụng:

```bash
npm run dev
```

## Cấu trúc API

### Đăng ký tài khoản
```
POST /api/auth/register
```
Request body:
```json
{
  "username": "username",
  "fullname": "Họ và tên",
  "email": "email@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "description": "Giới thiệu về bản thân"
}
```

### Đăng nhập
```
POST /api/auth/login
```
Request body:
```json
{
  "email": "email@example.com",
  "password": "password123"
}
```

### Xác thực Google
```
GET /api/auth/google
```

### Callback Google
```
GET /api/auth/google/callback
```

### Xác thực GitHub
```
GET /api/auth/github
```

### Callback GitHub
```
GET /api/auth/github/callback
```

### Lấy thông tin người dùng hiện tại
```
GET /api/auth/me
```
Authentication: Bearer Token

### Xác thực token
```
GET /api/auth/verify-token
```
Authentication: Bearer Token

## Phân quyền (RBAC)

Hệ thống sử dụng Role-Based Access Control (RBAC) với 4 vai trò:

1. **Guest** (Khách): Chỉ có thể xem nội dung công khai, không cần đăng nhập.
2. **User** (Người dùng): Có thể bình luận, like/unlike, bookmark bài viết sau khi đăng nhập.
3. **Blogger** (Người viết blog): Có thể tạo, sửa, xóa bài viết của mình ngoài các quyền của User.
4. **Admin** (Quản trị viên): Có toàn quyền quản lý hệ thống.

## Cách sử dụng Middleware

### Xác thực người dùng
```javascript
const { auth } = require('kernels/middlewares');

// Áp dụng middleware xác thực
router.get('/protected-route', auth.authenticateJWT, controller.method);
```

### Kiểm tra vai trò
```javascript
const { auth, role } = require('kernels/middlewares');

// Kiểm tra vai trò admin
router.get('/admin/dashboard', auth.authenticateJWT, role.isAdmin, controller.dashboard);

// Kiểm tra nhiều vai trò
router.get('/content/manage', auth.authenticateJWT, role.hasRole(['admin', 'blogger']), controller.manageContent);

// Kiểm tra blogger
router.post('/posts', auth.authenticateJWT, role.isBlogger, controller.createPost);

// Kiểm tra đã đăng nhập
router.get('/profile', auth.authenticateJWT, role.isAuthenticated, controller.getProfile);
```

## Response Format

Tất cả các API đều trả về định dạng thống nhất:

```json
{
  "success": true/false,
  "data": [...dữ liệu hoặc null nếu lỗi...],
  "status": 200,
  "message": "Thông báo"
}
```

## Module Upload

Module Upload được sử dụng để xử lý tải lên file trong ứng dụng. Module này hỗ trợ tải lên file vào Cloudinary hoặc lưu trữ cục bộ.

### Cấu hình

Thêm các biến môi trường sau vào file `.env`:

```
# Cloudinary settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
UPLOAD_FOLDER=uploads
```

### API Upload

#### 1. Upload đơn ảnh

```
POST /api/uploads/image
```

**Yêu cầu**:
- Header: Authorization Bearer Token
- Body: Form-data với field `image` (file)
- Query/Body: `type` (tùy chọn: avatar, thumbnail, post, gallery, product)

**Phản hồi**:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/yourcloudname/image/upload/v1234567890/uploads/filename.jpg",
    "publicId": "uploads/filename",
    "originalName": "original-filename.jpg",
    "size": 12345,
    "format": "jpg",
    "type": "image",
    "width": 800,
    "height": 600,
    "createdAt": "2023-04-13T08:30:00.000Z"
  },
  "status": 201,
  "message": "Upload ảnh thành công"
}
```

#### 2. Upload nhiều ảnh

```
POST /api/uploads/images
```

**Yêu cầu**:
- Header: Authorization Bearer Token
- Body: Form-data với field `images` (nhiều file)
- Query/Body: `type` (tùy chọn: avatar, thumbnail, post, gallery, product)

**Phản hồi**:
```json
{
  "success": true,
  "data": [
    {
      "url": "https://res.cloudinary.com/yourcloudname/image/upload/v1234567890/uploads/filename1.jpg",
      "publicId": "uploads/filename1",
      "originalName": "original-filename1.jpg",
      "size": 12345,
      "format": "jpg",
      "type": "gallery",
      "width": 800,
      "height": 600,
      "createdAt": "2023-04-13T08:30:00.000Z"
    },
    {
      "url": "https://res.cloudinary.com/yourcloudname/image/upload/v1234567890/uploads/filename2.jpg",
      "publicId": "uploads/filename2",
      "originalName": "original-filename2.jpg",
      "size": 54321,
      "format": "jpg",
      "type": "gallery",
      "width": 1200,
      "height": 800,
      "createdAt": "2023-04-13T08:30:00.000Z"
    }
  ],
  "status": 201,
  "message": "Upload nhiều ảnh thành công"
}
```

#### 3. Upload ảnh cho trình soạn thảo (QuillJS)

```
POST /api/uploads/editor
```

**Yêu cầu**:
- Header: Authorization Bearer Token
- Body: Form-data với field `upload` (file)

**Phản hồi**:
```json
{
  "success": 1,
  "file": {
    "url": "https://res.cloudinary.com/yourcloudname/image/upload/v1234567890/uploads/filename.jpg"
  }
}
```

#### 4. Xóa file đã upload

```
DELETE /api/uploads/:publicId
```

**Yêu cầu**:
- Header: Authorization Bearer Token
- Param: `publicId` (ID công khai của file trên Cloudinary)

**Phản hồi**:
```json
{
  "success": true,
  "data": {
    "result": "ok"
  },
  "status": 200,
  "message": "Xóa file thành công"
}
```

### Sử dụng trong QuillJS

Cấu hình QuillJS để upload ảnh:

```javascript
const quill = new Quill('#editor', {
  modules: {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image']
      ],
      handlers: {
        image: imageHandler
      }
    }
  },
  theme: 'snow'
});

function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('upload', file);

    // Upload image to server
    try {
      const response = await fetch('/api/uploads/editor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Access token
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Insert image into editor
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', result.file.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
} 