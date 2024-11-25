import { useEffect, useState } from "react";

const useCartCount = () => {
  console.log("useCartCount");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      // Count the number of unique items in the cart
      const totalCount = cart.length; // This counts unique items in the cart
      setCartCount(totalCount);
    };

    updateCartCount(); // Initial count update

    // Listen for storage changes
    const handleStorageChange = (event: any) => {
      if (event.key === "cart") {
        updateCartCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return cartCount;
};

export default useCartCount;
