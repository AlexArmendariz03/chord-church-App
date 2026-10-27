import type { Role } from "@/shared/auth/permissions"

// Pasos del recorrido de ayuda, por página y por rol.
// Cada paso señala un elemento marcado con data-tour="…"; si no está visible (por ejemplo, el menú
// de escritorio en el teléfono) se salta. Un paso sin `target` sale centrado, como bienvenida.

export type TourPage = "inicio" | "alabanzas" | "servicios" | "en-curso"

export type TourStep = {
  target?: string
  title: string
  description: string
}

const MENU_STEP: TourStep = {
  target: "menu",
  title: "Menú",
  description: "Desde aquí te mueves entre las secciones de la app."
}

const HELP_STEP: TourStep = {
  target: "usuario",
  title: "Tour en cada página",
  description: "En cualquier página, \"Tour guiado\" en tu menú de usuario te muestra cómo usarla."
}

const LEADER_STEPS: Record<TourPage, TourStep[]> = {
  inicio: [
    {
      title: "¡Bienvenido a Chord Church!",
      description: "Te mostramos en pocos pasos cómo preparar y dirigir cada servicio."
    },
    MENU_STEP,
    {
      target: "atajos",
      title: "Atajos",
      description: "Alabanzas para el cancionero, Servicios para armar cada fecha y En curso para dirigir en vivo."
    },
    {
      target: "proximos",
      title: "Próximos servicios",
      description: "Los servicios que vienen, con sus alabanzas en orden. El primero es el siguiente en llegar."
    },
    {
      target: "tarjeta-menu",
      title: "Acciones del servicio",
      description: "Edita o elimina el servicio desde este menú."
    },
    {
      target: "abrir-en-vivo",
      title: "Abrir en vivo",
      description: "Abre el servicio en En curso para dirigirlo el día del culto."
    },
    HELP_STEP
  ],
  alabanzas: [
    {
      target: "nueva-alabanza",
      title: "Nueva alabanza",
      description: "Agrega una alabanza con su letra, acordes y tono."
    },
    {
      target: "lista-alabanzas",
      title: "Cancionero",
      description: "Las alabanzas separadas en Júbilo y Adoración, con el inicio de la letra, el tono y sus etiquetas."
    },
    {
      target: "alabanza-menu",
      title: "Editar o eliminar",
      description: "Cada alabanza tiene su menú para corregirla o quitarla."
    }
  ],
  servicios: [
    {
      target: "agregar-evento",
      title: "Agregar evento",
      description: "Elige fecha y hora, y las alabanzas de júbilo, adoración y ofrenda en el orden en que se tocan. Si una ya se usó mucho en el mes, te avisa."
    },
    {
      target: "lista-servicios",
      title: "Próximos y anteriores",
      description: "En Anteriores puedes usar de nuevo un servicio pasado para no armarlo desde cero."
    },
    {
      target: "tarjeta-menu",
      title: "Acciones del servicio",
      description: "Editar, eliminar o, en los anteriores, usar de nuevo."
    }
  ],
  "en-curso": [
    {
      target: "elegir-servicio",
      title: "Servicio",
      description: "Elige qué servicio vas a dirigir."
    },
    {
      target: "lista-en-curso",
      title: "Orden de las alabanzas",
      description: "Toca cualquiera para saltar a ella. Antes de la ofrenda aparecen la oración y los anuncios, si el servicio los tiene."
    },
    {
      target: "vista-dirigente",
      title: "Vista del dirigente",
      description: "Ves el nombre de cada alabanza en grande. Con \"Ver letras\" cambias a la letra con acordes."
    },
    {
      target: "pantalla-completa",
      title: "Pantalla completa",
      description: "Para el escenario: todo en grande sobre un fondo oscuro, con varios temas de color."
    },
    {
      target: "navegacion",
      title: "Avanzar",
      description: "Pasa a la siguiente página o alabanza. También puedes deslizar la letra con el dedo o usar las flechas del teclado."
    }
  ]
}

const MUSICIAN_STEPS: Partial<Record<TourPage, TourStep[]>> = {
  inicio: [
    {
      title: "¡Bienvenido a Chord Church!",
      description: "Aquí ves los servicios que vienen y sigues las letras con acordes en vivo."
    },
    MENU_STEP,
    {
      target: "abrir-en-curso",
      title: "Servicio en curso",
      description: "Abre el servicio de hoy para seguir las letras y los acordes."
    },
    {
      target: "proximos",
      title: "Próximos servicios",
      description: "Las alabanzas de cada servicio en orden, con su tono, para ensayar con tiempo."
    },
    HELP_STEP
  ],
  "en-curso": [
    {
      target: "elegir-servicio",
      title: "Servicio",
      description: "Elige qué servicio vas a tocar."
    },
    {
      target: "lista-en-curso",
      title: "Orden de las alabanzas",
      description: "Toca cualquiera para saltar a ella."
    },
    {
      target: "herramientas",
      title: "Tono y letra",
      description: "Sube o baja medio tono con ♭ y ♯, muestra u oculta los acordes y cambia el tamaño de la letra con A− y A+. Solo cambia en tu pantalla."
    },
    {
      target: "pantalla-completa",
      title: "Pantalla completa",
      description: "Para el atril: la letra ocupa toda la pantalla, con fondo oscuro."
    },
    {
      target: "navegacion",
      title: "Avanzar",
      description: "Pasa a la siguiente página o alabanza. También puedes deslizar la letra con el dedo o usar las flechas del teclado."
    }
  ]
}

const PROJECTION_STEPS: Partial<Record<TourPage, TourStep[]>> = {
  inicio: [
    {
      title: "¡Bienvenido a Chord Church!",
      description: "Aquí tienes las alabanzas de cada servicio, en el orden en que se proyectan."
    },
    {
      target: "proximos",
      title: "Próximos servicios",
      description: "Cada servicio con su fecha y sus alabanzas en orden. Si el dirigente cambia algo, aquí se ve al instante."
    },
    HELP_STEP
  ]
}

const PAGE_BY_PATH: Record<string, TourPage> = {
  "/dashboard": "inicio",
  "/alabanzas": "alabanzas",
  "/servicios": "servicios",
  "/en-curso": "en-curso"
}

// Solo las páginas principales tienen recorrido (no la de editar una alabanza, por ejemplo)
export const tourPageFor = (pathname: string): TourPage | null => PAGE_BY_PATH[pathname] ?? null

// Un rol nuevo tiene que agregarse aquí (TypeScript lo pide), aunque sea con su recorrido vacío
const STEPS_BY_ROLE: Record<Role, Partial<Record<TourPage, TourStep[]>>> = {
  leader: LEADER_STEPS,
  musico: MUSICIAN_STEPS,
  proyeccion: PROJECTION_STEPS
}

export const tourStepsFor = (page: TourPage, role: Role): TourStep[] => STEPS_BY_ROLE[role][page] ?? []
