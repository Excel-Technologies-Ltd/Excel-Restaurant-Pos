import "@fontsource/ubuntu";
import "@fontsource/ubuntu/400-italic.css";
import "@fontsource/ubuntu/400.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.js";
import { FrappeProvider } from "frappe-react-sdk";
import React from "react";
export default function App() {
  return (
    <FrappeProvider>
      <RouterProvider router={router} />
    </FrappeProvider>

  );
}
