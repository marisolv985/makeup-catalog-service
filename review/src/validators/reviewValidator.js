const { body } = require('express-validator');

const createReviewValidation = [
  body('productoSku')
    .notEmpty().withMessage('El SKU del producto es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto'),
  body('rating')
    .notEmpty().withMessage('El rating es obligatorio')
    .isInt({ min: 1, max: 5 }).withMessage('El rating debe ser un entero entre 1 y 5'),
  body('comment')
    .optional()
    .isString().withMessage('El comentario debe ser una cadena de texto'),
];

module.exports = {
  createReviewValidation,
};
