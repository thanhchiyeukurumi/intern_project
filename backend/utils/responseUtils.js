module.exports = {
  // Có sự thay đổi nhỏ so với bản gốc
  /**
   * 
   * @param {*} res 
   * @param {*} return {data: data, pagination: pagination} {tham so tra ve tu service}
   * @returns 
   */
  ok: (res, data = {}) => {
    let { pagination, ...rest } = data;
    const response = {
      success: true,
      data: data.data ?? data,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    response.status = 200;
    response.message = "ok"; 
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
