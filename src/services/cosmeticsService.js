const cosmeticsRepository = require('../repositories/cosmeticsRepository');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/helpers');

class CosmeticsService {
  async createProduct(data) {
    const existing = await cosmeticsRepository.findBySku(data.sku);
    if (existing) {
      throw ApiError.conflict(`El producto con SKU ${data.sku} ya existe`);
    }
    return await cosmeticsRepository.create(data);
  }

  async getAllProducts(query) {
    const { marca, categoria, tipoPiel, tono, estado, precioMin, precioMax, busqueda, stock, page = 1, limit = 20 } = query;

    const filters = {};

    if (marca) filters.marca = { $regex: escapeRegex(marca), $options: 'i' };
    if (categoria) filters.categoria = categoria;
    if (tipoPiel) filters.tipoPielRecomendado = { $in: Array.isArray(tipoPiel) ? tipoPiel : [tipoPiel] };
    if (tono) filters.tono = { $regex: escapeRegex(tono), $options: 'i' };
    if (estado) filters.estado = estado;
    if (precioMin || precioMax) {
      filters.precio = {};
      if (precioMin) filters.precio.$gte = parseFloat(precioMin);
      if (precioMax) filters.precio.$lte = parseFloat(precioMax);
    }
    if (stock !== undefined && stock !== null) {
      filters.stockDisponible = { $gte: parseInt(stock, 10) };
    }
    if (busqueda) {
      const safe = escapeRegex(busqueda);
      filters.$or = [
        { titulo: { $regex: safe, $options: 'i' } },
        { descripcion: { $regex: safe, $options: 'i' } },
        { marca: { $regex: safe, $options: 'i' } },
        { ingredientes: { $regex: safe, $options: 'i' } },
      ];
    }

    return await cosmeticsRepository.findAll(filters, parseInt(page, 10), parseInt(limit, 10));
  }

  async getProductById(id) {
    const product = await cosmeticsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Producto no encontrado por ID');
    }
    return product;
  }

  async getProductBySku(sku) {
    const product = await cosmeticsRepository.findBySku(sku);
    if (!product) {
      throw ApiError.notFound(`Producto con SKU ${sku} no encontrado`);
    }
    return product;
  }

  async updateProduct(id, data) {
    const product = await cosmeticsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }
    if (data.sku && data.sku !== product.sku) {
      const existing = await cosmeticsRepository.findBySku(data.sku);
      if (existing) {
        throw ApiError.conflict(`El SKU ${data.sku} ya está en uso`);
      }
    }
    return await cosmeticsRepository.update(id, data);
  }

  async deleteProduct(id) {
    const product = await cosmeticsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }
    if (product.estado === 'INACTIVO') {
      throw ApiError.badRequest('El producto ya está inactivo');
    }
    return await cosmeticsRepository.softDelete(id);
  }

  async getStock(sku) {
    const result = await cosmeticsRepository.getStock(sku);
    if (!result) {
      throw ApiError.notFound(`Producto con SKU ${sku} no encontrado`);
    }
    return { sku: result.sku, stockDisponible: result.stockDisponible };
  }

  async exists(sku) {
    const exists = await cosmeticsRepository.exists(sku);
    return { exists };
  }

  async decreaseStock(sku, cantidad) {
    if (!sku || cantidad === undefined || cantidad <= 0) {
      throw ApiError.badRequest('SKU y cantidad válida son requeridos');
    }
    const product = await cosmeticsRepository.findBySku(sku);
    if (!product) {
      throw ApiError.notFound(`Producto con SKU ${sku} no encontrado`);
    }
    if (product.stockDisponible < cantidad) {
      throw ApiError.badRequest(`Stock insuficiente. Disponible: ${product.stockDisponible}, solicitado: ${cantidad}`);
    }
    const updated = await cosmeticsRepository.decreaseStock(sku, cantidad);
    return updated;
  }

  async increaseStock(sku, cantidad) {
    if (!sku || cantidad === undefined || cantidad <= 0) {
      throw ApiError.badRequest('SKU y cantidad válida son requeridos');
    }
    const product = await cosmeticsRepository.findBySku(sku);
    if (!product) {
      throw ApiError.notFound(`Producto con SKU ${sku} no encontrado`);
    }
    return await cosmeticsRepository.increaseStock(sku, cantidad);
  }
}

module.exports = new CosmeticsService();
