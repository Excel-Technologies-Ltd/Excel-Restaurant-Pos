import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappePostCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

import { LuMinus } from "react-icons/lu";
import { AiTwotoneDelete } from "react-icons/ai";
import toast from "react-hot-toast";
interface OrderItem {
  name?: string;
  qty?: number;
  rate?: number;
  is_parcel?: boolean;
  item?: string;
  item_name?: string;
  // add other properties as needed
}

// Demo data
const demoCartItems = [
  {
    item_code: "item1",
    item_name: "Coffee Mug",
    price: 250,
    quantity: 1,
    isParcel: false,
  },
  {
    item_code: "item2",
    item_name: "Tea Pot",
    price: 500,
    quantity: 2,
    isParcel: true,
  },
];

const SingleOrderModal = ({
  orderId,
  closeModal,
}: {
  orderId: string;
  closeModal: () => void;
}) => {
  const [discountLimit, setDiscountLimit] = useState<number>(0);
  const [cartItems, setCartItems] = useState(demoCartItems);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantities, setQuantities] = useState({ item1: 1, item2: 2 });
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState("percentage");

  const [coupon, setCoupon] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discount, setDiscount] = useState<string>("");
  const { data: order } = useFrappeGetDoc("Table Order", orderId);
  console.log({ order });
  // 10% tax rate
  //   api calling
  const { updateDoc } = useFrappeUpdateDoc();
  const { currentUser } = useFrappeAuth();
  const { data: roles } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_roles?user=${currentUser}`
  );
  const userRoles = roles?.message?.map((role: any) => role?.Role);
  console.log("userRoles", userRoles);

  const { data: settings, error: settingsError } = useFrappeGetDoc(
    "Restaurant Settings",
    "Restaurant Settings",
    {
      fields: ["*"],
    }
  );
  const { call: checkCoupon } = useFrappePostCall(
    "excel_restaurant_pos.api.item.check_coupon_code"
  );
  const taxRate = parseInt(settings?.tax_rate || "0") / 100;

  const textDot = 20; // Set the max character limit before truncating the item name

  const subTotal = orderItems?.reduce(
    (acc: number, item: any) => acc + Number(item.rate) * item.qty,
    0
  );

  const handleIncrement = (name: string) => {
    // find this items index
    const index = orderItems.findIndex((item: any) => item.name === name);
    if (index !== -1) {
      const updatedItems = [...orderItems];
      updatedItems[index].qty
        ? (updatedItems[index].qty += 1)
        : (updatedItems[index].qty = 1);
      setOrderItems(updatedItems);
    }
  };
  const handleDecrement = (name: string) => {
    // find this items index
    const index = orderItems.findIndex((item: any) => item.name === name);
    if (index !== -1) {
      const updatedItems = [...orderItems];
      updatedItems[index].qty && updatedItems[index].qty > 1
        ? (updatedItems[index].qty -= 1)
        : (updatedItems[index].qty = 1);
      setOrderItems(updatedItems);
    }
  };
  const removeItem = (name: string) => {
    const updatedItems = orderItems.filter((item: any) => item.name !== name);
    setOrderItems(updatedItems);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate the discount value based on the type
    if (discountType === "percentage") {
      const numericValue = Number(value);
      const percentAmount = subTotal * (Number(value) / 100);
      if (value && (numericValue < 0 || numericValue > 100)) {
        setDiscountError("Discount must be between 0 and 100.");
        return;
      }

      if (percentAmount >= subTotal) {
        setDiscountError("Discount cannot be greater than the total amount.");
        return;
      } else {
        setDiscountError("");
        setDiscount(value);
        return;
      }
    }

    if (discountType === "flat") {
      // For flat amount, you can customize your validation logic as needed
      if (value && Number(value) < 0) {
        setDiscountError("Flat discount cannot be negative.");
      } else if (Number(value) > discountLimit) {
        setDiscountError(`Discount cannot be greater than ${discountLimit}.`);
        return;
      } else if (Number(value) >= subTotal) {
        setDiscountError("Discount cannot be greater than the total amount.");
        return;
      } else {
        setDiscountError("");
        setDiscount(value);
      }
    } else {
      setDiscountError("");
      setDiscount("");
    }
  };

  const handleCouponChange = (e) => {
    setCoupon(e.target.value);
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
  const handleDiscountTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountType(e.target.value as "flat" | "percentage" | "coupon");

    setDiscount("");
    setDiscountError("");
  };

  const handlePercelChange = (name: string) => {
    const index = orderItems.findIndex((item: any) => item.name === name);
    if (index !== -1) {
      const updatedItems = [...orderItems];
      updatedItems[index].is_parcel = !updatedItems[index].is_parcel;
      setOrderItems(updatedItems);
    }
  };
  const handleDirectCheckout = () => {
    const payload = {
      item_list: orderItems,
      discount: checkDiscount,
      discount_type: discountType,
      status: "Completed",
      is_paid: 1,
    };
    updateDoc("Table Order", orderId, payload)
      .then((res) => {
        if (res) {
          toast.success("success");
          closeModal();
        }
      })
      .catch((error) => {
        toast.error("Error updating order status.");
        console.log("Error updating order status:", error);
      });
    console.log({ payload });
  };
  const verifyCoupon = () => {
    if (coupon) {
      checkCoupon({ data: { coupon_code: coupon } }).then((res) => {
        if (res?.message?.status === "success") {
          console.log("res", res?.message);
          setDiscountError("");
          discountAmount =
            res?.message?.discount_type === "percentage"
              ? (subTotal * Number(res?.message?.amount ?? 0)) / 100
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
  let discountAmount =
    discountType === "percentage"
      ? (subTotal * Number(discount)) / 100 > discountLimit
        ? discountLimit
        : (subTotal * Number(discount)) / 100
      : Number(discount);
  const checkDiscount = discountAmount > 0 ? discountAmount : order?.discount;
  const tax = (subTotal - checkDiscount) * taxRate;
  const payableAmount = subTotal - checkDiscount + tax;
  // Functions to calculate totals
  console.log({ orderItems });
  useEffect(() => {
    if (order) {
      setOrderItems(order?.item_list);
    }
  }, [order]);

  useEffect(() => {
    const setRoleDiscount = (role: string) => {
      if (settings?.discount_allocation) {
        // Find the discount allocation for the specific role
        const discount = settings?.discount_allocation?.find(
          (allocation: any) => allocation?.role === role
        );

        // If a discount exists and has a non-zero amount, set the discount limit
        if (discount && discount?.amount > 0) {
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

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white md:p-2 pb-3 rounded-md shadow-lg w-96">
        <h1 className="text-sm font-semibold mb-2">Cart Summary</h1>
        {orderItems?.length > 0 ? (
          <div className="text-xs">
            {orderItems?.map((item: any) => (
              <div className="accordion mb-1" key={item?.name}>
                <div className="border rounded-md p-2">
                  <div className="flex justify-between items-center transition font-medium">
                    <div className="block w-1/3">
                      <p title={item?.item} className="font-semibold truncate">
                        {(item?.item ?? "").substring(0, textDot)}
                        {item?.item_name?.length > textDot ? "..." : ""}
                      </p>
                      <p className="font-semibold mt-1">৳{item?.rate}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={item?.is_parcel}
                          className="mr-2"
                          onChange={() => handlePercelChange(item?.name)}
                        />
                        Parcel
                      </label>
                    </div>

                    <div className="flex items-center gap-2 w-1/3">
                      <div className="flex items-center rounded-md h-fit border w-full">
                        <button
                          onClick={() => handleDecrement(item?.name)}
                          className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 h-fit py-1.5"
                        >
                          <LuMinus className="text-xs" />
                        </button>
                        <span className="px-2 text-xs h-full flex items-center">
                          {item?.qty}
                        </span>
                        <button
                          onClick={() => handleIncrement(item?.name)}
                          className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-1.5"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item?.name)}
                        className="text-red-500 px-2 rounded-md text-xs bg-gray-200 h-fit py-1.5 border"
                      >
                        <AiTwotoneDelete />
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

        <div className="py-4 flex flex-col items-start">
          <h3 className="font-semibold text-sm mb-1">Discount</h3>
          {order?.discount > 0 && (
            <p className="text-xs text-green-500">
              Applied: ৳{order?.discount}
            </p>
          )}
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
                  ? handleCouponChange
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
            <h1>৳{subTotal.toFixed(2)}</h1>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <h1>Discount</h1>
            <h1>
              ৳
              {discountAmount > 0
                ? discountAmount?.toFixed(2)
                : order?.discount}
            </h1>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <h1>Tax ({taxRate * 100}%)</h1>
            <h1>৳{tax.toFixed(2)}</h1>
          </div>
          <div className="flex justify-between text-xs font-semibold mt-2">
            <h1>Payable Amount</h1>
            <h1>৳{payableAmount ? payableAmount : order?.total_amount}</h1>
          </div>
        </div>

        <div className="flex justify-between gap-3 ">
          <button
            onClick={closeModal}
            className="bg-primaryColor text-white w-full p-2 rounded-md mt-3 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDirectCheckout}
            className="bg-primaryColor text-white w-full p-2 rounded-md mt-3 text-sm"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderModal;
