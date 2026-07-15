# GlowFlow - Makeup Catalog Service

Microservicio encargado de administrar el catálogo de productos cosméticos de la plataforma **GlowFlow**.

## Descripción

Este microservicio gestiona de forma exclusiva el catálogo de productos cosméticos, proporcionando operaciones CRUD, búsqueda avanzada, filtrado por múltiples criterios y gestión de inventario. Está diseñado para integrarse con otros microservicios del ecosistema GlowFlow (API Gateway, orders-service, review-service, user-service).

## Patrones Implementados

- **Circuit Breaker (Opossum)**: Tolerancia a fallos en operaciones de stock. Si MongoDB falla, responde con degradación graceful.
- **Service Discovery (Consul)**: Registro automático al iniciar para que otros microservicios lo encuentren por nombre.
- **JWT Validation**: Middleware que valida tokens generados por el API Gateway / user-service.
- **Docker + Docker Compose**: Empaquetado completo con MongoDB y Consul.

## Arquitectura

El proyecto sigue el patrón **MVC + Clean Architecture**, separando las responsabilidades en capas bien definidas:

- **Configuración**: Conexión a base de datos, variables de entorno, Circuit Breakers, Service Discovery.
- **Models**: Definición de esquemas Mongoose.
- **Repositories**: Acceso directo a MongoDB.
- **Services**: Toda la lógica de negocio.
- **Controllers**: Reciben peticiones HTTP y delegan a services.
- **Validators**: Validación de entradas con express-validator.
- **Middlewares**: Autenticación JWT, manejo de errores, logging.
- **Routes**: Definición de endpoints (API + Views).
- **Utils**: Utilidades compartidas (ApiError, Circuit Breaker factory).
- **Docs**: Documentación Swagger.

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | LTS (20+) | Runtime |
| Express.js | ^4.21.0 | Framework HTTP |
| MongoDB | 7.0 | Base de datos |
| Mongoose | ^8.6.0 | ODM MongoDB |
| Opossum | ^8.5.0 | Circuit Breaker |
| Axios | ^1.18.1 | HTTP client (Consul) |
| jsonwebtoken | ^9.0.2 | JWT validation |
| express-validator | ^7.2.0 | Validación de entradas |
| multer | ^2.2.0 | Upload de imágenes |
| EJS | ^6.0.1 | Template engine (vistas) |
| helmet | ^8.0.0 | Seguridad HTTP |
| cors | ^2.8.5 | Cross-Origin |
| morgan | ^1.10.0 | Logging HTTP |
| compression | ^1.7.4 | Compresión gzip |
| swagger-jsdoc | ^6.2.8 | Documentación API |

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/marisolv985/makeup-catalog-service.git

# Entrar al directorio
cd makeup-catalog-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3001` |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/GlowFlowCatalogDB` |
| `JWT_SECRET` | Secreto para verificar tokens JWT | `tu_secreto_aqui` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CONSUL_URL` | URL del servidor Consul | `http://localhost:8500` |
| `SERVICE_NAME` | Nombre del servicio para Discovery | `makeup-catalog-service` |

## Ejecución

### Desarrollo local (sin Docker)

```bash
# Necesitas MongoDB corriendo localmente
npm run dev
```

### Con Docker (ecosistema completo)

```bash
# Construir imágenes y levantar todo (MongoDB + Consul + Servicio)
npm run docker:build
npm run docker:up

# Apagar todo
npm run docker:down

# Ver logs
npm run docker:logs
```

## URLs de Servicio

| Entorno | URL |
|---|---|
| API | `http://localhost:3001` |
| Swagger | `http://localhost:3001/api-docs` |
| Health Check | `http://localhost:3001/health` |
| Dashboard Web | `http://localhost:3001/` |
| Consul UI | `http://localhost:8500` |

## Endpoints API

### Productos (CRUD)

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `POST` | `/api/v1/cosmetics` | Crear producto | ADMIN |
| `GET` | `/api/v1/cosmetics` | Obtener todos (con filtros) | Cualquier usuario |
| `GET` | `/api/v1/cosmetics/:id` | Obtener por ID | Cualquier usuario |
| `GET` | `/api/v1/cosmetics/sku/:sku` | Obtener por SKU | Cualquier usuario |
| `PUT` | `/api/v1/cosmetics/:id` | Actualizar producto | ADMIN |
| `DELETE` | `/api/v1/cosmetics/:id` | Eliminar producto (soft delete) | ADMIN |

### Inventario (con Circuit Breaker)

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/api/v1/cosmetics/stock/:sku` | Consultar stock | Cualquier usuario |
| `GET` | `/api/v1/cosmetics/exists/:sku` | Verificar existencia | Cualquier usuario |
| `PATCH` | `/api/v1/cosmetics/stock/decrease` | Descontar stock | ADMIN |
| `PATCH` | `/api/v1/cosmetics/stock/increase` | Incrementar stock | ADMIN |

### Otros

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check (tipo Actuator) |
| `GET` | `/api-docs` | Documentación Swagger |

## Filtros de Búsqueda

| Parámetro | Tipo | Descripción |
|---|---|---|
| `marca` | String | Filtrar por marca |
| `categoria` | Enum | Labios, Rostro, Ojos, Brochas, Skincare, Accesorios |
| `tipoPiel` | String | Seca, Grasa, Mixta, Normal, Todos |
| `tono` | String | Filtrar por tono |
| `estado` | Enum | DISPONIBLE, AGOTADO, INACTIVO |
| `precioMin` | Number | Precio mínimo |
| `precioMax` | Number | Precio máximo |
| `busqueda` | String | Búsqueda libre (título, descripción, marca) |
| `page` | Integer | Página (default: 1) |
| `limit` | Integer | Resultados por página (default: 12, max: 100) |

## Ejemplos de Uso

### Crear producto

```bash
curl -X POST http://localhost:3001/api/v1/cosmetics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "sku": "COSM-LIP-RED-01",
    "titulo": "Matte Liquid Lipstick",
    "descripcion": "Labial de larga duración con acabado mate y color intenso que dura hasta 8 horas",
    "marca": "GlowBeauty",
    "categoria": "Labios",
    "precio": 299.00,
    "stockDisponible": 15,
    "tipoPielRecomendado": ["Todos", "Seca"],
    "tono": "Rojo Carmesí",
    "ingredientes": ["Vitamina E", "Aceite de Argán"],
    "peso": "3.5g",
    "estado": "DISPONIBLE"
  }'
```

### Respuesta (formato contrato API)

```json
{
  "id": "65b2d7f8c9e4a321a0f5e123",
  "sku": "COSM-LIP-RED-01",
  "titulo": "Matte Liquid Lipstick",
  "marca": "GlowBeauty",
  "categoria": "Labios",
  "precio": 299.00,
  "stockDisponible": 15,
  "status": "DISPONIBLE"
}
```

### Consultar stock (consumido por orders-service)

```bash
curl http://localhost:3001/api/v1/cosmetics/stock/COSM-LIP-RED-01 \
  -H "Authorization: Bearer <TOKEN>"
# {"sku":"COSM-LIP-RED-01","stockDisponible":15}
```

### Descontar stock (consumido por orders-service)

```bash
curl -X PATCH http://localhost:3001/api/v1/cosmetics/stock/decrease \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"sku":"COSM-LIP-RED-01","cantidad":2}'
```

## Modelo de Datos

```json
{
  "_id": "ObjectId",
  "sku": "COSM-LIP-RED-01",
  "titulo": "Matte Liquid Lipstick",
  "descripcion": "Labial de larga duración con acabado mate",
  "marca": "GlowBeauty",
  "categoria": "Labios",
  "precio": 299.00,
  "stockDisponible": 15,
  "tipoPielRecomendado": ["Todos", "Seca"],
  "tono": "Rojo Carmesí",
  "ingredientes": ["Vitamina E", "Aceite de Argán"],
  "peso": "3.5g",
  "imagenes": ["/uploads/abc123.jpg"],
  "estado": "DISPONIBLE",
  "fechaCreacion": "2026-07-12T10:30:00.000Z",
  "fechaActualizacion": "2026-07-12T10:30:00.000Z"
}
```

## Estructura del Proyecto

```
makeup-catalog-service/
├── .env                    # Variables de entorno (no commitear)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore              # Archivos ignorados por git
├── .dockerignore           # Archivos ignorados por Docker
├── Dockerfile              # Imagen Docker del servicio
├── docker-compose.yml      # Orquestación Docker
├── package.json            # Dependencias y scripts
├── README.md               # Esta documentación
├── server.js               # Punto de entrada
├── public/                 # Archivos estáticos
│   ├── css/styles.css
│   ├── js/app.js
│   ├── images/
│   └── uploads/            # Imágenes subidas por usuarios
└── src/
    ├── app.js              # Configuración de Express
    ├── config/
    │   ├── database.js     # Conexión a MongoDB
    │   ├── upload.js       # Configuración de Multer
    │   ├── discovery.js    # Service Discovery (Consul)
    │   └── circuitBreakers.js  # Circuit Breakers (Opossum)
    ├── controllers/
    │   └── cosmeticsController.js
    ├── services/
    │   └── cosmeticsService.js
    ├── repositories/
    │   └── cosmeticsRepository.js
    ├── models/
    │   ├── Product.js      # Modelo Mongoose
    │   └── User.js         # Modelo de usuario con roles
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── errorHandler.js
    │   ├── requestLogger.js
    │   └── validate.js
    ├── validators/
    │   └── cosmeticsValidator.js
    ├── routes/
    │   ├── authRoutes.js         # Login, registro, logout
    │   ├── cosmeticsRoutes.js    # Rutas API
    │   └── views/
    │       └── viewRoutes.js     # Rutas de vistas
    ├── views/                    # Plantillas EJS
    │   ├── layouts/
    │   ├── partials/
    │   ├── pages/
    │   └── errors/
    ├── utils/
    │   ├── ApiError.js
    │   └── circuitBreaker.js
    └── docs/
        └── swagger.js
```

## Sistema de Autenticación

| Componente | Detalle |
|---|---|
| **Login/Registro** | Formularios EJS con validación server-side |
| **JWT** | Tokens en cookies (`gf_token`), httpOnly, sameSite: lax |
| **Roles** | ADMIN, EDITOR, VIEWER (mongoose enum en User model) |
| **Admin por defecto** | Usuario: `admin` / Contraseña: `admin123` (rol ADMIN) |

### Seed de datos iniciales

```bash
npm run seed
```

Crea 18 productos de ejemplo (6 categorías) y el usuario admin.

## Interfaz de Usuario

- **Lucide Icons**: Iconos SVG modernos vía CDN (`lucide@0.344.0`), reemplazando emojis en toda la UI.
- **Diseño responsivo**: Filtros colapsables, tarjetas de producto, paginación.
- **Temas de color**: Paleta rosa/purple con variables CSS customizables.

## Buenas Prácticas Aplicadas

- **SOLID**: Cada clase tiene una única responsabilidad.
- **Separación de capas**: Controllers, Services, Repositories claramente separados.
- **Circuit Breaker**: Operaciones de stock protegidas contra fallos en cascada.
- **Service Discovery**: Registro automático con Consul para integración con otros servicios.
- **Validación**: Todas las entradas se validan con express-validator.
- **Manejo de errores**: Middleware global con formato estándar.
- **Seguridad**: Helmet, CORS, JWT validation.
- **Logging**: Morgan con método, ruta, código HTTP.
- **Soft delete**: Los productos se desactivan, no se eliminan físicamente.
- **Documentación**: Swagger completo con schemas y ejemplos.
- **Inventario atómico**: Operaciones de stock con atomicidad de MongoDB.
- **Docker**: Empaquetado completo con health checks.

## Integración con Otros Microservicios

- **API Gateway**: Valida tokens JWT y enruta al servicio.
- **orders-service**: Consulta stock (`GET /stock/:sku`), verifica existencia (`GET /exists/:sku`), descuenta inventario (`PATCH /stock/decrease`).
- **review-service**: Consulta productos por ID o SKU.
- **user-service**: Genera los tokens JWT que este servicio valida.
