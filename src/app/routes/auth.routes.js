import LoginPage from "@/features/Auth/LoginPage/LoginPage";
import RegisterPage from "@/features/Auth/registerPage/RegisterPage";
import SetNewPassword from "@/features/Auth/setNewPassword/pages/SetNewPassword";

export const auth = [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "set-new-password", element: <SetNewPassword /> },
           {path:"forgot-password" , element:<ForgetPage/>},
        ]