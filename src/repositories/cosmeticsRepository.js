const Product = require('../models/Product');

class CosmeticsRepository {
  async create(data) {
    const product = new Product(data);
    return await product.save();
  }

  async findAll(filters = {}, page = 1, limit = 20) {
    const query = Product.find(filters);
    const results = await query.skip((page - 1) * limit).limit(limit);
    const total = await Product.countDocuments(filters);
    return { results, total, page, limit };
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async findBySku(sku) {
    return await Product.findOne({ sku: sku.toUpperCase() });
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async softDelete(id) {
    return await Product.findByIdAndUpdate(
      id,
      { estado: 'INACTIVO' },
      { new: true }
    );
  }

  async decreaseStock(sku, cantidad) {
    return await Product.findOneAndUpdate(
      { sku: sku.toUpperCase(), stockDisponible: { $gte: cantidad } },
      [
        {
          $set: {
            stockDisponible: { $subtract: ['$stockDisponible', cantidad] },
            estado: {
              $cond: {
                if: { $lte: [{ $subtract: ['$stockDisponible', cantidad] }, 0] },
                then: 'AGOTADO',
                else: '$estado',
              },
            },
          },
        },
      ],
      { new: true }
    );
  }

  async increaseStock(sku, cantidad) {
    return await Product.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      {
        $inc: { stockDisponible: cantidad },
        $set: { estado: 'DISPONIBLE' },
      },
      { new: true }
    );
  }

  async exists(sku) {
    const product = await Product.findOne({ sku: sku.toUpperCase() }).select('_id');
    return !!product;
  }

  async getStock(sku) {
    const product = await Product.findOne({ sku: sku.toUpperCase() }).select('sku stockDisponible');
    return product;
  }
}

module.exports = new CosmeticsRepository();
