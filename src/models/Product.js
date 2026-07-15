const mongoose = require('mongoose');

const CATEGORIES = ['Labios', 'Rostro', 'Ojos', 'Brochas', 'Skincare', 'Accesorios'];
const STATUSES = ['DISPONIBLE', 'AGOTADO', 'INACTIVO'];
const SKIN_TYPES = ['Seca', 'Grasa', 'Mixta', 'Normal', 'Todos'];

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es obligatorio'],
      unique: true,
      trim: true,
      match: [/^[A-Z0-9\-]+$/, 'El SKU debe contener solo letras mayúsculas, números y guiones'],
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      minlength: [20, 'La descripción debe tener al menos 20 caracteres'],
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    marca: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: CATEGORIES,
        message: 'Categoría no válida. Opciones: ' + CATEGORIES.join(', '),
      },
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0.01, 'El precio debe ser mayor que cero'],
    },
    stockDisponible: {
      type: Number,
      required: [true, 'El stock disponible es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    tipoPielRecomendado: {
      type: [String],
      default: [],
      validate: {
        validator: (val) => val.every((t) => SKIN_TYPES.includes(t)),
        message: 'Tipo de piel no válido. Opciones: ' + SKIN_TYPES.join(', '),
      },
    },
    tono: {
      type: String,
      trim: true,
      default: '',
    },
    ingredientes: {
      type: [String],
      default: [],
    },
    peso: {
      type: String,
      trim: true,
      default: '',
    },
    imagenes: {
      type: [String],
      default: [],
      validate: {
        validator: (val) => val.every((url) => /^https?:\/\/.+/i.test(url) || /^\/uploads\/.+/.test(url)),
        message: 'Las imágenes deben ser URLs válidas o rutas locales',
      },
    },
    estado: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Estado no válido. Opciones: ' + STATUSES.join(', '),
      },
      default: 'DISPONIBLE',
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaActualizacion',
    },
    versionKey: false,
  }
);

productSchema.index({ categoria: 1 });
productSchema.index({ marca: 1 });
productSchema.index({ estado: 1 });
productSchema.index({ precio: 1 });
productSchema.index({ tipoPielRecomendado: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
