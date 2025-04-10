const {body} = require('express-validator');

const createUserValidation = [
    body('username')
        .notEmpty().withMessage('Username là bắt buộc')
        .isLength({min: 3, max: 50}).withMessage('Username phải từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username chỉ được chứa chữ cái và số')
        .custom(async (username) => {
            const user = await User.findOne({where: {username}});
            if (user) {
                throw new Error('Username đã tồn tại');
            }
        }),
    body('fullname')
        .notEmpty().withMessage('Họ tên là bắt buộc')
        .isLength({min: 3, max: 100}).withMessage('Họ tên phải từ 3-100 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Họ tên chỉ được chứa chữ cái và số'),
    body('password')
        .notEmpty().withMessage('Mật khẩu là bắt buộc')
        .isLength({min: 6, max: 20}).withMessage('Mật khẩu phải từ 6-20 ký tự')     
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt'),     

    body('email')
        .notEmpty().withMessage('Email là bắt buộc')
        .isEmail().withMessage('Email không hợp lệ')
        .custom(async (email) => {
            const user = await User.findOne({where: {email}});
            if (user) {
                throw new Error('Email đã tồn tại');
            }
        })
];

const updateUserValidation = [
    body('username')
        .notEmpty().withMessage('Username là bắt buộc')
        .isLength({min: 3, max: 50}).withMessage('Username phải từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username chỉ được chứa chữ cái và số')
        .custom(async (username) => {
            const user = await User.findOne({where: {username}});
            if (user) {
                throw new Error('Username đã tồn tại');
            }
        }),
    body('fullname')
        .notEmpty().withMessage('Họ tên là bắt buộc')
        .isLength({min: 3, max: 100}).withMessage('Họ tên phải từ 3-100 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Họ tên chỉ được chứa chữ cái và số'),
    body('password')
        .notEmpty().withMessage('Mật khẩu là bắt buộc')
        .isLength({min: 6, max: 20}).withMessage('Mật khẩu phải từ 6-20 ký tự')     
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt'),     

    body('email')
        .notEmpty().withMessage('Email là bắt buộc')
        .isEmail().withMessage('Email không hợp lệ')
        .custom(async (email) => {
            const user = await User.findOne({where: {email}});
            if (user) {
                throw new Error('Email đã tồn tại');
            }
        })
];

module.exports = {
    createUserValidation,
    updateUserValidation
}

