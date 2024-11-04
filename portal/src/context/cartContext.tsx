import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[]; // Cart items array
  cartCount: number; // Number of unique items in the cart
  updateCartCount: () => void;
  updateCartItems: () => void; // Function to update cart items
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);

  // Function to update the cart items from localStorage and also update the cart count
  const updateCartItems = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart); // Update cart items state
    setCartCount(cart.length); // Update cart count based on updated cart items
  };

  useEffect(() => {
    updateCartItems(); // Initialize cart items and count on mount

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart") {
        updateCartItems(); // Update cart when localStorage changes
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        updateCartCount: updateCartItems,
        updateCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// import React, { createContext, useContext, useEffect, useState } from "react";

// interface CartItem {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface CartContextType {
//   cartItems: CartItem[]; // Cart items array
//   cartCount: number; // Number of unique items in the cart
//   updateCartCount: () => void;
//   updateCartItems: () => void; // Function to update cart items
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCartContext = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCartContext must be used within a CartProvider");
//   }
//   return context;
// };

// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [cartCount, setCartCount] = useState<number>(0);

//   // Function to update the cart items from localStorage
//   const updateCartItems = () => {
//     const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//     setCartItems(cart); // Update cart items state
//   };

//   // Function to update the unique item count
//   const updateCartCount = () => {
//     setCartCount(cartItems.length);
//   };

//   useEffect(() => {
//     updateCartItems();
//     updateCartCount();

//     const handleStorageChange = (event: StorageEvent) => {
//       if (event.key === "cart") {
//         updateCartItems();
//         updateCartCount();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, [cartItems]); // Effect depends on cartItems state

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         cartCount,
//         updateCartCount,
//         updateCartItems,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
