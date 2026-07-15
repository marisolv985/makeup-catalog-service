const { Router } = require('express');
const Product = require('../../models/Product');
const upload = require('../../config/upload');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const stats = {
      totalProducts: await Product.countDocuments(),
      availableProducts: await Product.countDocuments({ estado: 'DISPONIBLE' }),
      outOfStockProducts: await Product.countDocuments({ stockDisponible: 0, estado: { $ne: 'INACTIVO' } }),
      inactiveProducts: await Product.countDocuments({ estado: 'INACTIVO' }),
    };

    const categories = await Product.aggregate([
      { $match: { estado: { $ne: 'INACTIVO' } } },
      { $group: { _id: '$categoria', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.render('pages/dashboard', {
      title: 'Dashboard',
      currentPath: '/',
      stats,
      categories,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/dashboard', {
      title: 'Dashboard',
      currentPath: '/',
      stats: { totalProducts: 0, availableProducts: 0, outOfStockProducts: 0, inactiveProducts: 0 },
      categories: [],
      errorMessage: 'Error al cargar el dashboard',
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { marca, categoria, tipoPiel, tono, estado, precioMin, precioMax, busqueda, page = 1, limit = 12 } = req.query;

    const filters = {};
    if (marca) filters.marca = { $regex: marca, $options: 'i' };
    if (categoria) filters.categoria = categoria;
    if (tipoPiel) filters.tipoPielRecomendado = { $in: [tipoPiel] };
    if (tono) filters.tono = { $regex: tono, $options: 'i' };
    if (estado) filters.estado = estado;
    if (precioMin || precioMax) {
      filters.precio = {};
      if (precioMin) filters.precio.$gte = parseFloat(precioMin);
      if (precioMax) filters.precio.$lte = parseFloat(precioMax);
    }
    if (busqueda) {
      filters.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } },
        { marca: { $regex: busqueda, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .sort({ fechaCreacion: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    const buildQuery = function (p) {
      const params = new URLSearchParams();
      if (marca) params.set('marca', marca);
      if (categoria) params.set('categoria', categoria);
      if (tipoPiel) params.set('tipoPiel', tipoPiel);
      if (tono) params.set('tono', tono);
      if (estado) params.set('estado', estado);
      if (precioMin) params.set('precioMin', precioMin);
      if (precioMax) params.set('precioMax', precioMax);
      if (busqueda) params.set('busqueda', busqueda);
      params.set('page', p);
      return params.toString();
    };

    res.render('pages/products', {
      title: 'Catálogo de Productos',
      currentPath: '/products',
      products,
      pagination,
      filters: req.query,
      buildPaginationQuery: buildQuery,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/products', {
      title: 'Catálogo de Productos',
      currentPath: '/products',
      products: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
      filters: {},
      buildPaginationQuery: function () { return ''; },
      errorMessage: 'Error al cargar los productos',
    });
  }
});

router.get('/products/new', (req, res) => {
  res.render('pages/productForm', {
    title: 'Nuevo Producto',
    currentPath: '/products',
    product: {},
    isEditing: false,
    successMessage: null,
    errorMessage: null,
  });
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/products?error=Producto no encontrado');
    }
    res.render('pages/productDetail', {
      title: product.titulo,
      currentPath: '/products',
      product,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.redirect('/products?error=ID de producto inválido');
  }
});

router.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/products?error=Producto no encontrado');
    }
    res.render('pages/productForm', {
      title: 'Editar ' + product.titulo,
      currentPath: '/products',
      product,
      isEditing: true,
      successMessage: null,
      errorMessage: null,
    });
  } catch (error) {
    res.redirect('/products?error=ID de producto inválido');
  }
});

router.post('/products', upload.array('imagenesArchivos', 10), async (req, res) => {
  try {
    const { tipoPielRecomendado, ingredientesText, imagenesUrl, ...rest } = req.body;

    const data = { ...rest };
    if (tipoPielRecomendado) {
      data.tipoPielRecomendado = Array.isArray(tipoPielRecomendado) ? tipoPielRecomendado : [tipoPielRecomendado];
    }
    if (ingredientesText) {
      data.ingredientes = ingredientesText.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const imagenes = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => imagenes.push('/uploads/' + f.filename));
    }
    if (imagenesUrl) {
      const urls = Array.isArray(imagenesUrl) ? imagenesUrl : [imagenesUrl];
      urls.filter(u => u && u.trim()).forEach(u => imagenes.push(u.trim()));
    }
    if (imagenes.length > 0) data.imagenes = imagenes;

    const product = new Product(data);
    await product.save();
    res.redirect('/products/' + product._id + '?success=Producto creado exitosamente');
  } catch (error) {
    res.render('pages/productForm', {
      title: 'Nuevo Producto',
      currentPath: '/products',
      product: req.body,
      isEditing: false,
      errorMessage: error.message || 'Error al crear el producto',
    });
  }
});

router.post('/products/:id', upload.array('imagenesArchivos', 10), async (req, res) => {
  try {
    const { tipoPielRecomendado, ingredientesText, imagenesUrl, ...rest } = req.body;

    const data = { ...rest };
    if (tipoPielRecomendado) {
      data.tipoPielRecomendado = Array.isArray(tipoPielRecomendado) ? tipoPielRecomendado : [tipoPielRecomendado];
    } else {
      data.tipoPielRecomendado = [];
    }
    if (ingredientesText) {
      data.ingredientes = ingredientesText.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const imagenes = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => imagenes.push('/uploads/' + f.filename));
    }
    if (imagenesUrl) {
      const urls = Array.isArray(imagenesUrl) ? imagenesUrl : [imagenesUrl];
      urls.filter(u => u && u.trim()).forEach(u => imagenes.push(u.trim()));
    }
    if (imagenes.length > 0) {
      data.imagenes = imagenes;
    } else {
      data.imagenes = [];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) {
      return res.redirect('/products?error=Producto no encontrado');
    }
    res.redirect('/products/' + product._id + '?success=Producto actualizado exitosamente');
  } catch (error) {
    res.redirect('/products/' + req.params.id + '/edit?error=' + encodeURIComponent(error.message || 'Error al actualizar'));
  }
});

router.post('/products/:id/delete', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { estado: 'INACTIVO' },
      { new: true }
    );
    if (!product) {
      return res.redirect('/products?error=Producto no encontrado');
    }
    res.redirect('/products?success=Producto eliminado exitosamente');
  } catch (error) {
    res.redirect('/products?error=Error al eliminar el producto');
  }
});

router.get('/inventory', (req, res) => {
  res.render('pages/inventory', {
    title: 'Gestión de Inventario',
    currentPath: '/inventory',
    successMessage: req.query.success || null,
    errorMessage: req.query.error || null,
  });
});

module.exports = router;
