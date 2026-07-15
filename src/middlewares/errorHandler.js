const errorHandler = (err, req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Formato de ID inválido',
      errors: [],
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `El valor del campo ${field} ya existe`,
      errors: [],
    });
  }

  console.error('Error inesperado:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errors: [],
  });
};

module.exports = errorHandler;
