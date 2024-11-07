import { useState } from "react";
import { useCartContext } from "../../context/cartContext";
import { Food, items } from "../../data/items";
import TruncateText from "../common/TruncateText";
import SingleItemModal from "../SingleItemModal/SingleItemModal";
import { useFrappeGetDocList } from "frappe-react-sdk";


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
  selectedCategory = "0",
}: {
  className?: string;
  selectedCategory?: string;
}) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Food | null>(null);

  // const { data, isLoading, error } = useFrappeGetDocList("Item", {
  //   fields: ["item_code", 'item_name', 'item_group', 'allow_alternative_item', 'has_variants', 'image', 'description', 'variant_of', 'customer', 'sales_uom', 'is_sales_item', 'standard_rate'],
  //   filters: [
  //     ['variant_of', '=', '']
  //   ],
  //   limit: 30,
  // });



  const { cartItems } = useCartContext();

  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  // Handle item click and set the selected item
  const handleItemClick = (item: Food) => {
    setSelectedItem(item);
    toggleDrawer();
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems?.find((cartItem) => cartItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // const filteredItems = items?.filter((item) => {
  //   if (selectedCategory == "0") {
  //     return true;
  //   } else {
  //     return item.categoryId == Number(selectedCategory);
  //   }
  // });

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:xl:grid-cols-4 gap-3 py-4 px-2">
        {" "}
        {items?.map((item, idx) => (
          <div
            onClick={() => handleItemClick(item)}
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
            />{" "}
            {getItemQuantity(item?.id) > 0 && (
              <div
                title={`${getItemQuantity(item?.id)} items in cart`}
                className="w-5 h-5 rounded-full bg-primaryColor shadow absolute top-[-6px] right-[-6px] flex justify-center items-center text-xs md:text-sm text-white border"
              >
                {getItemQuantity(item?.id)}
              </div>
            )}
            <div className="flex flex-col items-start justify-start ps-2">
              <p className="text-xs lg:text-base font-semibold text-gray-800">
                {item?.name}
              </p>
              <p className="text-xs lg:text-base font-medium text-primaryColor">
                ৳{item?.sell_price || 0}
              </p>
              <div className="text-xs lg:text-base text-gray-500">
                <TruncateText content={item?.description} length={25} />{" "}
              </div>
            </div>
          </div>
        ))}
        <SingleItemModal
          selectedItem={selectedItem}
          toggleDrawer={toggleDrawer}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default ItemList;
