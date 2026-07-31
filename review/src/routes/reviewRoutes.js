const { Router } = require('express');
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { createReviewValidation } = require('../validators/reviewValidator');
const validate = require('../middlewares/validate');

const router = Router();

router.post(
  '/',
  authMiddleware,
  createReviewValidation,
  validate,
  reviewController.create
);

router.get(
  '/product/:sku',
  reviewController.getBySku
);

router.get(
  '/user',
  authMiddleware,
  reviewController.getByUser
);

module.exports = router;
