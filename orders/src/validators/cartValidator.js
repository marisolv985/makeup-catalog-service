const { body, param } = require('express-validator');

const addItemValidation = [
  body('productoSku')
    .notEmpty().withMessage('El SKU del producto es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor que cero'),
];

const updateQuantityValidation = [
  param('sku').notEmpty().withMessage('El SKU es obligatorio'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor que cero'),
];

const removeItemValidation = [
  param('sku').notEmpty().withMessage('El SKU es obligatorio'),
];

module.exports = {
  addItemValidation,
  updateQuantityValidation,
  removeItemValidation,
};
