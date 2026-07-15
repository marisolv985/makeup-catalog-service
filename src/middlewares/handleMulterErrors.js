const multer = require('multer');

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'Error al subir archivo';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'El archivo excede el tamaño máximo de 5MB';
    if (err.code === 'LIMIT_FILE_COUNT') message = 'Demasiados archivos. Máximo 10';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Campo de archivo inesperado';

    if (req.method === 'POST' && req.path.includes('/products')) {
      return res.redirect('/products?error=' + encodeURIComponent(message));
    }
    return res.status(400).json({ success: false, message, errors: [] });
  }
  if (err.message && err.message.includes('Formato de archivo no válido')) {
    if (req.method === 'POST' && req.path.includes('/products')) {
      return res.redirect('/products?error=' + encodeURIComponent(err.message));
    }
    return res.status(400).json({ success: false, message: err.message, errors: [] });
  }
  next(err);
};

module.exports = handleMulterErrors;
