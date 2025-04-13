/**
 * @desc: quy uoc cac service method tra ve 1 doi tuong nhu la getById, create, update, se tra ve doi tuong du lieu tho
 * cac service method tra ve danh sach nhu la getAll... se tra ve 1 object co dang {data: [itemsArray], pagination: {total, page, limit}}
 */

module.exports = {
  // Có sự thay đổi nhỏ so với bản gốc
  /**
   * Xử lý response thành công cho GET (một hoặc nhiều item), PUT, PATCH, DELETE (có thể trả data).
   * @param {Object} res - Đối tượng response của Express.
   * @param {Object | {data: Array, pagination: Object}} serviceResult - Kết quả từ service.
   *        - Đối với item đơn/update/delete: object dữ liệu thô.
   *        - Đối với danh sách: object dạng { data: Array, pagination: Object }.
   * @param {string} [message='ok'] - Thông điệp thành công (tùy chọn).
   */
  ok: (res, data) => {
    const response = {
      success: true,
      status: 200,
      message: 'ok',
    };

    // Kiểm tra xem kết quả có phải là cấu trúc của danh sách phân trang không
    if (data && typeof data === 'object' && Array.isArray(data.data) && data.pagination) {
      response.data = data.data;
      response.pagination = data.pagination;
    } else {
      // Nếu không, coi đó là dữ liệu của một đối tượng đơn lẻ
      response.data = data;
      // Không có pagination cho đối tượng đơn lẻ
    }
    return res.status(200).send(response);
  },
  /**
   * 
   * @param {*} res 
   * @param {*} return data  (tham so tra ve tu service)
   * @returns 
   */
  created: (res, data) => {
    return res.status(201).send({
      success: true,
      data,
      status: 201,
      message: "Created successfully"
    });
  },

  notFound: (res, message) => {
    return res.status(404).send({
      success: false,
      status: 404,
      message: message || "Cannot find resouces",
    });
  },

  error: (res, message) => {
    return res.status(500).send({
      success: false,
      status: 500,
      message: message || "Internal server error",
    });
  },

  customError: (res, statusCode, message) => {
    return res.status(statusCode).send({
      success: false,
      status: statusCode,
      message: message || "Some error occurred",
    });
  },

  unauthorized: (res, message) => {
    return res.status(401).send({
      success: false,
      status: 401,
      message: message || 'Unauthorized',
    });
  },

  forbidden: (res, message) => {
    return res.status(403).send({
      success: false,
      status: 403,
      message: message || 'You do not have permission to perform this action.',
    });
  },

  invalidated: (res, errors) => {
    return res.status(422).send({
      success: false,
      status: 422,
      data: errors
    })
  }
};
