const hash = require('../../../kernels/hash');
const db = require('../../../models');
const jwtUtils = require('../../../utils/jwtUtils');

class AuthService {
  // ============================================
  // ĐĂNG KÝ TÀI KHOẢN MỚI - register
  // ============================================
  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin đăng ký: username, fullname, email, password, ...
   * @returns {Object} - User đã đăng ký và token
   */
  async register(userData) {
    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await db.User.findOne({ 
      where: { email: userData.email } 
    });
    
    if (existingEmail) {
      const error = new Error('Email đã được đăng ký.');
      error.statusCode = 409;
      throw error;
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await db.User.findOne({ 
      where: { username: userData.username } 
    });
    
    if (existingUsername) {
      const error = new Error('Tên đăng nhập đã tồn tại.');
      error.statusCode = 409;
      throw error;
    }
    
    // Mã hóa mật khẩu sử dụng kernels/hash
    const hashedPassword = await hash.make(userData.password);
    
    // Lấy role 'user' mặc định
    const userRole = await db.Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
      const error = new Error('Không tìm thấy role mặc định.');
      error.statusCode = 500;
      throw error;
    }
    
    // Tạo user mới
    const newUser = await db.User.create({
      username: userData.username,
      fullname: userData.fullname,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role_id: userRole.id
    });
    
    // Lấy thông tin user với role
    const user = await db.User.findByPk(newUser.id, {
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });
    
    // Loại bỏ password từ response
    const userObj = user.toJSON();
    delete userObj.password;
    
    // Tạo access token JWT
    const token = jwtUtils.sign(
      userObj.id,
      userObj.role?.name || 'user'
    );

    // Tạo refresh token
    const refreshToken = jwtUtils.signRefreshToken(
      userObj.id,
      userObj.role?.name || 'user'
    );
    
    return {
      user: userObj,
      token,
      refreshToken
    };
  }

  // ============================================
  // ĐĂNG NHẬP - login
  // ============================================
  /**
   * Đăng nhập
   * @param {String} email - Email đăng nhập
   * @param {String} password - Mật khẩu đăng nhập
   * @returns {Object} - User đã đăng nhập và token
   */
  async login(email, password) {
    // Tìm user theo email
    const user = await db.User.findOne({
      where: { email: email.toLowerCase() },
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });
    
    if (!user) {
      const error = new Error('Email hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }
    
    // Kiểm tra mật khẩu sử dụng kernels/hash
    const isPasswordValid = await hash.check(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Email hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }
    
    // Loại bỏ password từ response
    const userObj = user.toJSON();
    delete userObj.password;
    
   // Tạo access token JWT
    const token = jwtUtils.sign(
      userObj.id,
      userObj.role?.name || 'user'
    );
    
    // Tạo refresh token
    const refreshToken = jwtUtils.signRefreshToken(
      userObj.id,
      userObj.role?.name || 'user'
    );
    
    return {
      user: userObj,
      token,
      refreshToken
    };
  }

  // ============================================
  /**
   * Xử lý người dùng OAuth
   * @param {Object} oauthUser - Thông tin user từ OAuth provider
   * @returns {Object} - User đã đăng nhập và token
   */
  async handleOAuthUser(oauthUser) {
    // Loại bỏ password từ response
    const userObj = oauthUser;
    
    // Tạo access token
    const token = jwtUtils.sign(
      userObj.id,
      userObj.role?.name || 'user'
    );
    
    // Tạo refresh token
    const refreshToken = jwtUtils.signRefreshToken(
      userObj.id,
      userObj.role?.name || 'user'
    );
    
    return {
      user: userObj,
      token,
      refreshToken
    };
  }

  // ============================================
  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI - getCurrentUser
  // ============================================
  /**
   * Lấy thông tin người dùng hiện tại
   * @param {Number} userId - ID của người dùng
   * @returns {Object} - Thông tin người dùng
   */
  async getCurrentUser(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      const error = new Error('Không tìm thấy người dùng.');
      error.statusCode = 404;
      throw error;
    }
    
    return user;
  }
}

module.exports = new AuthService(); 