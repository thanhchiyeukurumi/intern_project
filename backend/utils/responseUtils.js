module.exports = {
  ok: (res, data) => {
    return res.status(200).send({
      success: true,
      data,
      status: 200,
      message: "ok"
    });
  },

  created: (res, data, message = "Created successfully") => {
    return res.status(201).send({
      success: true,
      data,
      status: 201,
      message
    });
  },

  notFound: (res) => {
    return res.status(404).send({
      success: false,
      status: 404,
      message: "Cannot find resouces",
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
