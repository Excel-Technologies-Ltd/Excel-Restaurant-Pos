import { useState } from "react";
import { useCartContext } from "../../../context/cartContext";
import { Food, items } from "../../../data/items";
import SingleItemModal from "../../../components/SingleItemModal/SingleItemModal";
import Carousel, { CarouselItem } from "./Carousel";
import Catering from "@/images/Catering.png";
import Catering1 from "@/images/Catering1.png";
import Catering2 from "@/images/Catering2.png";
import { useFrappeGetCall } from "frappe-react-sdk";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLMarqueeElement>,
        HTMLMarqueeElement
      >;
    }
  }
}

const Hero = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { cartItems } = useCartContext();

  const [selectedItem, setSelectedItem] = useState<Food | null>(null);
 const { data:items, mutate } = useFrappeGetCall(
  `excel_restaurant_pos.api.item.get_food_item_list`,
  { fields: ["*"] }
);
  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: Food) => {
    setSelectedItem(item);
    toggleDrawer();
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems?.find((cartItem:any) => cartItem?.item_code == itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="pt-12">
      <marquee className="text-primaryColor py-1.5 bg-lightPrimaryColor">
        Welcome to our Restaurant
      </marquee>

      {/* <img src="Catering.png" alt="Banner Image" /> */}
      <Carousel data={data} />

      <div className="px-4 mt-5">
        <h2 className="font-semibold text-base md:text-2xl pb-2">
          Most Popular Foods
        </h2>
        <div className="grid grid-cols-1 xsm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
          {items?.message?.slice(0, 10)?.map((item, index) => (
            <div
              key={index}
              onClick={() => handleItemClick(item?.item_code)}
              className="border border-gray-300 hover:border-primaryColor rounded-md relative cursor-pointer hover:shadow-lg"
            >
              <img
                src={
                  item?.image
                    ? item?.image
                    : "https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
                }
                alt="Food Banner"
                className="w-full max-h-[150px] object-cover h-auto rounded-t-md"
              />
              {getItemQuantity(item?.item_code) > 0 && (
                <div
                  title={`${getItemQuantity(item?.item_code)} items in cart`}
                  className="w-5 h-5 rounded-full bg-primaryColor shadow absolute top-2 left-2 flex justify-center items-center text-xs md:text-sm text-white"
                >
                  {getItemQuantity(item?.item_code)}
                </div>
              )}
              <div className="p-2.5">
                <h2 className="font-semibold">{item?.item_name}</h2>
                <h2>Price : ৳{item?.price}</h2>
                <h2 className="text-xs text-gray-500 mt-1">Time : 20-30 min</h2>
              </div>
              <div className="absolute top-0 right-0 bg-primaryColor px-2 py-1 rounded-bl-md rounded-tr-md text-xs md:text-base text-white">
                Popular
              </div>
            </div>
          ))}
          {isOpen && (
            <SingleItemModal
              selectedItem={selectedItem}
              toggleDrawer={toggleDrawer}
              isOpen={isOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;

// Example Data
const data: CarouselItem[] = [
  {
    id: "1",
    image: Catering,
    order: 1,
    heading: "",
    description: "",
    orderLink: "",
  },
  {
    id: "2",
    image: Catering1,
    order: 2,
    heading: "",
    description: "",
    orderLink: "",
  },
  {
    id: "3",
    image: Catering2,
    order: 3,
    heading: "",
    description: "",
    orderLink: "",
  },
];
