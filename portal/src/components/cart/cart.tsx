// import { useState } from "react";

// // Sample initial cart data (this would normally come from user selections)
// const initialCartItems = [
//   {
//     id: 1,
//     name: "6 PCS Hokkaido Oyster",
//     variant: "Standard",
//     amount: 1,
//     price: 30.0,
//     image: "/path/to/oyster-image.jpg", // Path to the image
//   },
//   {
//     id: 2,
//     name: "Guinness Draught",
//     variant: "Standard",
//     amount: 1,
//     price: 15.0,
//     image: "/path/to/guinness-image.jpg", // Path to the image
//   },
// ];

// const Cart = () => {
//   const [cartItems, setCartItems] = useState(initialCartItems);

//   // Calculate the total price of all items in the cart
//   const totalPrice = cartItems.reduce(
//     (total, item) => total + item.price * item.amount,
//     0
//   );

//   // Handle removing items from the cart
//   const removeItem = (id: number) => {
//     setCartItems(cartItems.filter((item) => item.id !== id));
//   };

//   // Handle increasing the amount of an item
//   const increaseAmount = (id: number) => {
//     setCartItems(
//       cartItems.map((item) =>
//         item.id === id ? { ...item, amount: item.amount + 1 } : item
//       )
//     );
//   };

//   // Handle decreasing the amount of an item
//   const decreaseAmount = (id: number) => {
//     setCartItems(
//       cartItems.map((item) =>
//         item.id === id && item.amount > 1
//           ? { ...item, amount: item.amount - 1 }
//           : item
//       )
//     );
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Shopping List</h1>
//       <div className="space-y-4">
//         {cartItems.length > 0 ? (
//           cartItems.map((item) => (
//             <div
//               key={item.id}
//               className="flex justify-between items-center p-4 border rounded shadow"
//             >
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-16 h-16 object-cover mr-4"
//               />
//               <div className="flex-1">
//                 <h2 className="text-lg font-semibold">{item.name}</h2>
//                 <p className="text-sm text-gray-600">Variant: {item.variant}</p>
//                 <p className="text-sm text-gray-600">
//                   Price: ${item.price.toFixed(2)}
//                 </p>
//               </div>
//               <div className="flex items-center">
//                 <button
//                   onClick={() => decreaseAmount(item.id)}
//                   className="px-2 py-1 bg-gray-200 rounded"
//                 >
//                   −
//                 </button>
//                 <span className="mx-2">{item.amount}</span>
//                 <button
//                   onClick={() => increaseAmount(item.id)}
//                   className="px-2 py-1 bg-gray-200 rounded"
//                 >
//                   +
//                 </button>
//                 <button
//                   onClick={() => removeItem(item.id)}
//                   className="text-red-500 font-semibold ml-4"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>Your cart is empty.</p>
//         )}
//       </div>

//       {/* Display total price */}
//       {cartItems.length > 0 && (
//         <div className="mt-6">
//           <h2 className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</h2>
//           <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
//             Check Out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Cart;
