import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { LuMinus } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { useCartContext } from "../../context/cartContext";
import { useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk";

type Props = {
  isOpen: boolean;
  toggleDrawer: () => void;
  setShowPopup: (showPopup: boolean) => void;
  isAdmin?: boolean;
};

export type DrawerProps = {
  isOpen: boolean;
  isLargeDevice: boolean;
  children: React.ReactNode;
  isAdmin?: boolean;
};

type CartItem = {
  item_code: string;
  item_name: string;
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
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [discount, setDiscount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    "percentage"
  );
  const { updateCartCount, cartCount } = useCartContext();
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [tableId, setTableId] = useState<string>("");
  const [tableIdError, setTableIdError] = useState<string>("");
  const defaultTableId = localStorage.getItem("table_id") 
  const { data: tableIds } = useFrappeGetDocList('Restaurant Table', {
    fields: ["name"]
  })
  const selectedTableId =  defaultTableId ? [defaultTableId] : tableIds?.map((item: any) => item?.name)

  const {call:createOrder,loading,error,result}=useFrappePostCall("excel_restaurant_pos.api.item.create_order")
 



  console.log({ cartCount });
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    console.log({ storedCart });

    if (storedCart.length > 0) {
      setCartItems(storedCart);

      // Set the initial quantities based on the items in the cart
      const initialQuantities = storedCart.reduce(
        (acc: { [key: string]: number }, item: CartItem) => {
          acc[item?.item_code] = item.quantity;
          return acc;
        },
        {}
      );
      setQuantities(initialQuantities);
    }
  }, [cartCount]);

  // Increment product quantity based on item ID
const increment = (item_code: string) => {
  setQuantities((prevQuantities) => ({
    ...prevQuantities,
    [item_code]: (prevQuantities[item_code] || 0) + 1,
  }));
  
  setCartItems((prevItems) => {
    const updatedItems = prevItems.map((item) =>
      item.item_code === item_code
        ? { ...item, quantity: (quantities[item_code] || 0) + 1 }
        : item
    );

    // Save updated cart items to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    updateCartCount()
    return updatedItems;
  });
};

// Decrement product quantity based on item_code
const decrement = (item_code: string) => {
  setQuantities((prevQuantities) => ({
    ...prevQuantities,
    [item_code]: (prevQuantities[item_code] || 1) > 1 ? prevQuantities[item_code] - 1 : 1,
  }));

  setCartItems((prevItems) => {
    const updatedItems = prevItems.map((item) =>
      item.item_code === item_code && item.quantity > 1
        ? { ...item, quantity: quantities[item_code] - 1 }
        : item
    );

    // Save updated cart items to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    updateCartCount()
    return updatedItems;
  });
};


  // Remove item from cart
  const removeItem = (item_code: string) => {
    const updatedCartItems = cartItems.filter((item) => item.item_code !== item_code);
    setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    updateCartCount();
  };

  const carts = JSON.parse(localStorage.getItem("cart") || "[]");

  const taxRate = 0.1; // 10% tax rate
  console.log({cartItems})
  // Calculate the subtotal price based on items and their quantities
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  console.log({subtotal})

  // Calculate the tax based on the subtotal
  const tax = subtotal * taxRate;

  // Calculate discount based on selected type
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * Number(discount || 0)) / 100
      : Number(discount || 0);
 const payableAmount = isNaN(subtotal - discountAmount + tax) ? 0 : subtotal - discountAmount + tax;


 const handleCheckout = () => {
  if (cartItems.length === 0) {
    toast.error("Your cart is empty! Please add items to checkout.");
    return;
  }

  // Open checkout confirmation modal
  setCheckoutModalOpen(true);
};
const confirmCheckout = async () => {
  const getCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  const formatedCartItems = getCartItems?.map((item: any) => ({
    item: item?.item_code,
    qty: item?.quantity,
    rate: item?.price,
    amount: item?.price * item?.quantity
  }))


  const payload={
    customer:"Room One",
    item_list: formatedCartItems,
    table: tableId ? tableId : localStorage.getItem("table_id"),
    full_name: fullName ? fullName : "Test User",
    remarks: notes,
    discount_type: discountType,
    total_amount: payableAmount,
    tax: tax,
    discount: discountAmount,
    amount: subtotal
  }
  try {
    const result = await createOrder({data:payload})
    if(result?.message?.status==="success"){
      // toast.success(result?.message?.message)
      setDiscount("");
      setDiscountType("percentage");
      setDiscountError("");
      setCartItems([]);
      setQuantities({});
      setNotes("");
      localStorage.removeItem("cart");
      localStorage.setItem("checkoutPrice", JSON.stringify(payableAmount));
      localStorage.removeItem("table_id")
      setShowPopup(true);
      toggleDrawer();
      updateCartCount();
    
      // Close modal after checkout
      setCheckoutModalOpen(false)
    }else{
      toast.error(result?.message?.message)
    }
  } catch (error) {
    console.log("error", error);
  }

  // Proceed with checkout
;
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

    const numericValue = Number(value);



    if (discountType === "percentage" && (numericValue < 0 || numericValue > 100)) {

      setDiscountError("Discount must be between 0 and 100.");

      return;

    } else if (discountType === "flat" && numericValue < 0) {

      setDiscountError("Flat discount cannot be negative.");

      return;

    }

    setDiscountError("");

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
  useEffect(()=>{
    setTableId(defaultTableId || "")
  },[defaultTableId])

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
            <div key={item?.item_code} className="border p-2 rounded-md mb-3 w-full">
              <div className="flex justify-between">
                <div className="flex">
                  <img
                    src="https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
                    alt={item?.item_name}
                    className="h-10 w-10 lg:h-20 lg:w-20 object-cover rounded-lg"
                  />
                  <div className="flex flex-col items-start justify-center ps-2">
                    <p className="text-xs lg:text-sm font-semibold text-gray-800">
                      {item?.item_name}
                    </p>
                    <p className="text-xs lg:text-base font-medium text-primaryColor">
                      ৳{item?.price}
                    </p>
                  </div>
                </div>
                <div className="col-span-1 flex flex-col justify-center items-center gap-2">
                  <div className="flex items-center rounded-md h-fit">
                    {quantities[item?.item_code] === 1 ? (
                      <button
                        onClick={() => decrement(item?.item_code)}
                        className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-2 border ms-1.5"
                      >
                        <LuMinus className="text-xs" />
                      </button>
                    ) : (
                      <button
                        onClick={() => decrement(item?.item_code)}
                        className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 h-fit py-2 border"
                      >
                        <LuMinus className="text-xs" />
                      </button>
                    )}
                    <span className="px-2 text-xs h-full flex items-center border">
                      { item?.quantity}
                    </span>
                    {quantities[item?.item_code] > 0 && (
                      <button
                        onClick={() => increment(item?.item_code)}
                        className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-2 border"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item?.item_code)} // Call removeItem function on click
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
        {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Checkout</h2>
            <label className="block mb-2">
              Full Name (optional)
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded p-2 mt-1"
              />
            </label>
            {/* <label className="block mb-2">
              Table ID <span className="text-red-500">*</span>
              <select
                value={defaultTableId || tableId}
               
                onChange={(e) => {
                  setTableId(e.target.value);
                  setTableIdError("");
                }}
                className={`w-full border rounded p-2 mt-1 ${tableIdError ? "border-red-500" : ""}`}
              >
                <option value="">Select Table ID</option>
                {selectedTableId?.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              {tableIdError && <p className="text-red-500 text-xs mt-1">{tableIdError}</p>}
            </label> */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="mr-2 bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="bg-primaryColor px-4 py-2 rounded text-white"
              >
                Confirm
              </button>
            </div>
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
