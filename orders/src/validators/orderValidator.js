const { body, param, query } = require('express-validator');

const ESTADOS = ['PENDIENTE_PAGO', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const createDirectOrderValidation = [
  body('productoSku')
    .notEmpty().withMessage('El SKU del producto es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor que cero'),
  body('direccionEnvio')
    .optional()
    .isString().withMessage('La dirección debe ser una cadena de texto'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser una cadena de texto'),
];

const createFromCartValidation = [
  body('direccionEnvio')
    .optional()
    .isString().withMessage('La dirección debe ser una cadena de texto'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser una cadena de texto'),
  body('ciudad')
    .optional()
    .isString().withMessage('La ciudad debe ser una cadena de texto'),
  body('codigoPostal')
    .optional()
    .isString().withMessage('El código postal debe ser una cadena de texto'),
  body('telefono')
    .optional()
    .isString().withMessage('El teléfono debe ser una cadena de texto'),
  body('metodoPago')
    .optional()
    .isString().withMessage('El método de pago debe ser una cadena de texto'),
];

const updateStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID de orden no válido'),
  body('estado')
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(ESTADOS).withMessage(`Estado no válido. Opciones: ${ESTADOS.join(', ')}`),
];

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID de orden no válido'),
];

const queryFiltersValidation = [
  query('estado').optional().isIn(ESTADOS).withMessage(`Estado no válido. Opciones: ${ESTADOS.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
];

module.exports = {
  createDirectOrderValidation,
  createFromCartValidation,
  updateStatusValidation,
  idParamValidation,
  queryFiltersValidation,
};
