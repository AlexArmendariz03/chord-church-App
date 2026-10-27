import type { PropsWithChildren } from "react"
import { Layout as ALayout } from "antd"
import { getSessionUser } from "@/shared/server/session"
import { AppTour } from "@/features/tour/client/app-tour"
import HeaderBar from "./header-component"
import { SessionProvider } from "./session-provider"

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await getSessionUser()

  return (
    <SessionProvider user={user}>
      <ALayout className="layout">
        <HeaderBar />
        <div className="content">{children}</div>
      </ALayout>
      <AppTour />
    </SessionProvider>
  )
}

export default Layout
