import "@fontsource/ubuntu";
import "@fontsource/ubuntu/400-italic.css";
import "@fontsource/ubuntu/400.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.js";
import { FrappeProvider } from "frappe-react-sdk";

export default function App() {
  return (
    <FrappeProvider siteName="localhost:8000" enableSocket={true}>
      <RouterProvider router={router} />
    </FrappeProvider>

  );
}
