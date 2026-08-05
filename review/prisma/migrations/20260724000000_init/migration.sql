CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "productoSku" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestockAlert" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "productoSku" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestockAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_productoSku_idx" ON "Review"("productoSku");
CREATE INDEX "Review_usuarioId_idx" ON "Review"("usuarioId");
CREATE INDEX "RestockAlert_productoSku_idx" ON "RestockAlert"("productoSku");
CREATE INDEX "RestockAlert_usuarioId_idx" ON "RestockAlert"("usuarioId");
