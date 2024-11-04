import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { PiSpinnerThin } from "react-icons/pi";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { CartProvider } from "./context/cartContext.tsx";
import "./index.css";
import { store } from "./redux/store/Store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <PiSpinnerThin className=" animate-spin text-4xl" />
        </div>
      }
    >
      <Toaster />
      <CartProvider>
        <Provider store={store}>
          <App />
          {/* <RightClickImageAndSound /> */}
        </Provider>
      </CartProvider>
    </Suspense>
  </StrictMode>
);
