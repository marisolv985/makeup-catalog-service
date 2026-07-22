-- CreateEnum
CREATE TYPE "EstadoOrder" AS ENUM ('PENDIENTE_PAGO', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numeroGuia" TEXT,
    "estado" "EstadoOrder" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "totalPagar" DECIMAL(10,2) NOT NULL,
    "direccionEnvio" TEXT,
    "ciudad" TEXT,
    "codigoPostal" TEXT,
    "telefono" TEXT,
    "metodoPago" TEXT,
    "notas" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "productoSku" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "carritoId" INTEGER NOT NULL,
    "productoSku" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "imagenUrl" TEXT,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_usuarioId_idx" ON "Order"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_numeroGuia_key" ON "Order"("numeroGuia");

-- CreateIndex
CREATE INDEX "Order_estado_idx" ON "Order"("estado");

-- CreateIndex
CREATE INDEX "Order_fechaCreacion_idx" ON "Order"("fechaCreacion");

-- CreateIndex
CREATE INDEX "OrderItem_ordenId_idx" ON "OrderItem"("ordenId");

-- CreateIndex
CREATE INDEX "OrderItem_productoSku_idx" ON "OrderItem"("productoSku");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_usuarioId_key" ON "Cart"("usuarioId");

-- CreateIndex
CREATE INDEX "CartItem_carritoId_idx" ON "CartItem"("carritoId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_carritoId_productoSku_key" ON "CartItem"("carritoId", "productoSku");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
