-- Iglesias: cada una con sus usuarios, su cancionero y sus servicios.
-- Todo lo que ya existe pasa a "El Palomar", que se puede renombrar desde la página Iglesias.
-- El valor por defecto de churchId deja que el código anterior siga guardando mientras se publica.

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_name_key" ON "Church"("name");

-- La iglesia de todo lo que ya existe
INSERT INTO "Church" ("id", "name") VALUES ('el-palomar', 'El Palomar');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "churchId" TEXT NOT NULL DEFAULT 'el-palomar';

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "churchId" TEXT NOT NULL DEFAULT 'el-palomar';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "churchId" TEXT NOT NULL DEFAULT 'el-palomar';

-- CreateIndex
CREATE INDEX "User_churchId_idx" ON "User"("churchId");

-- CreateIndex
CREATE INDEX "Song_churchId_idx" ON "Song"("churchId");

-- CreateIndex
CREATE INDEX "Service_churchId_eventDate_idx" ON "Service"("churchId", "eventDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
