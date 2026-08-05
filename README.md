# GlowFlow Makeup Catalog

Plataforma de e-commerce para maquillaje, skincare y productos de belleza. Arquitectura de **microservicios** con API Gateway, 3 bases de datos independientes y orquestación completa con Docker Compose.

## Arquitectura

```
Navegador / Cliente
       │
       ▼
┌─────────────────┐
│  API Gateway    │  :3000  (entry point único)
└───────┬─────────┘
        │
   ┌────┴──────────────────────────────┐
   ▼            ▼                      ▼
┌──────┐    ┌──────────┐    ┌───────────┐
│Catalog│   │  Orders  │    │  Review   │
│ :3001 │   │  :3002   │    │  :3004    │
│Express│   │ Express  │    │ Express   │
│MongDB│    │Prisma+Pg│    │Prisma+Pg  │
└──────┘    └──────────┘    └───────────┘
```

## Microservicios

| Servicio | Puerto | Base de datos | Descripción |
|---|---|---|---|
| `gateway` | 3000 | — | Proxy HTTP — entrada única |
| `makeup-catalog-service` | 3010 (int:3001) | MongoDB 7.0 | Catálogo, usuarios, vistas EJS |
| `orders-service` | 3011 (int:3002) | PostgreSQL 16 | Carrito, órdenes, guías |
| `review-service` | 3012 (int:3004) | PostgreSQL 16 | Reseñas, alertas restock |

**Infraestructura:** Consul (service discovery), 3 volúmenes persistentes, redes Docker internas.

## Stack Tecnológico

- **Backend:** Node.js 20, Express
- **Frontend:** EJS, CSS custom properties, Poppins + Playfair Display
- **Bases de datos:** MongoDB 7.0 (Mongoose), PostgreSQL 16 (Prisma)
- **Auth:** JWT (secreto compartido entre servicios)
- **Proxy:** http-proxy-middleware
- **DevOps:** Docker, Docker Compose, Consul
- **Testing:** Jest, Supertest

## Despliegue Rápido

```bash
git clone https://github.com/marisolv985/makeup-catalog-service.git
cd makeup-catalog-service
docker compose up -d
```

El catálogo estará en `http://localhost:3010` y el Gateway en `http://localhost:3000`.

## Credenciales por defecto

- **Admin:** `admin` / `admin123`
- **Cliente:** regístrate desde `/login`

## Endpoints principales

### Catálogo (API)
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/v1/cosmetics` | No |
| GET | `/api/v1/cosmetics/stock/:sku` | Bearer |
| POST | `/api/v1/cosmetics` | ADMIN |
| PATCH | `/api/v1/cosmetics/stock/decrease` | Bearer |
| PATCH | `/api/v1/cosmetics/stock/increase` | Bearer |

### Órdenes
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/v1/cart` | Bearer |
| POST | `/api/v1/cart/items` | Bearer |
| POST | `/api/v1/orders/checkout` | Bearer |
| GET | `/api/v1/orders` | Bearer |
| PATCH | `/api/v1/orders/:id/status` | ADMIN |

### Reseñas
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/v1/reviews/product/:sku` | No |
| POST | `/api/v1/reviews` | Bearer |
| POST | `/api/v1/alerts/subscribe` | Bearer |

## Estructura de Carpetas

```
├── docker-compose.yml
├── src/                    # Catalog Service (MongoDB)
│   ├── config/
│   ├── models/             # Product, User
│   ├── routes/views/       # Vistas EJS
│   └── utils/              # ordersClient, reviewClient
├── orders/                 # Orders Service (PostgreSQL)
│   ├── prisma/
│   └── src/
├── review/                 # Review Service (PostgreSQL)
│   ├── prisma/
│   └── src/
├── gateway/                # API Gateway
│   └── src/
└── public/                 # CSS, JS, imágenes
```

## Tests

```bash
cd orders && npm test      # Orders service (4 tests)
cd review && npm test      # Review service (próximamente)
```

## Colección Postman

Importa `postman/glowflow-collection.json` para probar todos los endpoints.

## Variables de Entorno

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Clave compartida entre microservicios |
| `MONGO_URI` | URL de conexión a MongoDB |
| `DATABASE_URL` | URL de conexión a PostgreSQL (Prisma) |
| `CONSUL_URL` | URL del service discovery |
| `NODE_ENV` | `production` / `development` |

## Versionado

[Ver releases](https://github.com/marisolv985/makeup-catalog-service/releases)

| Tag | Descripción |
|---|---|
| `v1.2.0` | Multi-stage builds, Postman collection, tests |
| `v1.1.0` | UI redesign, checkout, orders, monorepo |
| `v1.0.0` | Catálogo CRUD, RBAC, Lucide Icons |


## Despliegue en Producción (Cloud)

El sistema está desplegado en **Railway** (railway.com), con los 4 microservicios y sus 3 bases de datos corriendo como contenedores independientes, cada base de datos con su propio volumen persistente.

### URLs públicas

- **API Gateway (punto de entrada):** https://thriving-joy-production-621c.up.railway.app
- **Catálogo:** https://makeup-catalog-service-production.up.railway.app

Ambas URLs cuentan con certificado SSL/TLS válido y HTTPS forzado automáticamente por Railway.

### Evidencia de funcionamiento

```bash
curl https://thriving-joy-production-621c.up.railway.app/health
# {"status":"UP","service":"api-gateway","timestamp":"2026-08-05T18:51:57.482Z"}

curl https://makeup-catalog-service-production.up.railway.app/health
# {"status":"UP","service":"makeup-catalog-service","database":{"mongodb":"UP"},...}
```

### Pendientes

- **Balanceador de carga:** activar réplicas horizontales en el Gateway (funcionalidad nativa de Railway, aún no configurada).
- **Dominio personalizado:** se intentó con DuckDNS, FreeDNS y Dynu, pero no fue posible completar la propagación de los registros CNAME/TXT requeridos por Railway dentro del tiempo disponible.
