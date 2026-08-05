const errorHandler = (err, _req, res, _next) => {
  console.error('[Error]', err.message);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        errors: [],
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro con esos datos',
        errors: [],
      });
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errors: [],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errors: [],
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errors: process.env.NODE_ENV === 'development' ? [err.message] : [],
  });
};

module.exports = errorHandler;
