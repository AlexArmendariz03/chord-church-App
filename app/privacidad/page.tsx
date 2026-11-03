import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Aviso de privacidad · Chord Church"
}

const UPDATED_AT = "29 de octubre de 2026"

// Página pública: la enlazan el login, los términos y las fichas de App Store y Google Play
export default function PrivacyPage() {
  return (
    <main className="terms-page">
      <article className="terms-card">
        <Link href="/login" className="terms-back">← Volver</Link>
        <h1>Aviso de privacidad</h1>
        <p className="terms-updated">Última actualización: {UPDATED_AT}</p>

        <p>
          Este aviso explica qué datos guarda Chord Church, en la web y en la app para iPhone y Android, para
          qué los usa y qué puedes hacer con ellos.
        </p>

        <h2>1. Qué datos guardamos</h2>
        <p>
          <strong>Tu cuenta:</strong> tu nombre de usuario, tu rol (dirigente, músico o proyección), tu
          contraseña cifrada y el tema que eliges (claro, oscuro o automático). Las cuentas las crea el dirigente
          de tu iglesia; la app no pide tu nombre completo, correo, teléfono ni fecha de nacimiento.
        </p>
        <p>
          <strong>Lo que se crea en la app:</strong> las alabanzas con su letra y acordes, y los servicios con
          su fecha, sus alabanzas y la guía de oración y anuncios.
        </p>
        <p>
          <strong>En tu dispositivo:</strong> en la web, cookies para mantener tu sesión abierta y recordar el
          tema; en la app, la sesión se guarda cifrada en el teléfono. Cada dispositivo también recuerda cosas
          como si muestras los acordes o el tema del modo escenario.
        </p>
        <p>
          <strong>Al iniciar sesión:</strong> para frenar a quien intente adivinar contraseñas, se cuentan los
          intentos fallidos por usuario y por dirección IP durante unos minutos. Ese conteo no se guarda en la
          base de datos.
        </p>

        <h2>2. Lo que no hacemos</h2>
        <p>
          No usamos publicidad ni herramientas de rastreo o analítica, no vendemos tus datos y no los compartimos
          con otras empresas para sus fines. La app no usa tu ubicación, contactos, fotos, cámara ni micrófono.
        </p>

        <h2>3. Para qué los usamos</h2>
        <p>
          Solo para que la app funcione: iniciar tu sesión, mostrarte lo que tu rol puede ver y hacer, y
          guardar las alabanzas y servicios del equipo.
        </p>

        <h2>4. Dónde se guardan</h2>
        <p>
          La app está alojada en Vercel y la base de datos en Supabase, que guardan la información por nosotros
          con conexiones cifradas. Como cualquier servidor, pueden registrar datos técnicos de cada visita, como
          la dirección IP y la hora, para su seguridad y funcionamiento.
        </p>

        <h2>5. Cuánto tiempo</h2>
        <p>
          Tu cuenta y su información se guardan mientras seas parte del equipo. Cuando dejas el equipo o lo
          pides, se elimina tu cuenta y con ella tu usuario, tu rol, tu contraseña y tu tema. Las alabanzas y
          servicios son del equipo y se quedan.
        </p>

        <h2>6. Tus derechos</h2>
        <p>
          Puedes pedir ver, corregir o eliminar tus datos, o que se borre tu cuenta. Para hacerlo, habla con el
          dirigente de tu iglesia, que lo atiende en un plazo razonable. Si cierras sesión en un teléfono, la
          sesión guardada en él se borra.
        </p>

        <h2>7. Menores de edad</h2>
        <p>
          Si alguien menor de edad usa la app como parte del equipo, su cuenta la crea el dirigente con el
          conocimiento de su madre, padre o tutor, y guarda solo los datos de este aviso.
        </p>

        <h2>8. Cambios</h2>
        <p>
          Si cambia lo que hacemos con tus datos, actualizaremos este aviso y la fecha de arriba. Consulta
          también los <Link href="/terminos">Términos y condiciones</Link>.
        </p>

        <h2>9. Contacto</h2>
        <p>Para dudas o solicitudes sobre tus datos, habla con el dirigente de tu iglesia.</p>
      </article>
    </main>
  )
}
