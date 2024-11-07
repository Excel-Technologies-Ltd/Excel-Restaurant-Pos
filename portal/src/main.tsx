import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { CartProvider } from "./context/cartContext.tsx";
import "./index.css";
import { store } from "./redux/store/Store.ts";
import Loading from "./components/common/Loading.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense
      fallback={
        <Loading />
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
