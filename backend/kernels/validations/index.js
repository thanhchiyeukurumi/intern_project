// kernels/validations/index.js (Middleware validate đã sửa)

const { validationResult } = require("express-validator");
const response = require("utils/responseUtils"); // Đảm bảo đường dẫn đúng

const validate = (validationArray) => {
  return async (req, res, next) => {
    // Chạy tất cả các validation trong danh sách
    // Đảm bảo validationArray luôn là mảng
    const validations = Array.isArray(validationArray) ? validationArray : [validationArray];
    for (let validation of validations) {
      // Nếu phần tử trong validationArray là kết quả của .get(), nó có thể không có hàm run
      // Cần đảm bảo mỗi phần tử là một validation chain có thể chạy được
      if (typeof validation.run === 'function') {
         await validation.run(req);
      } else {
         console.warn("Một phần tử trong validationArray không phải là middleware hợp lệ.");
         // Hoặc ném lỗi nếu muốn chặt chẽ hơn
      }
    }

    // Lấy lỗi sau khi validation chạy xong
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next(); // Không có lỗi, đi tiếp
    }

    // Format lỗi thành dạng [{ field, message }]
    const formattedErrors = errors.array().map((error) => {
      // express-validator v7+ trả về lỗi dạng { type, value, msg, path, location }
      // chúng ta cần lấy 'path' làm 'field' và 'msg' làm 'message'
      return {
        field: error.path || 'unknown', // error.path là tên field
        message: error.msg,             // error.msg là thông báo lỗi
      };
    });

    // Nếu có lỗi, gọi response.invalidated với mảng lỗi đã format
    return response.invalidated(res, formattedErrors); // Truyền trực tiếp mảng lỗi
  };
};

module.exports = { validate };