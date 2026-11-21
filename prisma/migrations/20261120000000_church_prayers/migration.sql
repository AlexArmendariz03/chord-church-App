-- Las peticiones de cada iglesia, para el momento de oración de todos sus servicios
ALTER TABLE "Church" ADD COLUMN "prayerGuide" TEXT;

-- El Palomar empieza con su hoja de peticiones
UPDATE "Church" SET "prayerGuide" = btrim($peticiones$
Vamos a orar…
1)Por los nombres que aparecen en pantalla
2)Por este servicio que Dios edifique nuestras vidas
3)Por esta hermosa iglesia
-Nuestros nuevos conversos
-Nuestro ministerio de barrio
4)Por nuestra iglesia madre en Los Mochis Sinaloa
-Mi pastor Victor Higuera
-Mi pastor asistente Victor Higuera Véjar
5)Por nuestra iglesia líder en Mexico
-El pastor José Luis Gaxiola
-El pastor Daniel Najera
6)Por nuestra iglesia Lider a nivel mundial
-El pastor Greg Mitchel
7)Por nuestros obreros en el campo
8)Por más obreros, que Dios siga enviando obreros
9)Por los misioneros
10)Por la nación de Israel
11)Por Mexico, por nuestros gobernantes
“Si tiene una petición que no fue mencionada preséntela con un levantamiento de mano”
$peticiones$, E'\n') WHERE "id" = 'el-palomar' AND "prayerGuide" IS NULL;
