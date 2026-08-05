const reviewRepository = require('../repositories/reviewRepository');
const { productExists } = require('../utils/catalogClient');
const ApiError = require('../utils/ApiError');

class ReviewService {
  async create(usuarioId, productoSku, rating, comment = null, imagenes = [], username = '') {
    const exists = await productExists(productoSku);
    if (!exists || !exists.exists) {
      throw ApiError.notFound(`El producto con SKU ${productoSku} no existe`);
    }

    return await reviewRepository.create(usuarioId, productoSku, rating, comment, imagenes, username);
  }

  async getBySku(productoSku) {
    const [reviews, stats] = await Promise.all([
      reviewRepository.findBySku(productoSku),
      reviewRepository.stats(productoSku),
    ]);

    return { reviews, stats };
  }

  async getByUser(usuarioId) {
    return await reviewRepository.findByUser(usuarioId);
  }
}

module.exports = new ReviewService();
