const cosmeticsService = require('../services/cosmeticsService');
const { breakerGetStock, breakerDecreaseStock, breakerExists, breakerFindProduct } = require('../config/circuitBreakers');

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
      const result = await breakerGetStock.fire(req.params.sku);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
          errors: [],
        });
      }
      res.status(200).json({
        sku: result.sku,
        stockDisponible: result.stockDisponible,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Catálogo en mantenimiento temporal. Intenta más tarde.',
        errors: [],
      });
    }
  }

  async exists(req, res, next) {
    try {
      const exists = await breakerExists.fire(req.params.sku);
      res.status(200).json({
        exists,
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
      const product = await breakerDecreaseStock.fire(req.body.sku, req.body.cantidad);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente o producto no encontrado',
          errors: [],
        });
      }
      const newEstado = product.stockDisponible === 0 ? 'AGOTADO' : product.estado;
      if (product.stockDisponible === 0) {
        const Product = require('../models/Product');
        await Product.findByIdAndUpdate(product._id, { estado: 'AGOTADO' });
      }
      res.status(200).json({
        sku: product.sku,
        stockDisponible: product.stockDisponible,
        estado: newEstado,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Catálogo en mantenimiento temporal. Intenta más tarde.',
        errors: [],
      });
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
