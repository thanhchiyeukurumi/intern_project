module.exports = {
  // Có sự thay đổi nhỏ so với bản gốc
  ok: (res, data = {}) => {
    const { pagination, ...rest } = data;
    // return res.status(200).send({
    //   success: true,
    //   data: rest.data ?? rest,
    //   pagination: pagination ?? null,
    //   status: 200,
    //   message: "ok"
    // });
    const response = {
      success: true,
      data: rest.data ?? rest,
      // status: 200,
      // message: "ok"
    };
    if (pagination) {
      response.pagination = pagination;
    }
    response.status = 200;
    response.message = "ok"; // Làm cái này để nhìn cho nó đẹp hơn =)))
    return res.status(200).send(response);
  },

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
