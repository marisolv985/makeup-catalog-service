require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glowflow-catalog';

const products = [
  {
    sku: 'LIP-001',
    titulo: 'Labial Líquido Mate Velvet',
    descripcion: 'Labial líquido de larga duración con acabado mate aterciopelado. Fórmula enriquecida con vitamina E que hidrata mientras cubre con un solo trazo.',
    marca: 'GlowFlow',
    categoria: 'Labios',
    precio: 289.00,
    stockDisponible: 150,
    tipoPielRecomendado: ['Todos'],
    tono: 'Rojo Carmesí',
    ingredientes: ['Vitamina E', 'Aceite de Argán', 'Cera de Candelilla'],
    peso: '4.5 ml',
    imagenes: ['https://images.pexels.com/photos/1213558/pexels-photo-1213558.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'LIP-002',
    titulo: 'Gloss Hidratante Brillante',
    descripcion: 'Brillo labial con efecto espejo y micro perlas iridiscentes. No es pegajoso y aporta volumen visible desde la primera aplicación.',
    marca: 'GlowFlow',
    categoria: 'Labios',
    precio: 219.00,
    stockDisponible: 200,
    tipoPielRecomendado: ['Todos'],
    tono: 'Rosa Nude',
    ingredientes: ['Ácido Hialurónico', 'Colágeno', 'Vitamina E'],
    peso: '8 ml',
    imagenes: ['https://images.pexels.com/photos/7256149/pexels-photo-7256149.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'LIP-003',
    titulo: 'Bálsamo Labial Tintado SPF15',
    descripcion: 'Bálsamo labial con color sutil y protección solar. Perfecto para uso diario con acabado natural y fragancia de fresa.',
    marca: 'GlowFlow',
    categoria: 'Labios',
    precio: 159.00,
    stockDisponible: 300,
    tipoPielRecomendado: ['Seca', 'Normal', 'Todos'],
    tono: 'Fresa',
    ingredientes: ['Manteca de Karité', 'SPF15', 'Vitamina C'],
    peso: '4g',
    imagenes: ['https://images.pexels.com/photos/3123/woman-makeup-beauty-lipstick.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ROS-001',
    titulo: 'Base de Maquillaje HD Full Cover',
    descripcion: 'Base de maquillaje de alta definición con cobertura total. Fórmula no comedogénica que controla la grasa durante 12 horas.',
    marca: 'GlowFlow',
    categoria: 'Rostro',
    precio: 449.00,
    stockDisponible: 100,
    tipoPielRecomendado: ['Grasa', 'Mixta'],
    tono: 'Beige Natural',
    ingredientes: ['Ácido Salicílico', 'Niacinamida', 'Silica'],
    peso: '30 ml',
    imagenes: ['https://images.pexels.com/photos/12323034/pexels-photo-12323034.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ROS-002',
    titulo: 'Polvo Compacto Matte Finish',
    descripcion: 'Polvo compacto de acabado mate que fija el maquillaje y controla la brillantez. Puede usarse solo o sobre base.',
    marca: 'GlowFlow',
    categoria: 'Rostro',
    precio: 329.00,
    stockDisponible: 120,
    tipoPielRecomendado: ['Grasa', 'Mixta'],
    tono: 'Translúcido',
    ingredientes: ['Talc', 'Sílice', 'Vitamina E'],
    peso: '12g',
    imagenes: ['https://images.pexels.com/photos/7290688/pexels-photo-7290688.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ROS-003',
    titulo: 'Rubor Cream Stick',
    descripcion: 'Rubor en barra de textura sedosa que se difumina fácilmente. Aporta un brillo saludable natural con un solo toque.',
    marca: 'GlowFlow',
    categoria: 'Rostro',
    precio: 269.00,
    stockDisponible: 80,
    tipoPielRecomendado: ['Todos'],
    tono: 'Durazno',
    ingredientes: ['Aceite de Jojoba', 'Vitamina E', 'Cera de Abeja'],
    peso: '8g',
    imagenes: ['https://images.pexels.com/photos/6148/brush-makeup-make-up-brushes.jpg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'OJO-001',
    titulo: 'Paleta de Sombras Nude 18 Colores',
    descripcion: 'Paleta completa con 18 tonos nude que van del claro al intenso. Acabados mate y shimmer en una sola paleta versátil.',
    marca: 'GlowFlow',
    categoria: 'Ojos',
    precio: 599.00,
    stockDisponible: 60,
    tipoPielRecomendado: ['Todos'],
    tono: 'Nude Collection',
    ingredientes: ['Mica', 'Talc', 'Aceite de Ricino'],
    peso: '22g',
    imagenes: ['https://images.pexels.com/photos/11742218/pexels-photo-11742218.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'OJO-002',
    titulo: 'Máscara de Pestañas Volumen Extremo',
    descripcion: 'Rímel de alto impacto que aporta volumen y longitud sin grumos. Per cepillo en forma de reloj de arena para llegar a cada pestaña.',
    marca: 'GlowFlow',
    categoria: 'Ojos',
    precio: 299.00,
    stockDisponible: 180,
    tipoPielRecomendado: ['Todos'],
    tono: 'Negro Intenso',
    ingredientes: ['Cera de Carnaúba', 'Biotina', 'Pantenol'],
    peso: '12 ml',
    imagenes: ['https://images.pexels.com/photos/6833991/pexels-photo-6833991.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'OJO-003',
    titulo: 'Delineador Líquido Waterproof',
    descripcion: 'Delineador líquido de punta fina ultra precisa. Resistente al agua y al sudor con secado rápido en 30 segundos.',
    marca: 'GlowFlow',
    categoria: 'Ojos',
    precio: 249.00,
    stockDisponible: 160,
    tipoPielRecomendado: ['Todos'],
    tono: 'Negro',
    ingredientes: ['Pigmentos minerales', 'Polímero filmógeno'],
    peso: '1 ml',
    imagenes: ['https://images.pexels.com/photos/11672344/pexels-photo-11672344.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'BRO-001',
    titulo: 'Set de Brochas Profesional 12 Piezas',
    descripcion: 'Set completo de brochas de maquillaje con fibras sintéticas suaves. Incluye estuche de cuero vegano para transporte.',
    marca: 'GlowFlow',
    categoria: 'Brochas',
    precio: 899.00,
    stockDisponible: 40,
    tipoPielRecomendado: ['Todos'],
    tono: 'Rosa Dorado',
    ingredientes: [],
    peso: '350g',
    imagenes: ['https://images.pexels.com/photos/12969218/pexels-photo-12969218.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'BRO-002',
    titulo: 'Brocha Kabuki Retráctil',
    descripcion: 'Brocha kabuki con cerdas ultra densas y mecanismo retráctil. Ideal para polvos y bases minerales.',
    marca: 'GlowFlow',
    categoria: 'Brochas',
    precio: 349.00,
    stockDisponible: 70,
    tipoPielRecomendado: ['Todos'],
    tono: 'Negro Dorado',
    ingredientes: [],
    peso: '45g',
    imagenes: ['https://images.pexels.com/photos/8881962/pexels-photo-8881962.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'SKU-001',
    titulo: 'Primer Hidratante Illuminating',
    descripcion: 'Primer facial con partículas luminiscentes que iluminan la piel y preparan para el maquillaje. Duración 24 horas.',
    marca: 'GlowFlow',
    categoria: 'Skincare',
    precio: 389.00,
    stockDisponible: 90,
    tipoPielRecomendado: ['Normal', 'Seca', 'Todos'],
    tono: 'Dorado Sutil',
    ingredientes: ['Ácido Hialurónico', 'Niacinamida', 'Vitamina C', 'Partículas Luminiscentes'],
    peso: '30 ml',
    imagenes: ['https://images.pexels.com/photos/7290640/pexels-photo-7290640.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'SKU-002',
    titulo: 'Setting Spray Fijador 12h',
    descripcion: 'Spray fijador que bloquea el maquillaje por 12 horas. Fórmula ligera que no deja sensación pegajosa.',
    marca: 'GlowFlow',
    categoria: 'Skincare',
    precio: 279.00,
    stockDisponible: 150,
    tipoPielRecomendado: ['Todos'],
    tono: '',
    ingredientes: ['Aloe Vera', 'Glicerina', 'Pantenol'],
    peso: '100 ml',
    imagenes: ['https://images.pexels.com/photos/7290632/pexels-photo-7290632.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ACC-001',
    titulo: 'Espejo LED con Luz Regulable',
    descripcion: 'Espejo de maquillaje con 3 niveles de luz LED y aumento de 10x. Carga por USB con cable incluido.',
    marca: 'GlowFlow',
    categoria: 'Accesorios',
    precio: 649.00,
    stockDisponible: 30,
    tipoPielRecomendado: ['Todos'],
    tono: 'Blanco',
    ingredientes: [],
    peso: '400g',
    imagenes: ['https://images.pexels.com/photos/324654/pexels-photo-324654.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ACC-002',
    titulo: 'Beautycase Organizer Rosa',
    descripcion: 'Organizador de maquillaje con múltiples compartimentos y espejo integrado. Perfecto para llevar tu rutina de viaje.',
    marca: 'GlowFlow',
    categoria: 'Accesorios',
    precio: 499.00,
    stockDisponible: 25,
    tipoPielRecomendado: ['Todos'],
    tono: 'Rosa Pastel',
    ingredientes: [],
    peso: '600g',
    imagenes: ['https://images.pexels.com/photos/457704/pexels-photo-457704.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'ROS-004',
    titulo: 'Iluminador Liquido Shimmer',
    descripcion: 'Iluminador líquido con micro perlas que aporta un brillo natural a pómulos y zonas altas del rostro.',
    marca: 'GlowFlow',
    categoria: 'Rostro',
    precio: 319.00,
    stockDisponible: 95,
    tipoPielRecomendado: ['Todos'],
    tono: 'Champagne',
    ingredientes: ['Mica', 'Aceite de Jojoba', 'Vitamina E'],
    peso: '15 ml',
    imagenes: ['https://images.pexels.com/photos/7290627/pexels-photo-7290627.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'LIP-004',
    titulo: 'Lápiz Labial Contorno',
    descripcion: 'Lápiz labial de textura cremosa que define y previene que el labial se difumine. Vitaminas que cuidan los labios.',
    marca: 'GlowFlow',
    categoria: 'Labios',
    precio: 149.00,
    stockDisponible: 220,
    tipoPielRecomendado: ['Todos'],
    tono: 'Rojo',
    ingredientes: ['Vitamina E', 'Manteca de Karité'],
    peso: '1.2g',
    imagenes: ['https://images.pexels.com/photos/1309475/pexels-photo-1309475.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
  {
    sku: 'SKU-003',
    titulo: 'Corrector Ojeras High Coverage',
    descripcion: 'Corrector de alta cobertura que elimina ojeras y manchas. Fórmula hidratante que no se asienta en líneas de expresión.',
    marca: 'GlowFlow',
    categoria: 'Skincare',
    precio: 299.00,
    stockDisponible: 130,
    tipoPielRecomendado: ['Todos'],
    tono: 'Beige Claro',
    ingredientes: ['Ácido Hialurónico', 'Cafeína', 'Vitamina K'],
    peso: '6 ml',
    imagenes: ['https://images.pexels.com/photos/12322969/pexels-photo-12322969.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'],
    estado: 'DISPONIBLE',
  },
];

async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a:', MONGO_URI);

    const count = await Product.countDocuments();
    console.log(`Productos existentes: ${count}`);

    if (count > 0) {
      console.log('Ya hay productos. Limpiando coleccion...');
      await Product.deleteMany({});
    }

    console.log('Insertando productos de ejemplo...');
    const inserted = await Product.insertMany(products);
    console.log(`${inserted.length} productos insertados correctamente.`);

    const afterCount = await Product.countDocuments();
    console.log(`Total productos en BD: ${afterCount}`);

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        email: 'admin@glowflow.com',
        password: 'admin123',
        nombre: 'Administrador',
        rol: 'ADMIN',
      });
      await admin.save();
      console.log('Usuario admin creado (admin / admin123)');
    } else {
      console.log('Usuario admin ya existe.');
    }
  } catch (err) {
    console.error('Error al sembrar productos:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
  }
}

seed();
