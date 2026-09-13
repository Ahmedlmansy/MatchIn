import { createBrowserRouter } from "react-router-dom"
import { HomePage } from "@/features/auth/components/HomePage"
import { Navbar } from "@/components/shared/Navbar"

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
])
