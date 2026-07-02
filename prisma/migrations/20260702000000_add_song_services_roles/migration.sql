CREATE TYPE "UserRole" AS ENUM ('leader', 'musico');
CREATE TYPE "SongCategory" AS ENUM ('jubilo', 'adoracion');

ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'musico';
ALTER TABLE "Song" ADD COLUMN "key" TEXT NOT NULL DEFAULT 'C';
ALTER TABLE "Song" ADD COLUMN "category" "SongCategory" NOT NULL DEFAULT 'jubilo';
ALTER TABLE "Song" ADD COLUMN "lyrics" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Song" ALTER COLUMN "payload" DROP NOT NULL;

CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceSong" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "category" "SongCategory" NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "ServiceSong_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceSong_serviceId_songId_key" ON "ServiceSong"("serviceId", "songId");
CREATE INDEX "ServiceSong_serviceId_category_idx" ON "ServiceSong"("serviceId", "category");
ALTER TABLE "ServiceSong" ADD CONSTRAINT "ServiceSong_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceSong" ADD CONSTRAINT "ServiceSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
