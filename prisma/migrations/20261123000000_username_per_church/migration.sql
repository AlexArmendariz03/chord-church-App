-- El usuario es único dentro de su iglesia, no en toda la app: puede haber un "juan" en cada una.
-- Compatible con el código anterior: mientras nadie repita un usuario, buscar solo por usuario sigue dando uno.
DROP INDEX "User_username_key";

-- El índice único (churchId, username) también sirve para buscar por iglesia
DROP INDEX "User_churchId_idx";

CREATE UNIQUE INDEX "User_churchId_username_key" ON "User"("churchId", "username");

-- El login busca por usuario en todas las iglesias
CREATE INDEX "User_username_idx" ON "User"("username");
