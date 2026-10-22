import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos y condiciones · Chord Church"
}

const UPDATED_AT = "22 de octubre de 2026"

// Public page: linked from the login and from the user menu
export default function TermsPage() {
  return (
    <main className="terms-page">
      <article className="terms-card">
        <Link href="/login" className="terms-back">← Volver</Link>
        <h1>Términos y condiciones</h1>
        <p className="terms-updated">Última actualización: {UPDATED_AT}</p>

        <h2>1. Qué es Chord Church</h2>
        <p>
          Chord Church es una herramienta para que el equipo de alabanza de la iglesia organice sus canciones
          y servicios. Al usarla aceptas estos términos.
        </p>

        <h2>2. Tu cuenta</h2>
        <p>
          Las cuentas las crea el dirigente de tu iglesia. Cuida tu usuario y contraseña y no los compartas;
          lo que se haga con tu cuenta es tu responsabilidad.
        </p>

        <h2>3. Uso permitido</h2>
        <p>
          Usa la app solo para las actividades del ministerio de tu iglesia. No copies, publiques ni compartas
          las letras fuera de la app, y no intentes entrar a información que no te corresponde ni afectar su
          funcionamiento.
        </p>

        <h2>4. Letras y canciones</h2>
        <p>
          Las letras y la música pertenecen a sus autores y editoriales. La app solo las muestra al equipo para
          preparar y dirigir la alabanza. Quien sube una letra debe tener permiso para usarla. Si eres autor o
          representas una canción y quieres que la retiremos, avísanos y la quitaremos.
        </p>

        <h2>5. Tus datos</h2>
        <p>
          Guardamos tu nombre de usuario, tu rol y tu contraseña cifrada, además de una cookie para mantener tu
          sesión abierta. No vendemos tus datos ni los compartimos con nadie, salvo con los servicios donde
          está alojada la app.
        </p>

        <h2>6. Disponibilidad</h2>
        <p>
          La app se ofrece tal como está. Hacemos lo posible para que funcione bien, pero puede tener fallas o
          interrupciones, y no somos responsables por los daños que resulten de su uso.
        </p>

        <h2>7. Cambios</h2>
        <p>
          Podemos actualizar estos términos. La fecha de arriba indica la versión vigente; si sigues usando la
          app, aceptas los cambios.
        </p>

        <h2>8. Contacto</h2>
        <p>Para dudas o solicitudes, habla con el dirigente de tu iglesia.</p>
      </article>
    </main>
  )
}
