const authService = require('modules/auth/services/authService');
const hash = require('kernels/hash');
const jwtUtils = require('utils/jwtUtils');
const db = require('models');

// Mock các module và dependencies
jest.mock('kernels/hash', () => ({
  make: jest.fn(),
  check: jest.fn()
}));

jest.mock('utils/jwtUtils', () => ({
  sign: jest.fn(),
  signRefreshToken: jest.fn()
}));

jest.mock('models', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    toJSON: jest.fn()
  };

  const mockRole = {
    findOne: jest.fn()
  };

  return {
    User: mockUser,
    Role: mockRole
  };
});

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('nên đăng ký người dùng mới thành công', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        fullname: 'New User',
        email: 'newuser@example.com',
        password: 'Password123'
      };
      
      const hashedPassword = 'hashed_password_123';
      const userRole = { id: 2, name: 'user' };
      const createdUser = { id: 1, ...userData, password: hashedPassword, role_id: userRole.id };
      
      const userWithRole = {
        ...createdUser,
        role: userRole,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          username: userData.username,
          fullname: userData.fullname,
          email: userData.email,
          role_id: userRole.id,
          role: userRole
        })
      };
      
      const token = 'jwt_token_123';
      const refreshToken = 'refresh_token_123';
      
      // Mocks
      db.User.findOne.mockResolvedValueOnce(null); // Email chưa tồn tại
      db.User.findOne.mockResolvedValueOnce(null); // Username chưa tồn tại
      hash.make.mockResolvedValue(hashedPassword);
      db.Role.findOne.mockResolvedValue(userRole);
      db.User.create.mockResolvedValue(createdUser);
      db.User.findByPk.mockResolvedValue(userWithRole);
      jwtUtils.sign.mockReturnValue(token);
      jwtUtils.signRefreshToken.mockReturnValue(refreshToken);
      
      // Act
      const result = await authService.register(userData);
      
      // Assert
      expect(db.User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(db.User.findOne).toHaveBeenCalledWith({ where: { username: userData.username } });
      expect(hash.make).toHaveBeenCalledWith(userData.password);
      expect(db.Role.findOne).toHaveBeenCalledWith({ where: { name: 'user' } });
      expect(db.User.create).toHaveBeenCalledWith({
        username: userData.username,
        fullname: userData.fullname,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role_id: userRole.id
      });
      expect(jwtUtils.sign).toHaveBeenCalledWith(1, 'user');
      expect(jwtUtils.signRefreshToken).toHaveBeenCalledWith(1, 'user');
      
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 1,
          username: userData.username,
          fullname: userData.fullname,
          email: userData.email
        }),
        token,
        refreshToken
      });
      expect(result.user.password).toBeUndefined();
    });
    
    it('nên ném lỗi khi email đã tồn tại', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Password123'
      };
      
      db.User.findOne.mockResolvedValueOnce({ id: 1, email: userData.email });
      
      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email đã được đăng ký.');
      await expect(authService.register(userData)).rejects.toHaveProperty('statusCode', 409);
    });
    
    it('nên ném lỗi khi username đã tồn tại', async () => {
      // Arrange
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'Password123'
      };
      
      db.User.findOne.mockResolvedValueOnce(null); // Email chưa tồn tại
      db.User.findOne.mockResolvedValueOnce({ id: 1, username: userData.username }); // Username đã tồn tại
      
      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Tên đăng nhập đã tồn tại.');
      await expect(authService.register(userData)).rejects.toHaveProperty('statusCode', 409);
    });
  });
  
  describe('login', () => {
    it('nên đăng nhập thành công', async () => {
      // Arrange
      const loginData = {
        email: 'user@example.com',
        password: 'Password123'
      };
      
      const userRecord = {
        id: 1,
        username: 'user',
        email: loginData.email,
        password: 'hashed_password',
        role: { id: 2, name: 'user' },
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          username: 'user',
          email: loginData.email,
          role: { id: 2, name: 'user' }
        })
      };
      
      const token = 'jwt_token_123';
      const refreshToken = 'refresh_token_123';
      
      // Mocks
      db.User.findOne.mockResolvedValue(userRecord);
      hash.check.mockResolvedValue(true);
      jwtUtils.sign.mockReturnValue(token);
      jwtUtils.signRefreshToken.mockReturnValue(refreshToken);
      
      // Act
      const result = await authService.login(loginData.email, loginData.password);
      
      // Assert
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: loginData.email.toLowerCase() },
        include: [{ model: db.Role, as: 'role' }]
      });
      expect(hash.check).toHaveBeenCalledWith(loginData.password, userRecord.password);
      expect(jwtUtils.sign).toHaveBeenCalledWith(1, 'user');
      expect(jwtUtils.signRefreshToken).toHaveBeenCalledWith(1, 'user');
      
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 1,
          username: 'user',
          email: loginData.email
        }),
        token,
        refreshToken
      });
      expect(result.user.password).toBeUndefined();
    });
    
    it('nên ném lỗi khi email không tồn tại', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };
      
      db.User.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow('Email hoặc mật khẩu không chính xác.');
      await expect(authService.login(loginData.email, loginData.password)).rejects.toHaveProperty('statusCode', 401);
    });
    
    it('nên ném lỗi khi mật khẩu không đúng', async () => {
      // Arrange
      const loginData = {
        email: 'user@example.com',
        password: 'WrongPassword'
      };
      
      const userRecord = {
        id: 1,
        email: loginData.email,
        password: 'hashed_password'
      };
      
      // Mocks
      db.User.findOne.mockResolvedValue(userRecord);
      hash.check.mockResolvedValue(false);
      
      // Act & Assert
      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow('Email hoặc mật khẩu không chính xác.');
      await expect(authService.login(loginData.email, loginData.password)).rejects.toHaveProperty('statusCode', 401);
    });
  });
  
  describe('getCurrentUser', () => {
    it('nên trả về thông tin người dùng hiện tại', async () => {
      // Arrange
      const userId = 1;
      const userRecord = {
        id: userId,
        username: 'user',
        email: 'user@example.com'
      };
      
      // Mocks
      db.User.findByPk.mockResolvedValue(userRecord);
      
      // Act
      const result = await authService.getCurrentUser(userId);
      
      // Assert
      expect(db.User.findByPk).toHaveBeenCalledWith(userId, {
        attributes: { exclude: ['password'] }
      });
      expect(result).toEqual(userRecord);
    });
    
    it('nên ném lỗi khi không tìm thấy người dùng', async () => {
      // Arrange
      const userId = 999;
      
      // Mocks
      db.User.findByPk.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.getCurrentUser(userId)).rejects.toThrow('Không tìm thấy người dùng.');
      await expect(authService.getCurrentUser(userId)).rejects.toHaveProperty('statusCode', 404);
    });
  });
  
  describe('handleOAuthUser', () => {
    it('nên xử lý người dùng OAuth thành công', async () => {
      // Arrange
      const oauthUser = {
        id: 1,
        username: 'oauth_user',
        email: 'oauth@example.com',
        role: { name: 'user' }
      };
      
      const token = 'jwt_token_123';
      const refreshToken = 'refresh_token_123';
      
      // Mocks
      jwtUtils.sign.mockReturnValue(token);
      jwtUtils.signRefreshToken.mockReturnValue(refreshToken);
      
      // Act
      const result = await authService.handleOAuthUser(oauthUser);
      
      // Assert
      expect(jwtUtils.sign).toHaveBeenCalledWith(1, 'user');
      expect(jwtUtils.signRefreshToken).toHaveBeenCalledWith(1, 'user');
      
      expect(result).toEqual({
        user: oauthUser,
        token,
        refreshToken
      });
    });
  });
}); 