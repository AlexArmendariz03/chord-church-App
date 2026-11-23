import type { PropsWithChildren } from "react"
import { Layout as ALayout } from "antd"
import { AccountTheme } from "@/features/layout/client/components/account-theme"
import HeaderBar from "@/features/layout/client/components/header"
import { SessionProvider } from "@/features/auth/client/session-provider"
import { findChurchSafely } from "@/features/churches/server/church-queries"
import { findAccountTheme } from "@/features/layout/server/theme-queries"
import { AppTour } from "@/features/tour/client/app-tour"
import { getSessionUser } from "@/shared/server/session"

// Marco de todas las páginas con sesión (encabezado, menú y recorrido). El grupo (app) no cambia
// las URLs; login y términos quedan fuera.
export default async function AppLayout({ children }: PropsWithChildren) {
  const user = await getSessionUser()
  const [accountTheme, church] = user
    ? await Promise.all([findAccountTheme(user), findChurchSafely(user.churchId)])
    : [null, null]

  return (
    <SessionProvider user={user} church={church}>
      <ALayout className="layout">
        <HeaderBar />
        <div className="content">{children}</div>
      </ALayout>
      <AppTour />
      <AccountTheme theme={accountTheme} />
    </SessionProvider>
  )
}
