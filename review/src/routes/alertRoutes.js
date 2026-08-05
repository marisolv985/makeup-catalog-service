const { Router } = require('express');
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();

router.post(
  '/subscribe',
  authMiddleware,
  alertController.subscribe
);

router.delete(
  '/unsubscribe/:sku',
  authMiddleware,
  alertController.unsubscribe
);

module.exports = router;
