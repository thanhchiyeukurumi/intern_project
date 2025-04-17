const userService = require('modules/user/services/userService');
const db = require('models');
const { User } = db;
const { Op } = require('sequelize');

// Mock các models để tránh gọi database thật
jest.mock('models', () => {
  const mockUser = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    finished: false
  };

  const mockSequelize = {
    Op: {
      like: 'like',
      or: 'or',
      ne: 'ne'
    }
  };

  return {
    User: mockUser,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    },
    Sequelize: mockSequelize
  };
});

// Mock module sequelize và Op
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    Op: {
      like: 'like',
      or: 'or',
      ne: 'ne'
    }
  };
});

describe('User Service', () => {
  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('nên trả về danh sách người dùng với phân trang', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ];
      
      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockUsers
      });

      // Act
      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        orderBy: 'username',
        order: 'ASC'
      });

      // Assert
      expect(User.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['username', 'ASC']],
        limit: 10,
        offset: 0,
        attributes: expect.any(Object)
      }));
      
      expect(result).toEqual({
        data: mockUsers,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('nên áp dụng tìm kiếm theo username', async () => {
      // Arrange
      const mockUsers = [{ id: 1, username: 'admin', email: 'admin@example.com' }];
      User.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockUsers
      });

      // Act
      await userService.getAllUsers({
        search: 'admin'
      });

      // Assert
      expect(User.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: expect.anything()
        }
      }));
    });
  });

  describe('getUserById', () => {
    it('nên trả về người dùng khi tìm thấy ID', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'user1', email: 'user1@example.com' };
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(1);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockUser);
    });

    it('nên ném lỗi 404 khi không tìm thấy người dùng', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(999)).rejects.toThrow('Người dùng không tồn tại');
      await expect(userService.getUserById(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createUser', () => {
    it('nên tạo người dùng mới thành công', async () => {
      // Arrange
      const userData = { 
        username: 'newuser', 
        email: 'newuser@example.com',
        password: 'Password123'
      };
      const mockCreatedUser = { id: 3, ...userData };
      
      User.findOne.mockResolvedValue(null); // Không tìm thấy người dùng trùng username
      User.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(userData, expect.any(Object));
      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedUser);
    });

    it('nên ném lỗi 409 khi username đã tồn tại', async () => {
      // Arrange
      const userData = { username: 'existinguser', email: 'new@example.com' };
      User.findOne.mockResolvedValue({ id: 1, username: 'existinguser' });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Tên tài khoản đã tồn tại');
      await expect(userService.createUser(userData)).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('updateUser', () => {
    it('nên cập nhật người dùng thành công', async () => {
      // Arrange
      const id = 1;
      const updateData = { 
        username: 'updateduser', 
        email: 'updated@example.com' 
      };
      const existingUser = { 
        id, 
        username: 'olduser', 
        email: 'old@example.com', 
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return this;
        })
      };
      
      User.findByPk.mockResolvedValue(existingUser);
      User.findOne.mockResolvedValue(null); // Không tìm thấy người dùng trùng tên

      // Act
      const result = await userService.updateUser(id, updateData, 1);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(User.findOne).toHaveBeenCalled();
      expect(existingUser.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(result.username).toBe(updateData.username);
      expect(result.email).toBe(updateData.email);
    });

    it('nên ném lỗi 404 khi không tìm thấy người dùng', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(999, { username: 'test' }, 1)).rejects.toThrow('Người dùng không tồn tại');
      await expect(userService.updateUser(999, { username: 'test' }, 1)).rejects.toHaveProperty('statusCode', 404);
    });

    it('nên ném lỗi 403 khi không có quyền thay đổi role', async () => {
      // Arrange
      const id = 1;
      const updateData = { role_id: 1 };
      const existingUser = { id, username: 'user', role_id: 2 };
      
      User.findByPk.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.updateUser(id, updateData, 2)).rejects.toThrow('Bạn không có quyền thay đổi vai trò người dùng');
      await expect(userService.updateUser(id, updateData, 2)).rejects.toHaveProperty('statusCode', 403);
    });

    it('nên ném lỗi 409 khi username đã tồn tại', async () => {
      // Arrange
      const id = 1;
      const updateData = { username: 'existinguser' };
      const existingUser = { id, username: 'user1' };
      const duplicateUser = { id: 2, username: 'existinguser' };
      
      User.findByPk.mockResolvedValue(existingUser);
      User.findOne.mockResolvedValue(duplicateUser);

      // Act & Assert
      await expect(userService.updateUser(id, updateData, 1)).rejects.toThrow('Tên tài khoản đã tồn tại');
      await expect(userService.updateUser(id, updateData, 1)).rejects.toHaveProperty('statusCode', 409);
    });
  });

  describe('deleteUser', () => {
    it('nên xóa người dùng thành công', async () => {
      // Arrange
      const id = 1;
      const mockUser = { 
        id, 
        username: 'deleteuser', 
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      User.findByPk.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.deleteUser(id)).resolves.not.toThrow();
      expect(User.findByPk).toHaveBeenCalledWith(id, expect.any(Object));
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('nên ném lỗi 404 khi không tìm thấy người dùng', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(999)).rejects.toThrow('Người dùng không tồn tại');
      await expect(userService.deleteUser(999)).rejects.toHaveProperty('statusCode', 404);
    });
  });
}); 