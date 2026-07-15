const { body, param, query } = require('express-validator');

const CATEGORIES = ['Labios', 'Rostro', 'Ojos', 'Brochas', 'Skincare', 'Accesorios'];
const STATUSES = ['DISPONIBLE', 'AGOTADO', 'INACTIVO'];
const SKIN_TYPES = ['Seca', 'Grasa', 'Mixta', 'Normal', 'Todos'];

const createProductValidation = [
  body('sku')
    .notEmpty().withMessage('El SKU es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto')
    .trim()
    .matches(/^[A-Z0-9\-]+$/).withMessage('El SKU debe contener solo letras mayúsculas, números y guiones'),
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isString().withMessage('El título debe ser una cadena de texto')
    .trim()
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
  body('descripcion')
    .notEmpty().withMessage('La descripción es obligatoria')
    .isString().withMessage('La descripción debe ser una cadena de texto')
    .trim()
    .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
  body('marca')
    .notEmpty().withMessage('La marca es obligatoria')
    .isString().withMessage('La marca debe ser una cadena de texto')
    .trim(),
  body('categoria')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn(CATEGORIES).withMessage(`Categoría no válida. Opciones: ${CATEGORIES.join(', ')}`),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que cero'),
  body('stockDisponible')
    .notEmpty().withMessage('El stock disponible es obligatorio')
    .isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  body('tipoPielRecomendado')
    .optional()
    .isArray().withMessage('tipoPielRecomendado debe ser un arreglo')
    .custom((val) => val.every((t) => SKIN_TYPES.includes(t)))
    .withMessage(`Tipos de piel válidos: ${SKIN_TYPES.join(', ')}`),
  body('tono')
    .optional()
    .isString().withMessage('El tono debe ser una cadena de texto'),
  body('ingredientes')
    .optional()
    .isArray().withMessage('ingredientes debe ser un arreglo de strings')
    .custom((val) => val.every((i) => typeof i === 'string'))
    .withMessage('Cada ingrediente debe ser una cadena de texto'),
  body('peso')
    .optional()
    .isString().withMessage('El peso debe ser una cadena de texto'),
  body('imagenes')
    .optional()
    .isArray().withMessage('Las imágenes deben ser un arreglo de URLs')
    .custom((val) => val.every((url) => /^https?:\/\/.+/i.test(url)))
    .withMessage('Las imágenes deben ser URLs válidas'),
  body('estado')
    .optional()
    .isIn(STATUSES).withMessage(`Estado no válido. Opciones: ${STATUSES.join(', ')}`),
];

const updateProductValidation = [
  param('id').isMongoId().withMessage('ID de producto no válido'),
  body('sku')
    .optional()
    .isString().withMessage('El SKU debe ser una cadena de texto')
    .trim()
    .matches(/^[A-Z0-9\-]+$/).withMessage('El SKU debe contener solo letras mayúsculas, números y guiones'),
  body('titulo')
    .optional()
    .isString().withMessage('El título debe ser una cadena de texto')
    .trim()
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser una cadena de texto')
    .trim()
    .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
  body('marca')
    .optional()
    .isString().withMessage('La marca debe ser una cadena de texto')
    .trim(),
  body('categoria')
    .optional()
    .isIn(CATEGORIES).withMessage(`Categoría no válida. Opciones: ${CATEGORIES.join(', ')}`),
  body('precio')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que cero'),
  body('stockDisponible')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  body('tipoPielRecomendado')
    .optional()
    .isArray().withMessage('tipoPielRecomendado debe ser un arreglo')
    .custom((val) => val.every((t) => SKIN_TYPES.includes(t)))
    .withMessage(`Tipos de piel válidos: ${SKIN_TYPES.join(', ')}`),
  body('tono')
    .optional()
    .isString().withMessage('El tono debe ser una cadena de texto'),
  body('ingredientes')
    .optional()
    .isArray().withMessage('ingredientes debe ser un arreglo de strings')
    .custom((val) => val.every((i) => typeof i === 'string'))
    .withMessage('Cada ingrediente debe ser una cadena de texto'),
  body('peso')
    .optional()
    .isString().withMessage('El peso debe ser una cadena de texto'),
  body('imagenes')
    .optional()
    .isArray().withMessage('Las imágenes deben ser un arreglo de URLs')
    .custom((val) => val.every((url) => /^https?:\/\/.+/i.test(url)))
    .withMessage('Las imágenes deben ser URLs válidas'),
  body('estado')
    .optional()
    .isIn(STATUSES).withMessage(`Estado no válido. Opciones: ${STATUSES.join(', ')}`),
];

const idParamValidation = [
  param('id').isMongoId().withMessage('ID de producto no válido'),
];

const skuParamValidation = [
  param('sku').notEmpty().withMessage('El SKU es obligatorio').isString().withMessage('El SKU debe ser una cadena de texto'),
];

const decreaseStockValidation = [
  body('sku')
    .notEmpty().withMessage('El SKU es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor que cero'),
];

const increaseStockValidation = [
  body('sku')
    .notEmpty().withMessage('El SKU es obligatorio')
    .isString().withMessage('El SKU debe ser una cadena de texto'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor que cero'),
];

const queryFiltersValidation = [
  query('marca').optional().isString().withMessage('La marca debe ser una cadena de texto'),
  query('categoria').optional().isIn(CATEGORIES).withMessage(`Categoría no válida. Opciones: ${CATEGORIES.join(', ')}`),
  query('tipoPiel').optional().isString().withMessage('El tipo de piel debe ser una cadena de texto'),
  query('tono').optional().isString().withMessage('El tono debe ser una cadena de texto'),
  query('estado').optional().isIn(STATUSES).withMessage(`Estado no válido. Opciones: ${STATUSES.join(', ')}`),
  query('precioMin').optional().isFloat({ min: 0 }).withMessage('precioMin debe ser un número positivo'),
  query('precioMax').optional().isFloat({ min: 0 }).withMessage('precioMax debe ser un número positivo'),
  query('busqueda').optional().isString().withMessage('La búsqueda debe ser una cadena de texto'),
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  idParamValidation,
  skuParamValidation,
  decreaseStockValidation,
  increaseStockValidation,
  queryFiltersValidation,
};
