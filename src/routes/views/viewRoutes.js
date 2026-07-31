const { Router } = require('express');
const Product = require('../../models/Product');
const upload = require('../../config/upload');
const { requireAuth, requireAdmin } = require('../../middlewares/authMiddleware');
const { escapeRegex } = require('../../utils/helpers');
const { deleteUploadedImages } = require('../../utils/fileCleanup');
const reviewClient = require('../../utils/reviewClient');
const User = require('../../models/User');

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
      { $limit: 8 },
    ]);

    const featured = await Product.find({ estado: 'DISPONIBLE', stockDisponible: { $gt: 0 } })
      .sort({ fechaCreacion: -1 })
      .limit(8);

    res.render('pages/dashboard', {
      title: 'Dashboard',
      currentPath: '/',
      stats,
      categories,
      featured,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/dashboard', {
      title: 'Dashboard',
      currentPath: '/',
      stats: { totalProducts: 0, availableProducts: 0, outOfStockProducts: 0, inactiveProducts: 0 },
      categories: [],
      featured: [],
      errorMessage: 'Error al cargar el dashboard',
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { marca, categoria, tipoPiel, tono, estado, precioMin, precioMax, busqueda, stock, sortBy = 'fechaCreacion', sortOrder = 'desc', page = 1, limit = 12 } = req.query;

    const filters = {};
    if (marca) filters.marca = { $regex: escapeRegex(marca), $options: 'i' };
    if (categoria) filters.categoria = categoria;
    if (tipoPiel) filters.tipoPielRecomendado = { $in: [tipoPiel] };
    if (tono) filters.tono = { $regex: escapeRegex(tono), $options: 'i' };
    if (estado) filters.estado = estado;
    if (precioMin || precioMax) {
      filters.precio = {};
      if (precioMin) filters.precio.$gte = parseFloat(precioMin);
      if (precioMax) filters.precio.$lte = parseFloat(precioMax);
    }
    if (stock) {
      filters.stockDisponible = { $gte: parseInt(stock, 10) };
    }
    if (busqueda) {
      const safe = escapeRegex(busqueda);
      filters.$or = [
        { titulo: { $regex: safe, $options: 'i' } },
        { descripcion: { $regex: safe, $options: 'i' } },
        { marca: { $regex: safe, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const sortField = ['fechaCreacion', 'precio', 'titulo', 'stockDisponible'].includes(sortBy) ? sortBy : 'fechaCreacion';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .sort({ [sortField]: sortDir })
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
      if (stock) params.set('stock', stock);
      if (busqueda) params.set('busqueda', busqueda);
      if (sortBy && sortBy !== 'fechaCreacion') params.set('sortBy', sortBy);
      if (sortOrder && sortOrder !== 'desc') params.set('sortOrder', sortOrder);
      params.set('page', p);
      return params.toString();
    };

    res.render('pages/products', {
      title: 'Catálogo de Productos',
      currentPath: '/products',
      products,
      pagination,
      filters: req.query,
      sortBy,
      sortOrder,
      buildPaginationQuery: buildQuery,
      breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Productos' }],
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
      breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Productos' }],
      errorMessage: 'Error al cargar los productos',
    });
  }
});

router.get('/products/new', requireAdmin, (req, res) => {
  res.render('pages/productForm', {
    title: 'Nuevo Producto',
    currentPath: '/products',
    product: {},
    isEditing: false,
    breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/products' }, { label: 'Nuevo Producto' }],
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
    var reviewData = { reviews: [], stats: { promedio: 0, total: 0 } };
    try {
      reviewData = await reviewClient.getReviews(product.sku);
    } catch (e) { /* silently ignore review errors */ }
    res.render('pages/productDetail', {
      title: product.titulo,
      currentPath: '/products',
      product,
      reviewData,
      breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/products' }, { label: product.titulo }],
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.redirect('/products?error=ID de producto inválido');
  }
});

router.get('/products/:id/edit', requireAdmin, async (req, res) => {
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
      breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/products' }, { label: 'Editar ' + product.titulo }],
      successMessage: null,
      errorMessage: null,
    });
  } catch (error) {
    res.redirect('/products?error=ID de producto inválido');
  }
});

router.post('/products', requireAdmin, upload.array('imagenesArchivos', 10), async (req, res) => {
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

router.post('/products/:id', requireAdmin, upload.array('imagenesArchivos', 10), async (req, res) => {
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
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.imagenes && oldProduct.imagenes.length > 0) {
        const removed = oldProduct.imagenes.filter(old => !imagenes.includes(old));
        deleteUploadedImages(removed);
      }
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

router.post('/products/:id/delete', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/products?error=Producto no encontrado');
    }
    deleteUploadedImages(product.imagenes);
    await Product.findByIdAndUpdate(req.params.id, { estado: 'INACTIVO' });
    res.redirect('/products?success=Producto eliminado exitosamente');
  } catch (error) {
    res.redirect('/products?error=Error al eliminar el producto');
  }
});

router.post('/products/:id/review', requireAuth, upload.array('reviewImages', 5), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products?error=Producto no encontrado');
    var imagenes = [];
    if (req.files && req.files.length > 0) {
      imagenes = req.files.map(function(f) { return '/uploads/' + f.filename; });
    }
    await reviewClient.createReview(req.user, product.sku, parseInt(rating), comment, imagenes);
    res.redirect(`/products/${req.params.id}?success=Reseña publicada`);
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al publicar reseña';
    res.redirect(`/products/${req.params.id}?error=${encodeURIComponent(msg)}`);
  }
});

router.post('/products/:id/alert', requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/products?error=Producto no encontrado');
    await reviewClient.subscribeAlert(req.user, product.sku);
    res.redirect(`/products/${req.params.id}?success=Te avisaremos cuando vuelva el stock`);
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al suscribirse';
    res.redirect(`/products/${req.params.id}?error=${encodeURIComponent(msg)}`);
  }
});

router.get('/inventory', requireAdmin, (req, res) => {
  res.render('pages/inventory', {
    title: 'Gestión de Inventario',
    currentPath: '/inventory',
    successMessage: req.query.success || null,
    errorMessage: req.query.error || null,
  });
});

router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ fechaCreacion: -1 });
    res.render('pages/adminUsers', {
      title: 'Gestión de Usuarios',
      currentPath: '/admin/users',
      users,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.redirect('/?error=Error al cargar usuarios');
  }
});

router.post('/admin/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(rol)) {
      return res.redirect('/admin/users?error=Rol no válido');
    }
    if (req.params.id === req.user.id) {
      return res.redirect('/admin/users?error=No puedes cambiar tu propio rol');
    }
    await User.findByIdAndUpdate(req.params.id, { rol });
    res.redirect('/admin/users?success=Rol actualizado exitosamente');
  } catch (error) {
    res.redirect('/admin/users?error=Error al actualizar rol');
  }
});

module.exports = router;
