export function sendSuccess(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendPaginated(res, message, items, pagination, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(pagination.total / pagination.limit) || 1
      }
    }
  });
}

export function sendError(res, message, statusCode = 400, errors = null) {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}
