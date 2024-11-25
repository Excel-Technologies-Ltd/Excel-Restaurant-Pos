import "@fontsource/ubuntu";
import "@fontsource/ubuntu/400-italic.css";
import "@fontsource/ubuntu/400.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.js";
import { FrappeProvider } from "frappe-react-sdk";

export default function App() {
  const getSiteName = () => {
		// @ts-ignore
		if (window.frappe?.boot?.versions?.frappe && (window.frappe.boot.versions.frappe.startsWith('15') || window.frappe.boot.versions.frappe.startsWith('16'))) {
			// @ts-ignore
			return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
		}
		return import.meta.env.VITE_SITE_NAME

	}

  return (
    <FrappeProvider siteName={getSiteName()} socketPort="9000">
      <RouterProvider router={router} />
    </FrappeProvider>

  );
}
