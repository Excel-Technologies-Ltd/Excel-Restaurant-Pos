import { useEffect, useState, useMemo, useCallback } from "react";
import { useCartContext } from "../../context/cartContext";
import TruncateText from "../common/TruncateText";
import SingleItemModal from "../SingleItemModal/SingleItemModal";
import { useFrappeGetCall } from "frappe-react-sdk";

export type SelectCartProps = {
  id: number;
  name: string;
  description?: string;
  regularPrice?: number;
  sellPrice: number;
  image?: string;
  quantity?: number;
  variation?: Variation;
  addOns?: Food[];
  relatedItems?: Food[];
  categoryId?: number;
  specialInstructions?: string;
  totalPrice?: number;
};

export interface Variation {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
}

const ItemList = ({
  className,
  selectedCategory = "",
  table_id,
}: {
  className?: string;
  selectedCategory?: string;
  table_id?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const { data, mutate } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_food_item_list?category=${selectedCategory}`,
    { fields: ["*"] }
  );

  const { cartItems } = useCartContext();


  useEffect(() => {
    mutate();
  }, [selectedCategory, mutate]);

  // Memoize the filtered data to avoid recalculating on every render
  const filteredData = useMemo(() => data?.message || [], [data]);

  // Use callback to memoize the function and prevent unnecessary re-renders
  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(
    (itemCode) => {
      setSelectedItemName(itemCode);
      toggleDrawer();
    },
    [toggleDrawer]
  );

  const getItemQuantity = useCallback(
    (itemId: number) => {
      const cartItem = cartItems?.find((cartItem) => cartItem.item_code === itemId);
      return cartItem ? cartItem.quantity : 0;
    },
    [cartItems]
  );

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:xl:grid-cols-4 gap-3 py-4 px-2">
        {filteredData.map((item, idx) => (
          <div
            onClick={() => handleItemClick(item?.item_code)}
            key={idx}
            className="p-2 lg:p-4 cursor-pointer flex flex-row justify-start items-center border rounded-xl hover:shadow-lg transition-shadow relative"
          >
            <img
              src={
                item?.image
                  ? item?.image
                  : "https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
              }
              alt=""
              className="h-20 w-20 lg:h-32 lg:w-32 object-cover rounded-lg"
            />
            {getItemQuantity(item?.item_code) > 0 && (
              <div
                className="w-5 h-5 rounded-full bg-primaryColor shadow absolute top-[-6px] right-[-6px] flex justify-center items-center text-xs md:text-sm text-white border"
              >
                {getItemQuantity(item?.item_code)}
              </div>
            )}
            <div className="flex flex-col items-start justify-start ps-2">
              <p className="text-xs lg:text-base font-semibold text-gray-800">
                {item?.item_name}
              </p>
              <p className="text-xs lg:text-base font-medium text-primaryColor">
                ৳{item?.price || 0}
              </p>
              <div className="text-xs lg:text-base text-gray-500">
                <TruncateText content={item?.description} length={25} />
              </div>
            </div>
          </div>
        ))}
        {isOpen && (
          <SingleItemModal
            selectedItem={selectedItemName}
            toggleDrawer={toggleDrawer}
            isOpen={isOpen}
          />
        )}
      </div>
    </div>
  );
};

export default ItemList;
