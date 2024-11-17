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
import { useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk";
import { useSearchParams } from "react-router-dom";


const Pos = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [discount, setDiscount] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");
  const [discountType, setDiscountType] = useState<"flat" | "percentage">(
    "percentage"
  );
  const [foodCategories, setFoodCategories] = useState<any[]>([])
  const [notes, setNotes] = useState<string>("");

  // useFrappeGetCall
  const { data: categories, isLoading: isLoadingCategories } = useFrappeGetCall('excel_restaurant_pos.api.item.get_category_list', {
    fields: ["*"]
  })

  const {call:createOrder,loading,error,result}=useFrappePostCall("excel_restaurant_pos.api.item.create_order")
  const { data:foods, mutate } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_food_item_list?category=${selectedCategory}`,
    { fields: ["*"] }
  );
  const { data: tableIds } = useFrappeGetDocList('Restaurant Table', {
    fields: ["name"]
  })
  const selectedTableId = tableIds?.map((item: any) => item?.name)


  useEffect(() => {
    if (categories) {
      setFoodCategories(categories.message)
    }
  }, [categories])

  const handleCategoryClick = (category: string) => {
    console.log("category", category);
    setSelectedCategory(category);
  };

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [tableId, setTableId] = useState<string>("");
  const [tableIdError, setTableIdError] = useState<string>("");

 // Table IDs

  

  console.log("categories", foodCategories);


  // Toggle drawer visibility
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Food | null>(
    null
  );

  const { cartCount } = useCartContext();

  const w1280 = useWindowWidth(1280);
  const w1600 = useWindowWidth(1600);

  const textDot = w1600 ? 18 : 25;

  // const { cartItems } = useCartContext();

  const { updateCartCount, cartItems } = useCartContext();

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
  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems?.find((cartItem) => cartItem?.item_code === itemId);
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
        acc[item?.id] = item?.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, []);

  // Checkout

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
    const updatedCartItems = cartItems.filter((item) => item?.id !== id);
    // setCartItems(updatedCartItems);
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));

    updateCartCount();
  };

  const taxRate = 0.1; // 10% tax rate

  // Calculate the subtotal price based on items and their quantities
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item?.price * (quantities[item?.item_code] || item?.quantity),
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

  const handleDiscountTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountType(e.target.value as "flat" | "percentage");
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

  const confirmCheckout = async () => {
    if (!tableId.trim()) {
      setTableIdError("Table ID is required.");
      return;
    }
    
    
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
      table: tableId,
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
      console.log("result", result);
    } catch (error) {
      console.log("error", error);
    }
    console.log("payload", payload);
    setQuantities({});
    localStorage.removeItem("cart");
    localStorage.setItem("checkoutPrice", JSON.stringify(payableAmount));

    setShowPopup(true);
    setDiscountType("percentage");
    setDiscount("");
    setNotes("");
    updateCartCount();

    setCheckoutModalOpen(false); // Close modal after checkout
  };
useEffect(() => {
  mutate()
}, [selectedCategory])


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
            {foods?.message?.map((item, index) => {
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
                      <TruncateText content={item?.description || ""} length={100} />
                    </div>
                  </div>
                  {getItemQuantity(item?.id) > 0 && (
                    <div
                      title={`${getItemQuantity(item?.id)} items in cart`}
                      className="w-5 h-5 rounded-full bg-primaryColor absolute top-2 right-2 flex justify-center items-center text-xs md:text-sm text-white border shadow-md"
                    >
                      {getItemQuantity(item?.id)}
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
                        <div className="flex justify-between transition font-medium">
                          <div className="block">
                            <p title={item?.name} className="font-semibold">
                              {item?.name?.substring(0, textDot)}
                              {item?.name?.length > textDot ? "..." : ""}
                            </p>
                            <p className="font-semibold mt-1">৳{item?.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex items-center rounded-md h-fit border w-fit">
                              {quantities[item?.item_code] === 1 ? (
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
                                {quantities[item?.item_code] || item?.quantity}
                              </span>
                              <button
                                onClick={() => increment(item?.item_code)}
                                className="px-1 rounded-md rounded-s-none bg-gray-200 h-fit py-1.5 "
                              >
                                <FiPlus className="text-xs" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item?.item_code)}
                              className="text-redColor px-1.5 rounded-md text-xs bg-gray-200 h-fit py-1.5 border"
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
                  </select>
                  <input
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    className={`border rounded-md p-1 focus:outline-none px-3 w-full ${discountError ? "border-red-500" : ""
                      }`}
                    placeholder={`Enter ${discountType === "percentage"
                      ? "percentage"
                      : "flat amount"
                      }`}
                  />
                  {discountError && (
                    <p className="text-red-500 text-xs right-0 -bottom-5 pt-2 absolute">
                      {discountError}
                    </p>
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
                  <h1>Discount (%)</h1>
                  <h1>৳{discountAmount.toFixed(2)}</h1>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <h1>Tax (10%)</h1>
                  <h1>৳{tax.toFixed(2)}</h1>
                </div>
                <div className="flex justify-between text-xs font-semibold mt-2">
                  <h1>Payable Amount</h1>
                  <h1>৳{payableAmount.toFixed(2)}</h1>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="bg-primaryColor text-white w-full p-2 rounded-md mt-3 text-sm"
              >
                Proceed
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
            <label className="block mb-2">
              Table ID <span className="text-red-500">*</span>
              <select
                value={tableId}
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
            </label>
            <div className="flex justify-end mt-4">
              <button onClick={() => setCheckoutModalOpen(false)} className="mr-2 bg-gray-200 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmCheckout} className="bg-primaryColor px-4 py-2 rounded text-white">
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
          selectedItem={selectedItem}
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
