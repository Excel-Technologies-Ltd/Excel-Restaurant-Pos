import {
  useFrappeGetCall,
  useFrappePostCall
} from "frappe-react-sdk";
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
  isParcel: boolean;
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
  const [coupon, setCoupon] = useState("");

  const [discountError, setDiscountError] = useState<string>("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    "percentage"
  );
  const { updateCartCount, cartCount } = useCartContext();
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [tableId, setTableId] = useState<string>("");
  const [tableIdError, setTableIdError] = useState<string>("");
  const defaultTableId = localStorage.getItem("table_id");
  const { data: tax_rate } = useFrappeGetCall(
    "excel_restaurant_pos.api.item.get_tax_rate"
  );

  const taxRate = tax_rate?.message;
  const { call: checkCoupon } = useFrappePostCall(
    "excel_restaurant_pos.api.item.check_coupon_code"
  );

  const { data: running_items, mutate: mutateRunningItems } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_running_order_item_list?table_id=${tableId}`
  );
  const runningItems = running_items?.message;
  const {
    call: createOrder,
    loading,
    error,
    result,
  } = useFrappePostCall("excel_restaurant_pos.api.item.create_order");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");

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
      const updatedItems = prevItems?.map((item) =>
        item.item_code === item_code
          ? { ...item, quantity: (quantities[item_code] || 0) + 1 }
          : item
      );

      // Save updated cart items to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      updateCartCount();
      return updatedItems;
    });
  };

  // Decrement product quantity based on item_code
  const decrement = (item_code: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item_code]:
        (prevQuantities[item_code] || 1) > 1
          ? prevQuantities[item_code] - 1
          : 1,
    }));

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.item_code === item_code && item.quantity > 1
          ? { ...item, quantity: quantities[item_code] - 1 }
          : item
      );

      // Save updated cart items to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      updateCartCount();
      return updatedItems;
    });
  };

  // Remove item from cart
  const removeItem = (item_code: string) => {
    const updatedCartItems = cartItems.filter(
      (item) => item.item_code !== item_code
    );
    setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    updateCartCount();
  };

  const carts = JSON.parse(localStorage.getItem("cart") || "[]");

  // Calculate the subtotal price based on items and their quantities
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Calculate the tax based on the subtotal
  const tax = (subtotal - Number(discount)) * taxRate;

  // Calculate discount based on selected type

  const payableAmount = isNaN(subtotal - Number(discount) + tax)
    ? 0
    : subtotal - Number(discount) + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty! Please add items to checkout.");
      return;
    }

    // Open checkout confirmation modal
    setCheckoutModalOpen(true);
  };
  const handleParcelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    const isChecked = e.target.checked;
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.item_code == item
          ? { ...cartItem, isParcel: isChecked }
          : cartItem
      )
    );

    // Update localStorage with the new value of isParcel
    const updatedCart = cartItems.map((cartItem) =>
      cartItem.item_code == item
        ? { ...cartItem, isParcel: isChecked }
        : cartItem
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const confirmCheckout = async () => {
    const getCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const formatedCartItems = getCartItems?.map((item: any) => ({
      item: item?.item_code,
      qty: item?.quantity,
      rate: item?.price,
      amount: item?.price * item?.quantity,
      is_parcel: item?.isParcel ? 1 : 0,
    }));

    const payload = {
      customer: "Room One",
      item_list: formatedCartItems,
      table: tableId ? tableId : localStorage.getItem("table_id"),
      full_name: fullName ? fullName : "Test User",
      remarks: notes,
      discount_type: discountType,
      total_amount: Number(payableAmount),
      tax: Number(tax),
      discount: Number(discount),
      amount: Number(subtotal),
    };
    try {
      const result = await createOrder({ data: payload });
      if (result?.message?.status === "success") {
        // toast.success(result?.message?.message)

        setDiscount("");
        setDiscountType("percentage");
        setDiscountError("");
        setCartItems([]);
        setQuantities({});
        setNotes("");
        localStorage.removeItem("cart");
        localStorage.setItem("checkoutPrice", JSON.stringify(payableAmount));
        setShowPopup(true);
        toggleDrawer();
        updateCartCount();
        mutateRunningItems();

        // Close modal after checkout
        setCheckoutModalOpen(false);
      } else {
        toast.error(result?.message?.message);
      }
    } catch (error) {
      console.log("error", error);
    }

    // Proceed with checkout
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

    if (
      discountType === "percentage" &&
      (numericValue < 0 || numericValue > 100)
    ) {
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
  const verifyCoupon = () => {
    if (coupon) {
      checkCoupon({ data: { coupon_code: coupon } }).then((res) => {
        if (res?.message?.status === "success") {
          setDiscountError("");
          const discountAmount =
            res?.message?.discount_type === "percentage"
              ? (subtotal * Number(res?.message?.amount ?? 0)) / 100
              : Number(res?.message?.amount ?? 0);
          setDiscount(String(discountAmount));
          setCoupon("");
        } else {
          setDiscountError(res?.message?.message);
          setDiscount("");
        }
      });
    }
  };

  const [isLargeDevice, setIsLargeDevice] = useState(window.innerWidth > 768);

  useEffect(() => {
    mutateRunningItems();
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

  const getTableId = async () => {
    const table = await localStorage.getItem("table_id");
    setTableId(table || "");
  };

  useEffect(() => {
    getTableId();

    if (tableId) {
      mutateRunningItems();
    }
  }, [isCheckoutModalOpen]);

  return (
    <ItemsDrawer isOpen={isOpen} isLargeDevice={isLargeDevice}>
      <div
        className={`overflow-y-auto p-4 z-50 ${
          isLargeDevice
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
        <div className="mt-3">
          {runningItems?.length > 0 && (
            <h2 className="font-semibold mt-3 mb-1">Existing Order</h2>
          )}
          {runningItems?.length > 0 &&
            runningItems?.map((item: any) => (
              <div
                key={item?.item}
                className="border p-2 rounded-md mb-3 w-full"
              >
                <div className="flex justify-between items-center">
                  <div className="flex justify-between w-full">
                    <p className="text-xs lg:text-sm font-semibold text-gray-800 w-3/5">
                      {item?.item}
                    </p>
                    <p className="text-xs lg:text-sm font-medium text-primaryColor w-1/5">
                      {item?.qty}x{item?.rate}
                    </p>
                    <p className="text-xs lg:text-sm font-medium text-primaryColor w-1/5 text-right">
                      ৳{item?.qty * item?.rate}
                    </p>
                  </div>
                  {/* <div className="flex flex-col justify-center items-center gap-2">
                  <span className="text-xs">{item?.qty} pcs</span>
                </div> */}
                </div>
              </div>
            ))}
        </div>
        <h2 className="font-semibold mt-3">
          {runningItems?.length > 0 ? "Newly Added" : ""}
        </h2>
        {cartItems?.length === 0 && (
          <div className="flex items-center justify-center h-12 rounded-md border mt-3 text-sm">
            You haven't added anything to your cart!
          </div>
        )}
        <div className="mt-3">
          {cartItems?.map((item) => (
            <div
              key={item?.item_code}
              className="border p-2 rounded-md mb-3 w-full"
            >
              <div className="flex justify-between items-center">
                <div className="flex">
                  <img
                    src={item?.image ? item?.image : "https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"}
                    alt={item?.item_name}
                    className="h-14 w-14 lg:h-20 lg:w-20 object-cover rounded-lg"
                  />
                  <div className="flex flex-col items-start justify-center ps-2">
                    <p className="text-xs lg:text-sm font-semibold text-gray-800">
                      {item?.item_name}
                    </p>
                    <p className="text-xs lg:text-base font-medium text-primaryColor">
                      ৳{item?.price}
                    </p>
                    <div>
                      <div className="flex items-center ">
                        <label className="flex items-center mt-2 text-xs">
                          <input
                            type="checkbox"
                            checked={item?.isParcel}
                            onChange={(e) => handleParcelChange(e, item?.item_code)}
                            className="mr-2"
                          />
                          Takeaway
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 flex flex-col justify-center items-center gap-2">
                  <div className="flex">
                  <div className="flex items-center rounded-md border ms-1.5">
                    {quantities[item?.item_code] === 1 ? (
                      <button
                        onClick={() => decrement(item?.item_code)}
                        className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-2 border"
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
                    <span className="px-2 text-xs h-full flex items-center">
                      {item?.quantity}
                    </span>
                    {quantities[item?.item_code] > 0 && (
                      <button
                        onClick={() => increment(item?.item_code)}
                        className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-2 border"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    )}
                  </div>
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
        {cartItems?.length > 0 && (
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
        )}
        {cartItems?.length > 0 && runningItems?.length === 0 && (
          <>
            <div className="label">
              <h2 className="font-semibold text-xs">Coupon</h2>
            </div>
            <div className="flex gap-2 w-full text-sm relative">
              <input
                type={"text"}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className={`border rounded-md p-1 focus:outline-none px-3 w-full ${
                  discountError ? "border-red-500" : ""
                }`}
                placeholder={`Enter coupon code`}
              />
              {discountError && (
                <p className="text-red-500 text-xs right-0 -bottom-5 pt-2 absolute">
                  {discountError}
                </p>
              )}
              {coupon && (
                <button
                  onClick={verifyCoupon}
                  className="absolute right-3 top-1  px-2 py-1 bg-blue-500 text-xs text-white rounded-md hover:bg-blue-600"
                >
                  Verify
                </button>
              )}
            </div>
          </>
        )}

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
                className={`border rounded-md p-1 focus:outline-none px-3 w-full ${
                  discountError ? "border-red-500" : ""
                }`}
                placeholder={`Enter ${
                  discountType === "percentage" ? "percentage" : "flat amount"
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
        {cartItems?.length > 0 && (
          <div className="p-3 border rounded-md mt-5">
            <div className="flex justify-between text-xs md:text-sm">
              <h1>Subtotal</h1>
              <h1>৳{subtotal.toFixed(2)}</h1>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-xs md:text-sm mt-2">
                <h1>Discount (%)</h1>
                <h1>৳{discount}</h1>
              </div>
            )}
            <div className="flex justify-between text-xs md:text-sm mt-2">
              <h1>Tax ({taxRate * 100}%)</h1>
              <h1>৳{tax.toFixed(2)}</h1>
            </div>
            <div className="flex justify-between text-xs md:text-sm font-semibold mt-2">
              <h1>Payable Amount</h1>
              <h1>৳{payableAmount.toFixed(2)}</h1>
            </div>
          </div>
        )}
      </div>

      {carts.length !== 0 && (
        <div
          className={`p-4 py-2 border bottom-0 absolute w-full bg-white ${
            isLargeDevice ? "rounded-b-lg" : ""
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-3" style={{zIndex: 999}}>
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
        className={`fixed inset-0 z-50 flex items-center justify-center p-4  ${
          isOpen ? "bg-black bg-opacity-50" : "hidden"
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-lg transition-transform duration-500 ease-in-out ${
            isOpen ? "scale-100" : "scale-0"
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
          className={`drawer-bottom bg-white shadow-lg transition-transform duration-500 ease-in-out z-50 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          } fixed bottom-0 left-0 w-full min-h-full `} //min-h-[100%]
        >
          {children}
        </div>
      </div>
    );
  }
};
