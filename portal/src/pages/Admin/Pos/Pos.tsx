import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsFillCartCheckFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";
import { LuMinus } from "react-icons/lu";
import AllCarts from "../../../components/CartModal/AllCarts";
import SingleItemModal from "../../../components/SingleItemModal/SingleItemModal";
import CheckoutPopup from "../../../components/alert/CheckoutPopup";
import { styles } from "../../../utilities/cn";
import Textarea from "../../../components/form-elements/Textarea";
import TruncateText from "../../../components/common/TruncateText";
// import { foodCategories } from "../../Items/Items";
// import { Food, items } from "../../../data/items";
import { useCartContext } from "../../../context/cartContext";
import useWindowWidth from "../../../hook/useWindowWidth";
import { Food } from "../../../data/items";
import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappePostCall,
} from "frappe-react-sdk";
import { useLoading } from "../../../context/loadingContext";

// Add this interface near the top of your file
interface CartItem {
  item_code?: string;
  item_name?: string;
  price?: number;
  quantity?: number;
  isParcel?: boolean;
  // Add other properties your cart items have
}

const Pos = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [discount, setDiscount] = useState<string>("");
  const [coupon, setCoupon] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");
  const [discountType, setDiscountType] = useState<
    "flat" | "percentage" | "coupon"
  >("percentage");
  const [foodCategories, setFoodCategories] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isParcel, setIsParcel] = useState<boolean>(false);
  const [directCheckout, setDirectCheckout] = useState<boolean>(false);
  const [discountLimit, setDiscountLimit] = useState<number>(0);
  const [disabledCheckout, setDisabledCheckout] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoading();

  const { data: settings, error: settingsError } = useFrappeGetDoc(
    "Restaurant Settings",
    "Restaurant Settings",
    {
      fields: ["*"],
    }
  );
  console.log("settings", settings?.discount_allocation);
  const taxRate = parseInt(settings?.tax_rate || "0") / 100;
  const { currentUser } = useFrappeAuth();
  const { data: roles } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_roles?user=${currentUser}`
  );
  const userRoles = roles?.message?.map((role: any) => role?.Role);
  console.log("userRoles", userRoles);

  const { data: categories, isLoading: isLoadingCategories } = useFrappeGetCall(
    "excel_restaurant_pos.api.item.get_category_list",
    {
      fields: ["*"],
    }
  );

  const { call: checkCoupon } = useFrappePostCall(
    "excel_restaurant_pos.api.item.check_coupon_code"
  );

  const {
    call: createOrder,
    loading,
    error,
    result,
  } = useFrappePostCall("excel_restaurant_pos.api.item.create_order");
  const { data: foods, mutate } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_food_item_list?category=${selectedCategory}`,
    { fields: ["*"] }
  );
  const { data: tableIds } = useFrappeGetDocList("Restaurant Table", {
    fields: ["name"],
  });
  const selectedTableId = tableIds?.map((item: any) => item?.name);

  useEffect(() => {
    if (categories) {
      setFoodCategories(categories.message);
    }
  }, [categories]);

  const handleCategoryClick = (category: string) => {
    console.log("category", category);
    setSelectedCategory(category);
  };

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [tableId, setTableId] = useState<string>("");
  const [tableIdError, setTableIdError] = useState<string>("");

  // Toggle drawer visibility
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Food | null>(null);

  const { cartCount } = useCartContext();

  const w1280 = useWindowWidth(1280);
  const w1600 = useWindowWidth(1600);

  const textDot = w1600 ? 18 : 25;

  // const { cartItems } = useCartContext();

  const {
    updateCartCount,
    cartItems,
  }: { updateCartCount: () => void; cartItems: CartItem[] } = useCartContext();

  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Handle item click and set the selected item
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    toggleDrawer();
  };

  // Get the quantity of an item in the cart
  const getItemQuantity = (itemId: string | undefined) => {
    if (!itemId) return 0;
    const cartItem = cartItems?.find(
      (cartItem) => cartItem?.item_code === itemId
    );
    return cartItem ? cartItem?.quantity : 0;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (cartItems?.length > 0) {
      const initialQuantities = cartItems?.reduce((acc: any, item: any) => {
        acc[item?.item_code] = item?.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, []);

  // Checkout

  // Increment product quantity based on item ID
  const increment = (id: string | undefined) => {
    if (!id) return;
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 1) + 1,
    }));
    // update with new quantity
    const updatedCartItems = cartItems?.map((item) =>
      item?.item_code === id
        ? { ...item, quantity: (quantities[id] || 1) + 1 }
        : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
    updateCartCount();
  };

  // Decrement product quantity based on item ID
  const decrement = (id: string | undefined) => {
    if (!id) return;
    // first find the item in the cart
    const item = cartItems?.find((item) => item?.item_code === id);
    console.log("item", item);
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]:
        (prevQuantities[id] ?? item?.quantity) > 1
          ? (prevQuantities[id] ?? item?.quantity) - 1
          : 1,
    }));
    // update with new quantity
    const updatedCartItems = cartItems?.map((item) =>
      item?.item_code === id
        ? {
            ...item,
            quantity: (quantities[id] || 1) > 1 ? quantities[id] - 1 : 1,
          }
        : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    const updatedCartItems = cartItems.filter((item) => item?.item_code !== id);
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      delete newQuantities[id];
      return newQuantities;
    });
    console.log({ quantities });
    // setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));

    updateCartCount();
  };
  // 10% tax rate

  // Calculate the subtotal price based on items and their quantities
  const subtotal = cartItems.reduce((acc, item) => {
    const itemCode = item?.item_code;
    const quantity = itemCode ? quantities[itemCode] || item?.quantity || 0 : 0;
    return acc + (item?.price ?? 0) * quantity;
  }, 0);
  console.log("subtotal", typeof subtotal);
  // Calculate the tax based on the subtotal

  // Calculate discount based on selected type
  let discountAmount =
    discountType === "percentage"
      ? (subtotal * Number(discount)) / 100 > discountLimit
        ? discountLimit
        : (subtotal * Number(discount)) / 100
      : Number(discount);
  const tax = (subtotal - discountAmount) * taxRate;
  const payableAmount = subtotal - discountAmount + tax;

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate the discount value based on the type
    if (discountType === "percentage") {
      const numericValue = Number(value);
      const percentAmount = subtotal * (Number(value) / 100);
      if (value && (numericValue < 0 || numericValue > 100)) {
        setDiscountError("Discount must be between 0 and 100.");
        return;
      }
      if (percentAmount >= subtotal) {
        setDiscountError("Discount cannot be greater than the total amount.");
        return;
      } else {
        setDiscountError("");
        setDiscount(value);
      }
    }

    if (discountType === "flat") {
      // For flat amount, you can customize your validation logic as needed
      if (value && Number(value) < 0) {
        setDiscountError("Flat discount cannot be negative.");
      } else if (Number(value) > discountLimit) {
        setDiscountError(`Discount cannot be greater than ${discountLimit}.`);
        return;
      } else if (Number(value) >= subtotal) {
        setDiscountError("Discount cannot be greater than the total amount.");
        return;
      } else {
        setDiscountError("");
        setDiscount(value);
      }
    } else {
      setDiscountError("");
    }
  };
  const getDiscountPlaceholder = () => {
    switch (discountType) {
      case "percentage":
        return "percentage";
      case "flat":
        return "flat amount";
      case "coupon":
        return "coupon code";
      default:
        return "";
    }
  };
  const verifyCoupon = () => {
    if (coupon) {
      checkCoupon({ data: { coupon_code: coupon } }).then((res) => {
        if (res?.message?.status === "success") {
          console.log("res", res?.message);
          setDiscountError("");
          discountAmount =
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

  const handleParcelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    const isChecked = e.target.checked;

    // Update localStorage with the new value of isParcel
    const updatedCart = cartItems?.map((cartItem) =>
      cartItem.item_code == item
        ? { ...cartItem, isParcel: isChecked }
        : cartItem
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const handleDiscountTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountType(e.target.value as "flat" | "percentage" | "coupon");
    setDiscount("");
    setDiscountError("");
  };

  // Handle checkout
  const handleCheckout = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      toast.error("Your cart is empty! Please add items to checkout.");
      return;
    }
    setCheckoutModalOpen(true); // Open confirmation modal
  };
  const handleDirectCheckout = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      toast.error("Your cart is empty! Please add items to checkout.");
      return;
    }
    console.log(notes ? notes : "not found");
    setDirectCheckout(true);
    setIsParcel(true);
    setCheckoutModalOpen(true); // Open confirmation modal
  };

  const confirmCheckout = async () => {
    if (!isParcel && !tableId) {
      toast.error("Please select a table ID.");
      return;
    }

    const getCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const formatedCartItems = getCartItems?.map((item: any) => ({
      item: item?.item_code,
      qty: item?.quantity,
      rate: item?.price,
      amount: item?.price * item?.quantity,
      is_parcel: tableId ? (item?.isParcel ? 1 : 0) : 1,
    }));

    const payload = {
      item_list: formatedCartItems,
      table: tableId ? tableId : "",
      full_name: fullName ? fullName : "Customer",
      remarks: notes ? notes : "",
      discount_type: discountType ? discountType : "",
      total_amount: payableAmount,
      tax: tax,
      discount: discountAmount,
      amount: subtotal,
      status: "Work in progress",
      is_paid: directCheckout ? 1 : 0,
    };
    try {
      startLoading();
      const result = await createOrder({ data: payload });
      console.log("result", result?.message?.status);
      if (result?.message?.status === "success") {
        // toast.success(result?.message?.message)
        setQuantities({});
        localStorage.removeItem("cart");
        localStorage.setItem("checkoutPrice", JSON.stringify(payableAmount));

        setShowPopup(true);
        setDiscountType("percentage");
        setDiscount("");
        setNotes("");
        updateCartCount();
        setIsParcel(false);
        setTableId("");
        setDirectCheckout(false);

        setCheckoutModalOpen(false);
      } else {
        toast.error(result?.message?.message);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to create order");
    } finally {
      stopLoading();
    }
    // Close modal after checkout
  };
  useEffect(() => {
    //
    // check manager  or cashier
    const isManagerOrCashier =
      userRoles?.includes("Restaurant Manager") ||
      userRoles?.includes("Restaurant Cashier");
    if (isManagerOrCashier) setDisabledCheckout(false);
    else setDisabledCheckout(true);
    console.log("isManagerOrCashier", isManagerOrCashier);
  }, [userRoles]);
  useFrappeDocTypeEventListener("Item", () => {
    mutate();
  }),
    useEffect(() => {
      mutate();
    }, [selectedCategory]);
  // get discount limit
  useEffect(() => {
    const setRoleDiscount = (role: string) => {
      if (settings?.discount_allocation) {
        // Find the discount allocation for the specific role
        const discount = settings.discount_allocation.find(
          (allocation: any) => allocation?.role === role
        );

        // If a discount exists and has a non-zero amount, set the discount limit
        if (discount && discount.amount > 0) {
          setDiscountLimit(discount?.amount);
          return true; // Indicate that a discount has been set
        }
      }
      return false; // No discount set for this role
    };

    if (
      userRoles?.includes("Restaurant Manager") &&
      setRoleDiscount("Restaurant Manager")
    ) {
      return; // Exit early if the discount for Restaurant Manager is set
    }

    if (
      userRoles?.includes("Restaurant Cashier") &&
      setRoleDiscount("Restaurant Cashier")
    ) {
      return; // Exit early if the discount for Restaurant Cashier is set
    }

    if (
      userRoles?.includes("Restaurant Waiter") &&
      setRoleDiscount("Restaurant Waiter")
    ) {
      return; // Exit early if the discount for Restaurant Waiter is set
    }
  }, [userRoles, settings?.discount_allocation]);
  console.log("discountLimit", discountLimit);

  return (
    <div className="p-2 foodsBody" id="foodsBody">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-9 category order-2 md:order-1">
          {/* Category cards */}
          <div
            ref={scrollRef}
            className="bg-white p-2 rounded-md shadow overflow-x-auto scrollbar-hide cursor-grab "
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
          >
            <div className="flex gap-2 w-max justify-center items-center">
              <CategoryCard
                onClick={() => handleCategoryClick("")}
                title="All"
                isActive={String("") === selectedCategory}
              />
              {foodCategories?.map((item, index) => (
                <CategoryCard
                  onClick={() => handleCategoryClick(item.name)}
                  key={index}
                  title={item?.name}
                  isActive={String(item?.name) === selectedCategory}
                />
              ))}
            </div>
          </div>

          {/* Foods Cards */}
          <div className="grid grid-cols-1 xsm:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-4 mt-5">
            {foods?.message?.map((item: any, index: any) => {
              return (
                <div
                  key={index}
                  onClick={() => handleItemClick(item.item_code)}
                  className="border border-borderColor rounded-lg shadowe hover:shadow-lg hover:border-primaryColor group relative cursor-pointer"
                >
                  <img
                    src={
                      item?.image
                        ? item?.image
                        : "https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
                    }
                    alt=""
                    className="h-[150px] w-full object-cover rounded-t-lg"
                  />
                  <div className="p-2">
                    <p className="text-xs lg:text-sm font-semibold text-gray-800">
                      {item?.item_name}
                    </p>
                    <p className="text-xs lg:text-sm font-medium text-primaryColor">
                      ৳{item?.price}
                    </p>
                    <div className="text-xs lg:text-sm text-gray-500">
                      <TruncateText
                        content={item?.description || ""}
                        length={100}
                      />
                    </div>
                  </div>
                  {item?.item_code && getItemQuantity(item?.item_code) > 0 && (
                    <div
                      title={`${getItemQuantity(
                        item?.item_code
                      )} items in cart`}
                      className="w-5 h-5 rounded-full bg-primaryColor absolute top-2 right-2 flex justify-center items-center text-xs md:text-sm text-white border shadow-md"
                    >
                      {getItemQuantity(item?.item_code)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Carts Foods */}
        {!w1280 && (
          <div className="col-span-12 xl:col-span-3 pb-3 order-1 md:order-2 h-fit">
            <input
              value={""}
              placeholder="Search..."
              type="text"
              className="mb-2 w-full border rounded-md text-xs px-4 py-2 focus:outline-none hidden"
            />
            <div className="bg-white md:p-2 pb-3 rounded-md shadow ">
              <h1 className="text-sm font-semibold mb-2"> Cart Summary </h1>
              {cartItems?.length > 0 ? (
                <div className="text-xs">
                  {cartItems?.map((item) => (
                    <div className="accordion mb-1">
                      <div className="border rounded-md p-2">
                        {/* <div className="flex justify-between items-center transition font-medium">
                          <div className="block">
                            <p
                              title={item?.item_name}
                              className="font-semibold"
                            >
                              {(item?.item_name ?? "").substring(0, textDot)}
                              {(item?.item_name ?? "").length > textDot
                                ? "..."
                                : ""}
                            </p>
                            <p className="font-semibold mt-1">৳{item?.price}</p>
                          </div>
                          <div className="flex items-center w-25">
                            <label className="flex items-center mt-2 text-xs">
                              <input
                                type="checkbox"
                                checked={item?.isParcel}
                                onChange={(e) =>
                                  handleParcelChange(e, item?.item_code || "")
                                }
                                className="mr-2"
                              />
                              Parcel
                            </label>
                          </div>
                          <div className="flex gap-2 w-25">
                            <div className="flex items-center rounded-md h-fit border w-fit">
                              {quantities[item?.item_code ?? ""] === 1 ? (
                                <button
                                  onClick={() => decrement(item?.item_code)}
                                  className="px-1 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-1.5 "
                                >
                                  <LuMinus className="text-xs" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => decrement(item?.item_code)}
                                  className="px-1 rounded-md rounded-e-none text-xs bg-gray-200 h-fit py-1.5 "
                                >
                                  <LuMinus className="text-xs" />
                                </button>
                              )}
                              <span className="px-2 text-xs h-full flex items-center">
                                {quantities[item?.item_code ?? ""] ||
                                  item?.quantity}
                              </span>
                              <button
                                onClick={() => increment(item?.item_code)}
                                className="px-1 rounded-md rounded-s-none bg-gray-200 h-fit py-1.5 "
                              >
                                <FiPlus className="text-xs" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item?.item_code || "")}
                              className="text-redColor px-1.5 rounded-md text-xs bg-gray-200 h-fit py-1.5 border"
                            >
                              <FaRegTrashCan />
                            </button>
                          </div>
                        </div> */}
                        <div className="flex justify-between items-center transition font-medium">
                          <div className="block w-1/3">
                            <p
                              title={item?.item_name}
                              className="font-semibold truncate"
                            >
                              {(item?.item_name ?? "").substring(0, textDot)}
                              {(item?.item_name ?? "").length > textDot
                                ? "..."
                                : ""}
                            </p>
                            <p className="font-semibold mt-1">৳{item?.price}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={item?.isParcel}
                                onChange={(e) =>
                                  handleParcelChange(e, item?.item_code || "")
                                }
                                className="mr-2"
                              />
                              Parcel
                            </label>
                          </div>

                          <div className="flex items-center gap-2 w-1/3">
                            <div className="flex items-center rounded-md h-fit border w-full">
                              {quantities[item?.item_code ?? ""] === 1 ? (
                                <button
                                  onClick={() => decrement(item?.item_code)}
                                  className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-1.5"
                                >
                                  <LuMinus className="text-xs" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => decrement(item?.item_code)}
                                  className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 h-fit py-1.5"
                                >
                                  <LuMinus className="text-xs" />
                                </button>
                              )}
                              <span className="px-2 text-xs h-full flex items-center">
                                {quantities[item?.item_code ?? ""] ||
                                  item?.quantity}
                              </span>
                              <button
                                onClick={() => increment(item?.item_code)}
                                className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-1.5"
                              >
                                <FiPlus className="text-xs" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item?.item_code || "")}
                              className="text-red-500 px-2 rounded-md text-xs bg-gray-200 h-fit py-1.5 border"
                            >
                              <FaRegTrashCan />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-28 border border-borderColor rounded-md text-xs">
                  No item in cart
                </div>
              )}

              <Textarea
                label="Note"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

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
                    <option value="coupon">Coupon</option>
                  </select>
                  <input
                    type={discountType === "coupon" ? "text" : "number"}
                    value={discountType === "coupon" ? coupon : discount}
                    onChange={
                      discountType === "coupon"
                        ? (e) => setCoupon(e.target.value)
                        : handleDiscountChange
                    }
                    className={`border rounded-md p-1 focus:outline-none px-3 w-full ${
                      discountError ? "border-red-500" : ""
                    }`}
                    placeholder={`Enter ${getDiscountPlaceholder()}`}
                  />
                  {discountError && (
                    <p className="text-red-500 text-xs right-0 -bottom-5 pt-2 absolute">
                      {discountError}
                    </p>
                  )}
                  {discountType === "coupon" && (
                    <button
                      onClick={verifyCoupon}
                      className="absolute right-3 top-1  px-2 py-1 bg-blue-500 text-xs text-white rounded-md hover:bg-blue-600"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* Checkout details */}
              <div className="p-3 border rounded-md mt-5">
                <div className="flex justify-between text-xs">
                  <h1>Subtotal</h1>
                  <h1>৳{subtotal.toFixed(2)}</h1>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <h1>Discount ({<span className="font-bold">৳</span>})</h1>
                  <h1>৳{discountAmount.toFixed(2)}</h1>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <h1>Tax ({taxRate * 100}%)</h1>
                  <h1>৳{tax.toFixed(2)}</h1>
                </div>
                <div className="flex justify-between text-xs font-semibold mt-2">
                  <h1>Payable Amount</h1>
                  <h1>৳{payableAmount.toFixed(2)}</h1>
                </div>
              </div>
              <div className="flex  justify-between gap-3 ">
                <button
                  onClick={handleCheckout}
                  className="bg-primaryColor text-white w-full p-2 rounded-md mt-3 text-sm"
                >
                  Create Order
                </button>
                <button
                  disabled={disabledCheckout}
                  onClick={handleDirectCheckout}
                  className={`bg-primaryColor text-white w-full p-2 rounded-md mt-3 text-sm ${
                    disabledCheckout ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">
                Confirm {directCheckout ? "Checkout" : "Order"}
              </h2>
              <label className="block mb-2">
                Full Name (optional)
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded p-2 mt-1"
                />
              </label>
              <div>
                {directCheckout || (
                  <label className="block my-3">
                    <input
                      type="checkbox"
                      checked={isParcel}
                      onChange={(e) => {
                        if (directCheckout) {
                          setIsParcel(true);
                        } else {
                          setIsParcel(e.target.checked);
                        }
                      }}
                    />{" "}
                    Is Parcel?
                  </label>
                )}
              </div>
              {!isParcel && (
                <label className="block mb-2">
                  Table ID <span className="text-red-500">*</span>
                  <select
                    value={tableId}
                    onChange={(e) => {
                      setTableId(e.target.value);
                      setTableIdError("");
                    }}
                    className={`w-full border rounded p-2 mt-1 ${
                      tableIdError ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Table ID</option>
                    {selectedTableId?.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                  {tableIdError && (
                    <p className="text-red-500 text-xs mt-1">{tableIdError}</p>
                  )}
                </label>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setDirectCheckout(false);
                    setIsParcel(false);
                  }}
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
      </div>
      {w1280 && (
        <button
          onClick={() => {
            setShowCart(true);
          }}
          className="sticky bottom-4 right-4 w-12 h-12 bg-primaryColor flex items-center justify-center rounded-full text-white "
        >
          <BsFillCartCheckFill className="text-xl" />
          <div className="absolute top-[-3px] right-[-3px] w-5 h-5 bg-primaryColor border border-white text-white rounded-full text-xs flex items-center justify-center ">
            {cartCount}
          </div>
        </button>
      )}
      {isOpen && (
        <SingleItemModal
          selectedItem={selectedItem ?? ""}
          toggleDrawer={toggleDrawer}
          isOpen={isOpen}
        />
      )}
      {showCart && (
        <AllCarts
          isOpen={showCart}
          toggleDrawer={() => setShowCart(false)}
          isAdmin
          setShowPopup={setShowPopup}
        />
      )}
      {showPopup && (
        <CheckoutPopup handleClosePopup={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default Pos;

type TypeCategoryCard = {
  title: string;
  isActive: boolean;
  onClick: () => void;
};

const CategoryCard = ({
  title = "",
  isActive = false,
  onClick,
}: TypeCategoryCard) => {
  return (
    <div
      onClick={onClick}
      className={styles(
        "p-1.5 rounded-md cursor-pointer hover:text-primaryColor font-medium flex items-center gap-2 border hover:border-primaryColor transition select-none min-w-28",
        {
          "border border-primaryColor bg-lightPrimaryColor font-semibold text-primaryColor ":
            isActive,
        }
      )}
    >
      <IoFastFoodOutline className="bg-primaryColor text-white p-1.5 rounded-md text-3xl" />
      <h2 className="text-xs">{title}</h2>
    </div>
  );
};
