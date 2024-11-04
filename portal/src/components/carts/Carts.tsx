// import { useState } from "react";
// import { FaMinus } from "react-icons/fa";
// import { FiPlus } from "react-icons/fi";
// import { RxCross2 } from "react-icons/rx";

// type Props = {
//   isOpen: boolean;
//   toggleDrawer: () => void;
// };

// const AllCarts = ({ isOpen, toggleDrawer }: Props) => {
//   const [selectedVariation, setSelectedVariation] = useState("Half");

//   const item = {
//     id: 1,
//     name: "Rice with Chicken Curry Wrapped in Banana Leaf",
//     description: "Rice with Chicken Curry Wrapped in Banana Leaf",
//     price: 120, // This can be used as a fallback or default price if needed
//   };

//   // Increment product quantity
//   const [quantity, setQuantity] = useState(1);

//   const increment = () => {
//     setQuantity((prevQuantity) => prevQuantity + 1);
//   };

//   const decrement = () => {
//     if (quantity > 1) {
//       setQuantity((prevQuantity) => prevQuantity - 1);
//     }
//   };

//   const variations = [
//     { name: "Half", price: 120 },
//     { name: "Half Quarter", price: 200 },
//     { name: "Full", price: 280 },
//   ];

//   // Get the price of the selected variation
//   const selectedVariationPrice =
//     variations.find((variation) => variation.name === selectedVariation)
//       ?.price || item.price;

//   // Calculate total price based on selected variation and quantity
//   const totalPrice = selectedVariationPrice * quantity;

//   return (
//     <div className="h-[100vh] w-full">
//       <div
//         className={`drawer-bottom bg-white shadow-lg transition-transform duration-500 ease-in-out z-50 ${
//           isOpen ? "translate-y-0" : "translate-y-full"
//         } fixed bottom-0 left-0 w-full min-h-[100%]`}
//       >
//         <div className="overflow-y-auto max-h-[calc(100vh-100px)] p-4">
//           {" "}
//           {/* Adjust max height */}
//           <div className="flex justify-end pt-12">
//             <button
//               className="bg-gray-50 h-8 w-8 border rounded-full mb-3 flex items-center justify-center"
//               onClick={toggleDrawer}
//             >
//               <RxCross2 />
//             </button>
//           </div>
//           <div>
//             <h2 className="font-semibold">{item?.name}</h2>
//             <h2 className="text-xs font-semibold pt-1">Price ৳{item?.price}</h2>
//             <h2 className="text-xs text-gray-500 pt-2">{item?.description}</h2>
//           </div>
//           <div className="border shadow p-2 rounded-md mt-4">
//             <h2 className="mb-3 text-xs font-semibold">Variation</h2>
//             {variations.map((variation) => (
//               <div
//                 key={variation.name}
//                 className="flex justify-between mb-3 text-xs xl:text-base"
//               >
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     value={variation.name}
//                     checked={selectedVariation === variation.name}
//                     onChange={() => setSelectedVariation(variation.name)}
//                     className="mr-2"
//                   />
//                   {variation.name}
//                 </label>
//                 <h2>{variation.price}</h2>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className=" p-4 pt-2 border bottom-0 absolute w-full">
//           <p className="text-base font-semibold pb-2">
//             Total Price: ৳{totalPrice}
//           </p>
//           <div className="flex justify-between">
//             <div className="flex items-center border rounded-md">
//               <button
//                 onClick={decrement}
//                 className="px-4 rounded-md rounded-e-none h-full text-xs bg-gray-200 "
//               >
//                 <FaMinus />
//               </button>
//               <span className="px-4">{quantity}</span>
//               <button
//                 onClick={increment}
//                 className="px-4 rounded-md rounded-s-none h-full bg-gray-200"
//               >
//                 <FiPlus />
//               </button>
//             </div>
//             <button
//               onClick={toggleDrawer}
//               className="bg-primaryColor p-2 rounded-md text-white h-fit"
//             >
//               Add to cart
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllCarts;
