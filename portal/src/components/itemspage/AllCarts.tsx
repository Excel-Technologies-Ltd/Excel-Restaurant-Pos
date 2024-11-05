import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { LuMinus } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { useCartContext } from "../../context/cartContext";

type Props = {
  isOpen: boolean;
  toggleDrawer: () => void;
  setShowPopup: (showPopup: boolean) => void;
  isAdmin?: boolean;
};

type DrawerProps = {
  isOpen: boolean;
  isLargeDevice: boolean;
  children: React.ReactNode;
  isAdmin?: boolean;
};

type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  totalPrice: number;
};

const AllCarts = ({
  isOpen,
  toggleDrawer,
  setShowPopup,
  isAdmin = false,
}: Props) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [discount, setDiscount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    "percentage"
  );
  const { updateCartCount, cartCount } = useCartContext();

  console.log({ cartCount });
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (storedCart.length > 0) {
      setCartItems(storedCart);

      // Set the initial quantities based on the items in the cart
      const initialQuantities = storedCart.reduce(
        (acc: any, item: CartItem) => {
          acc[item.id] = item.quantity;
          return acc;
        },
        {}
      );
      setQuantities(initialQuantities);
    }
  }, [cartCount]);

  // Increment product quantity based on item ID
  const increment = (id: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1,
    }));
  };

  // Decrement product quantity based on item ID
  const decrement = (id: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 1) > 1 ? prevQuantities[id] - 1 : 1,
    }));
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));

    updateCartCount();
  };

  const carts = JSON.parse(localStorage.getItem("cart") || "[]");

  const taxRate = 0.1; // 10% tax rate

  // Calculate the subtotal price based on items and their quantities
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (quantities[item.id] || item.quantity),
    0
  );

  // Calculate the tax based on the subtotal
  const tax = subtotal * taxRate;

  // Calculate discount based on selected type
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * Number(discount)) / 100
      : Number(discount);

  const payableAmount = subtotal - discountAmount + tax;

  // Handle checkout
  const handleCheckout = () => {
    // Check if the cart is empty
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (cart.length === 0) {
      // If the cart is empty, show a toast message
      toast.error("Your cart is empty! Please add items to checkout.");
      return;
    }

    // Proceed with checkout if cart is not empty
    setDiscount("");
    setDiscountType("percentage");
    setDiscountError("");
    setCartItems([]);
    setQuantities({});
    setNotes("");
    localStorage.removeItem("cart");

    // Store total price in localStorage
    localStorage.setItem("checkoutPrice", JSON.stringify(payableAmount));

    // if (isAdmin) {
    //   // Show success toast
    //   toast.success("Checkout successful!");
    // }

    setShowPopup(true);
    toggleDrawer();
    updateCartCount();
  };

  const closeModal = () => {
    setDiscount("");
    setDiscountType("percentage");
    setDiscountError("");
    setQuantities({});
    toggleDrawer();
    setNotes("");
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate the discount value based on the type
    if (discountType === "percentage") {
      const numericValue = Number(value);
      if (value && (numericValue < 0 || numericValue > 100)) {
        setDiscountError("Discount must be between 0 and 100.");
        return;
      } else {
        setDiscountError("");
      }
    } else {
      // For flat amount, you can customize your validation logic as needed
      if (value && Number(value) < 0) {
        setDiscountError("Flat discount cannot be negative.");
      } else {
        setDiscountError("");
      }
    }

    setDiscount(value);
  };
  // main : 379 , add : 29 , another : 199
  const handleDiscountTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountType(e.target.value as "flat" | "percentage");
    setDiscount(""); // Reset discount when type changes
    setDiscountError(""); // Reset discount error when type changes
  };

  const [isLargeDevice, setIsLargeDevice] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeDevice(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const foodsBody = document.querySelector(".modal-scrollable");

    console.log(foodsBody);

    if (isOpen) {
      document.body.classList.add("modal-open");

      foodsBody?.classList.remove("modal-scrollable");
      foodsBody?.classList.add("foodsBody");
    } else {
      document.body.classList.remove("modal-open");

      foodsBody?.classList.remove("foodsBody");
      foodsBody?.classList.add("modal-scrollable");
    }

    return () => {
      // Clean up classes when component unmounts
      document.body.classList.remove("modal-open");
      foodsBody?.classList.remove("foodsBody");
      foodsBody?.classList.add("modal-scrollable");
    };
  }, [isOpen]);

  return (
    <ItemsDrawer isOpen={isOpen} isLargeDevice={isLargeDevice}>
      <div
        className={`overflow-y-auto p-4 z-50 ${isLargeDevice
          ? " max-h-[calc(100vh-100px)] pb-24"
          : "max-h-[100vh] pb-20"
          }`} //max-h-[calc(100vh-100px)]r
      >
        <div className="flex justify-between border-b">
          <h2 className="font-semibold">
            {cartItems?.length > 1 ? "Carts" : "Cart"}
          </h2>
          <button
            className="bg-gray-50 h-8 w-8 border rounded-full mb-3 flex items-center justify-center"
            onClick={closeModal}
          >
            <RxCross2 />
          </button>
        </div>
        <h2 className="font-semibold mt-3">Your Foods</h2>
        {cartItems?.length === 0 && (
          <div className="flex items-center justify-center h-12 rounded-md border mt-3 text-sm">
            No data found
          </div>
        )}
        <div className="mt-3">
          {cartItems?.map((item) => (
            <div key={item.id} className="border p-2 rounded-md mb-3 w-full">
              <div className="flex justify-between">
                <div className="flex">
                  <img
                    src="https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
                    alt={item.name}
                    className="h-10 w-10 lg:h-20 lg:w-20 object-cover rounded-lg"
                  />
                  <div className="flex flex-col items-start justify-center ps-2">
                    <p className="text-xs lg:text-sm font-semibold text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs lg:text-base font-medium text-primaryColor">
                      ৳{item.price}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 flex flex-col justify-center items-center gap-2">
                  <div className="flex items-center rounded-md h-fit">
                    {quantities[item.id] === 1 ? (
                      <button
                        onClick={() => decrement(item.id)}
                        className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-2 border ms-1.5"
                      >
                        <LuMinus className="text-xs" />
                      </button>
                    ) : (
                      <button
                        onClick={() => decrement(item.id)}
                        className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 h-fit py-2 border"
                      >
                        <LuMinus className="text-xs" />
                      </button>
                    )}
                    <span className="px-2 text-xs h-full flex items-center border">
                      {quantities[item.id] || item.quantity}
                    </span>
                    {quantities[item.id] > 0 && (
                      <button
                        onClick={() => increment(item.id)}
                        className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-2 border"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.id)} // Call removeItem function on click
                      className="text-redColor px-2 rounded-md text-xs bg-gray-200 h-fit py-2 ms-1.5 border"
                    >
                      <FaRegTrashCan />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <label className="form-control w-full mt-2">
          <div className="label">
            <h2 className="font-semibold text-xs">Note</h2>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)} // Update state on change
            className="focus:outline-none border rounded-md p-2 text-xs md:text-sm"
            placeholder="Special instructions"
          ></textarea>
        </label>

        {/* Display discount input */}
        {isAdmin && (
          <div className="py-4 flex flex-col items-start">
            <h3 className="font-semibold text-sm mb-1">Discount</h3>
            <div className="flex gap-2 w-full text-sm relative">
              <select
                value={discountType}
                onChange={handleDiscountTypeChange}
                className="border rounded-md p-1 focus:outline-none px-2"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
              <input
                type="number"
                value={discount}
                onChange={handleDiscountChange}
                className={`border rounded-md p-1 focus:outline-none px-3 w-full ${discountError ? "border-red-500" : ""
                  }`}
                placeholder={`Enter ${discountType === "percentage" ? "percentage" : "flat amount"
                  }`}
              />
              {discountError && (
                <p className="text-red-500 text-xs right-0 -bottom-5 pt-2 absolute">
                  {discountError}
                </p>
              )}
            </div>
          </div>
        )}
        {/* Display cart summary */}
        <div className="p-3 border rounded-md mt-5">
          <div className="flex justify-between text-xs">
            <h1>Subtotal</h1>
            <h1>৳{subtotal.toFixed(2)}</h1>
          </div>
          {isAdmin && (
            <div className="flex justify-between text-xs mt-2">
              <h1>Discount (%)</h1>
              <h1>৳{discountAmount.toFixed(2)}</h1>
            </div>
          )}
          <div className="flex justify-between text-xs mt-2">
            <h1>Tax (10%)</h1>
            <h1>৳{tax.toFixed(2)}</h1>
          </div>
          <div className="flex justify-between text-xs font-semibold mt-2">
            <h1>Payable Amount</h1>
            <h1>৳{payableAmount.toFixed(2)}</h1>
          </div>
        </div>
      </div>

      {carts.length !== 0 && (
        <div
          className={`p-4 py-2 border bottom-0 absolute w-full bg-white ${isLargeDevice ? "rounded-b-lg" : ""
            }`}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">
              Total Payable Amount : ৳{payableAmount.toFixed(2)}
            </p>
            <button
              onClick={handleCheckout}
              className="bg-primaryColor p-2 px-4 rounded-md text-white h-fit text-sm"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </ItemsDrawer>
  );
};

export default AllCarts;

const ItemsDrawer = ({ children, isOpen, isLargeDevice }: DrawerProps) => {
  if (isLargeDevice) {
    return (
      <div
        style={{ zIndex: 999 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4  ${isOpen ? "bg-black bg-opacity-50" : "hidden"
          }`}
      >
        <div
          className={`bg-white rounded-lg shadow-lg transition-transform duration-500 ease-in-out ${isOpen ? "scale-100" : "scale-0"
            } md:max-w-lg w-full h-auto`}
        >
          {children}
        </div>
      </div>
    );
  } else {
    return (
      <div className="h-[100vh] w-full" style={{ zIndex: 999 }}>
        <div
          style={{ zIndex: 999 }}
          className={`drawer-bottom bg-white shadow-lg transition-transform duration-500 ease-in-out z-50 ${isOpen ? "translate-y-0" : "translate-y-full"
            } fixed bottom-0 left-0 w-full min-h-full `} //min-h-[100%]
        >
          {children}
        </div>
      </div>
    );
  }
};
