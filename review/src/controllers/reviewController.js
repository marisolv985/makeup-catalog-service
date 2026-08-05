const reviewService = require('../services/reviewService');

class ReviewController {
  async create(req, res, next) {
    try {
      const review = await reviewService.create(
        req.user.id,
        req.body.productoSku,
        parseInt(req.body.rating),
        req.body.comment || null,
        req.body.imagenes || [],
        req.user.username || req.body.username || ''
      );
      res.status(201).json({
        success: true,
        message: 'Reseña creada exitosamente',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySku(req, res, next) {
    try {
      const result = await reviewService.getBySku(req.params.sku);
      res.status(200).json({
        success: true,
        message: 'Reseñas obtenidas exitosamente',
        data: result.reviews,
        stats: result.stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req, res, next) {
    try {
      const reviews = await reviewService.getByUser(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Reseñas del usuario obtenidas exitosamente',
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
