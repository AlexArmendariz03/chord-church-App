-- Las alabanzas de un servicio tienen que ser del cancionero de la misma iglesia que el servicio.
-- ServiceSong guarda la iglesia y sus dos llaves la incluyen: (serviceId, churchId) → Service y
-- (songId, churchId) → Song. Así la base, y no solo la app, rechaza mezclar iglesias.
-- El valor por defecto deja que el código anterior siga guardando mientras se publica; se quita
-- junto con los de User, Song y Service.

-- DropForeignKey
ALTER TABLE "ServiceSong" DROP CONSTRAINT "ServiceSong_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceSong" DROP CONSTRAINT "ServiceSong_songId_fkey";

-- AlterTable
ALTER TABLE "ServiceSong" ADD COLUMN     "churchId" TEXT NOT NULL DEFAULT 'el-palomar';

-- Cada fila toma la iglesia de su servicio
UPDATE "ServiceSong" AS ss SET "churchId" = s."churchId" FROM "Service" AS s WHERE s."id" = ss."serviceId";

-- CreateIndex
CREATE UNIQUE INDEX "Song_id_churchId_key" ON "Song"("id", "churchId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_id_churchId_key" ON "Service"("id", "churchId");

-- AddForeignKey
ALTER TABLE "ServiceSong" ADD CONSTRAINT "ServiceSong_serviceId_churchId_fkey" FOREIGN KEY ("serviceId", "churchId") REFERENCES "Service"("id", "churchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSong" ADD CONSTRAINT "ServiceSong_songId_churchId_fkey" FOREIGN KEY ("songId", "churchId") REFERENCES "Song"("id", "churchId") ON DELETE CASCADE ON UPDATE CASCADE;
