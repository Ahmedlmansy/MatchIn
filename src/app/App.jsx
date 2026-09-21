import { RouterProvider } from "react-router-dom"
import { AppProviders } from "@/app/providers/providers"
import { router } from "@/app/router"

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
