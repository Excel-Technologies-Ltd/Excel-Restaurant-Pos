import { useState } from "react";
import { useCartContext } from "../../context/cartContext";
import { Food, items } from "../../data/items";
import { SelectCartProps } from "../itemspage/ItemList";
import ItemsCart from "../itemspage/ItemsCart";
import Carousel, { CarouselItem } from "./Carousel";
import Catering from "@/images/Catering.png";
import Catering1 from "@/images/Catering1.png";
import Catering2 from "@/images/Catering2.png";

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

  const [selectedItem, setSelectedItem] = useState<SelectCartProps | null>(
    null
  );

  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: Food) => {
    const cartItem: SelectCartProps = {
      id: item.id,
      name: item.name,
      sellPrice: item.sellPrice,
      image: item.image,
      description: item.description,
      regularPrice: item.regularPrice,
      Variation: item.Variation,
      addOns: item.addOns,
      relatedItems: item.relatedItems,
      categoryId: item.categoryId,
    };
    setSelectedItem(cartItem);
    toggleDrawer();
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems?.find((cartItem) => cartItem.id === itemId);
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
          {items?.slice(0, 10)?.map((item, index) => (
            <div
              key={index}
              onClick={() => handleItemClick(item)}
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
              {getItemQuantity(item?.id) > 0 && (
                <div
                  title={`${getItemQuantity(item?.id)} items in cart`}
                  className="w-5 h-5 rounded-full bg-primaryColor shadow absolute top-2 left-2 flex justify-center items-center text-xs md:text-sm text-white"
                >
                  {getItemQuantity(item?.id)}
                </div>
              )}
              <div className="p-2.5">
                <h2 className="font-semibold">{item?.name}</h2>
                <h2>Price : ৳{item?.sellPrice}</h2>
                <h2 className="text-xs text-gray-500 mt-1">Time : 20-30 min</h2>
              </div>
              <div className="absolute top-0 right-0 bg-primaryColor px-2 py-1 rounded-bl-md rounded-tr-md text-xs md:text-base text-white">
                Popular
              </div>
            </div>
          ))}
          {isOpen && (
            <ItemsCart
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
