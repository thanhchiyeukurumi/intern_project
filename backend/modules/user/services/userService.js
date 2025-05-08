const db = require('models');
const {User, Role} = db;
const { Op } = require('sequelize');

class UserService {
    // ============================================
    // LẤY DANH SÁCH NGƯỜI DÙNG - getAllUsers
    // ============================================
    /**
     * @desc: Lấy danh sách tất cả người dùng (có phân trang, tìm kiếm, sắp xếp)
     * @param {Object} options - { page, limit, search, orderBy, order }
     * @returns {Object} { data: [...], pagination: { total, page, limit } }
     */
    async getAllUsers(options = {}) {
        try {
            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 10;
            const search = options.search || null;
            const orderBy = options.orderBy || 'createdAt';
            const order = options.order || 'DESC';
            const includeRelations = options.includeRelations || false;
            const roleId = options.role_id ? parseInt(options.role_id, 10) : null;
            
            const offset = (page - 1) * limit;
            const where = {};

            if (search) {
                where[Op.or] = [
                    { username: { [Op.like]: `%${search}%` } }
                ]; 
            }

            if (roleId) {
                where.role_id = roleId;
            }

            const queryOptions = {
                where,
                include: includeRelations? [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    }
                ]:[],
                order: [[orderBy, order]],
                offset,
                limit,
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            };

            const { count, rows } = await User.findAndCountAll(queryOptions);   
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };  
        } catch (err) {
            throw err;
        }
    }   

    // ============================================
    // LẤY THÔNG TIN NGƯỜI DÙNG THEO ID - getUserById
    // ============================================
    /**
     * @desc: Lấy thông tin người dùng theo id
     * @param {number} id - id của người dùng
     * @returns {Object} { data: user }
     */
    async getUserById(id) { 
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            return user; 
        } catch (err) {
            throw err;
        }
    }

    // ============================================
    // TẠO NGƯỜI DÙNG MỚI - createUser
    // ============================================
    /**
     * @deprecated: Không sử dụng (Admin không tạo người dùng)
     * @param {Object} data - Dữ liệu người dùng
     * @returns {Object} { data: user }
     */
    async createUser(data) {    
        const transaction = await db.sequelize.transaction();
        try {
            const existingUser = await User.findOne({
                where: {
                    username: data.username
                },
                transaction
            });
            if (existingUser) {
                await transaction.rollback();
                const error = new Error('Tên tài khoản đã tồn tại');
                error.statusCode = 409;
                throw error;
            }
            const user = await User.create(data, { transaction });
            await transaction.commit();
            return user;
        } catch (err) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    // ============================================
    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG - updateUser
    // ============================================
    /**
     * @param {number} id - id của người dùng
     * @param {Object} data - Dữ liệu người dùng
     * @returns {Object} { data: user }
     */
    async updateUser(id, data, role) {
        const transaction = await db.sequelize.transaction();
        try {
            const user = await User.findByPk(id, { transaction });
            if (!user) {
                await transaction.rollback();
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            
            // 2. Kiểm tra quyền thay đổi role
            if (data.role_id && role != 1) {
                await transaction.rollback();
                const error = new Error('Bạn không có quyền thay đổi vai trò người dùng');
                error.statusCode = 403;
                throw error;
            }

            // Kiểm tra xem username hoặc email có bị thay đổi không
            const usernameChanged = data.username && data.username !== user.username;
            const emailChanged = data.email && data.email !== user.email;
            
            // Chỉ kiểm tra trùng lặp nếu có thay đổi
            if (usernameChanged || emailChanged) {
                const whereConditions = [];
                
                if (usernameChanged) {
                    whereConditions.push({
                        username: data.username,
                        id: { [Op.ne]: id } // Loại trừ user hiện tại
                    });
                }
                
                if (emailChanged) {
                    whereConditions.push({
                        email: data.email,
                        id: { [Op.ne]: id } // Loại trừ user hiện tại
                    });
                }
                               
                // Kiểm tra xem có user nào khác sử dụng username hoặc email này không
                if (whereConditions.length > 0) {
                    const existingUser = await User.findOne({
                        where: { [Op.or]: whereConditions },
                        transaction
                    });
                    
                    if (existingUser) {
                        await transaction.rollback();
                        const error = new Error(
                            existingUser.username === data.username 
                            ? 'Tên tài khoản đã tồn tại' 
                            : 'Email đã tồn tại'
                        );
                        error.statusCode = 409;
                        throw error;
                    }
                }
            }
            
            await user.update(data, { transaction });
            await transaction.commit();
            return user;
        } catch (err) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }   
            throw err;
        }
    }

    // ============================================
    // XÓA NGƯỜI DÙNG - deleteUser
    // ============================================
    /**
     * @param {number} id - id của người dùng
     * @returns {Object} { data: user }
     */ 
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                const error = new Error('Người dùng không tồn tại');
                error.statusCode = 404;
                throw error;
            }
            await user.destroy();
        } catch (err) {
            throw err;
        }
    }   

    // ============================================
    // LẤY THỐNG KÊ NGƯỜI DÙNG THEO KHOẢNG THỜI GIAN - getUsersByDateRange
    // ============================================
    /**
     * @desc: Lấy thống kê người dùng theo khoảng thời gian
     * @param {Object} options - { startDate, endDate, groupBy }
     * @returns {Object} { stats, total }
     */
    async getUsersByDateRange(options = {}) {
        try {
            const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const endDate = options.endDate ? new Date(options.endDate) : new Date();
            const groupByInterval = options.groupBy || 'day'; // 'day', 'week', 'month'
            
            // Xác định trường group by dựa trên interval
            let dateFormat;
            switch (groupByInterval) {
                case 'week':
                    dateFormat = "DATE_FORMAT(created_at, '%Y-%u')";
                    break;
                case 'month':
                    dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
                    break;
                default: // day
                    dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
                    break;
            }
            
            // Thực hiện truy vấn SQL trực tiếp
            const results = await db.sequelize.query(`
                SELECT ${dateFormat} as date, COUNT(id) as count
                FROM users
                WHERE created_at BETWEEN :startDate AND :endDate
                GROUP BY date
                ORDER BY date ASC
            `, {
                replacements: { startDate, endDate },
                type: db.Sequelize.QueryTypes.SELECT
            });
            
            // Tính tổng số người dùng trong khoảng thời gian
            const totalCount = await User.count({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            });
            
            // Định dạng kết quả thống kê
            const stats = [];
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                let dateKey;
                switch (groupByInterval) {
                    case 'week':
                        const weekNum = getWeekNumber(currentDate);
                        dateKey = `${currentDate.getFullYear()}-${weekNum < 10 ? '0' + weekNum : weekNum}`;
                        // Tăng lên 7 ngày cho tuần kế tiếp
                        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
                        // Tăng lên 1 tháng
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    default: // day
                        dateKey = currentDate.toISOString().split('T')[0];
                        // Tăng lên 1 ngày
                        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
                        break;
                }
                
                const result = results.find(r => r.date === dateKey);
                stats.push({
                    date: dateKey,
                    count: result ? parseInt(result.count) : 0
                });
            }
            
            return {
                stats,
                total: totalCount
            };
        } catch (error) {
            console.error('Error in getUsersByDateRange:', error);
            throw error;
        }
    }
    
    // ============================================
    // LẤY THỐNG KÊ NGƯỜI DÙNG - getUserStats
    // ============================================
    /**
     * @desc: Lấy thống kê tổng hợp về người dùng
     * @param {Object} options - { startDate, endDate }
     * @returns {Object} - Thống kê tổng hợp về người dùng
     */
    async getUserStats(options = {}) {
        try {
            const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const endDate = options.endDate ? new Date(options.endDate) : new Date();
            
            // Lấy thống kê người dùng theo thời gian
            const userStats = await this.getUsersByDateRange(options);
            
            // Thống kê người dùng theo vai trò
            const roleDistribution = await db.sequelize.query(`
                SELECT r.id, r.name, COUNT(u.id) as count
                FROM roles r
                JOIN users u ON r.id = u.role_id
                WHERE u.created_at BETWEEN :startDate AND :endDate
                GROUP BY r.id, r.name
                ORDER BY count DESC
            `, {
                replacements: { startDate, endDate },
                type: db.Sequelize.QueryTypes.SELECT
            });
            
            // Thống kê tăng trưởng
            const timeRange = endDate.getTime() - startDate.getTime();
            const previousStartDate = new Date(startDate.getTime() - timeRange);
            
            // Tính số người dùng trong khoảng thời gian trước đó
            const previousUsersCount = await User.count({
                where: {
                    createdAt: {
                        [Op.between]: [previousStartDate, startDate]
                    }
                }
            });
            
            // Tính tỷ lệ tăng trưởng
            const growth = previousUsersCount > 0 
                ? ((userStats.total - previousUsersCount) / previousUsersCount) * 100 
                : 100;
            
            return {
                total: userStats.total,
                growth: parseFloat(growth.toFixed(2)),
                timeData: userStats.stats,
                roles: roleDistribution
            };
        } catch (error) {
            console.error('Error in getUserStats:', error);
            throw error;
        }
    }
    
    // ============================================
    // LẤY THỐNG KÊ TOP NGƯỜI DÙNG ĐÓNG GÓP - getTopContributors
    // ============================================
    /**
     * @desc: Lấy thống kê top người dùng đóng góp nhiều bài viết nhất
     * @param {Object} options - { startDate, endDate, limit }
     * @returns {Array} Danh sách top người dùng đóng góp
     */
    async getTopContributors(options = {}) {
        try {
            const startDate = options.startDate ? new Date(options.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const endDate = options.endDate ? new Date(options.endDate) : new Date();
            const limit = options.limit || 5;
            
            const topContributors = await db.sequelize.query(`
                SELECT u.id, u.username, u.avatar, COUNT(p.id) as postCount
                FROM users u
                JOIN posts p ON u.id = p.user_id
                WHERE p.created_at BETWEEN :startDate AND :endDate
                GROUP BY u.id, u.username, u.avatar
                ORDER BY postCount DESC
                LIMIT :limit
            `, {
                replacements: { startDate, endDate, limit },
                type: db.Sequelize.QueryTypes.SELECT
            });
            
            return topContributors;
        } catch (error) {
            console.error('Error in getTopContributors:', error);
            throw error;
        }
    }
}

// Hàm helper để lấy số tuần trong năm
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

module.exports = new UserService();
