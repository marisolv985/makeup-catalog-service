const { Router } = require('express');
const cosmeticsController = require('../controllers/cosmeticsController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const {
  createProductValidation,
  updateProductValidation,
  idParamValidation,
  skuParamValidation,
  decreaseStockValidation,
  increaseStockValidation,
  queryFiltersValidation,
} = require('../validators/cosmeticsValidator');
const validate = require('../middlewares/validate');

const router = Router();

router.get(
  '/',
  authMiddleware,
  queryFiltersValidation,
  validate,
  cosmeticsController.getAll
);

router.get(
  '/sku/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.getBySku
);

router.get(
  '/stock/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.getStock
);

router.get(
  '/exists/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.exists
);

router.get(
  '/:id',
  authMiddleware,
  idParamValidation,
  validate,
  cosmeticsController.getById
);

router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  validate,
  cosmeticsController.create
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  updateProductValidation,
  validate,
  cosmeticsController.update
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  idParamValidation,
  validate,
  cosmeticsController.delete
);

router.patch(
  '/stock/decrease',
  authMiddleware,
  adminOnly,
  decreaseStockValidation,
  validate,
  cosmeticsController.decreaseStock
);

router.patch(
  '/stock/increase',
  authMiddleware,
  adminOnly,
  increaseStockValidation,
  validate,
  cosmeticsController.increaseStock
);

module.exports = router;
