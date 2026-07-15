const cosmeticsService = require('../services/cosmeticsService');

class CosmeticsController {
  async create(req, res, next) {
    try {
      const product = await cosmeticsService.createProduct(req.body);
      res.status(201).json({
        id: product._id,
        sku: product.sku,
        titulo: product.titulo,
        marca: product.marca,
        categoria: product.categoria,
        precio: product.precio,
        stockDisponible: product.stockDisponible,
        status: product.estado,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await cosmeticsService.getAllProducts(req.query);
      res.status(200).json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        data: result.results,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await cosmeticsService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Producto obtenido exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySku(req, res, next) {
    try {
      const product = await cosmeticsService.getProductBySku(req.params.sku);
      res.status(200).json({
        success: true,
        message: 'Producto obtenido exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await cosmeticsService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await cosmeticsService.deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStock(req, res, next) {
    try {
      const result = await cosmeticsService.getStock(req.params.sku);
      res.status(200).json({
        sku: result.sku,
        stockDisponible: result.stockDisponible,
        titulo: result.titulo,
        precio: result.precio,
        imagenUrl: result.imagenUrl,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
          errors: [],
        });
      }
      res.status(503).json({
        success: false,
        message: 'Catálogo en mantenimiento temporal. Intenta más tarde.',
        errors: [],
      });
    }
  }

  async exists(req, res, next) {
    try {
      const result = await cosmeticsService.exists(req.params.sku);
      res.status(200).json({
        exists: result.exists,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Catálogo en mantenimiento temporal. Intenta más tarde.',
        errors: [],
      });
    }
  }

  async decreaseStock(req, res, next) {
    try {
      const result = await cosmeticsService.decreaseStock(req.body.sku, req.body.cantidad);
      res.status(200).json({
        sku: result.sku,
        stockDisponible: result.stockDisponible,
        estado: result.estado,
      });
    } catch (error) {
      if (error.statusCode === 503) {
        return res.status(503).json({
          success: false,
          message: 'Catálogo en mantenimiento temporal. Intenta más tarde.',
          errors: [],
        });
      }
      next(error);
    }
  }

  async increaseStock(req, res, next) {
    try {
      const product = await cosmeticsService.increaseStock(req.body.sku, req.body.cantidad);
      res.status(200).json({
        sku: product.sku,
        stockDisponible: product.stockDisponible,
        estado: product.estado,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CosmeticsController();
