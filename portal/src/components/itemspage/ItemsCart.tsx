import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMinus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useCartContext } from "../../context/cartContext";
import { SelectCartProps, Variation } from "./ItemList";
import { Food } from "../../data/items";

type Props = {
  isOpen: boolean;
  toggleDrawer: () => void;
  selectedItem: SelectCartProps | null;
};

type DrawerProps = {
  isOpen: boolean;
  isLargeDevice: boolean;
  children: React.ReactNode;
};

const ItemsCart = ({ isOpen, toggleDrawer, selectedItem }: Props) => {
  const [selectedVariation, setSelectedVariation] = useState(
    selectedItem?.Variation?.[0]?.name
  );
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedItems, setSelectedItems] = useState<Partial<Food>[]>([]);
  const [selectedAddOnsItems, setSelectedAddOnsItems] = useState<Variation[]>(
    []
  );
  const [showAll, setShowAll] = useState(false);
  const { updateCartCount } = useCartContext();

  const increment = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const selectedVariationPrice =
    selectedItem?.Variation?.find(
      (variation) => variation?.name === selectedVariation
    )?.price ||
    selectedItem?.sellPrice ||
    0;

  const total = selectedVariationPrice * quantity;
  const addOns = selectedAddOnsItems?.reduce(
    (total, addOn) => total + addOn?.price,
    0
  );
  const another = selectedItems?.reduce(
    (total, item) => total + (item.sellPrice as number),
    0
  );
  const totalPrice = total + addOns;
  const subTotalPrice = total + addOns + another;

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

  // Function to add the item to localStorage
  const addToCart = () => {
    const cartItem = {
      id: selectedItem?.id,
      name: selectedItem?.name,
      variation: selectedVariation,
      quantity,
      price: selectedVariationPrice,
      totalPrice,
      specialInstructions,
      image: selectedItem?.image,
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemExists = cart.some(
      (item: any) =>
        item.id === selectedItem?.id && item.variation === selectedVariation
    );

    if (itemExists) {
      return toast.error("Item already added to cart!");
    } else {
      cart.push(cartItem);
      if (selectedItems?.length > 0) {
        selectedItems.forEach((item) => {
          const cartItems = {
            id: item?.id,
            name: item?.name,
            quantity: 1,
            price: item?.sellPrice,
            image: item?.image,
          };
          cart.push(cartItems);
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Food added to cart successfully!");

      // Notify context about the change
      updateCartCount(); // Update the cart count in the context directly
    }

    setQuantity(1);
    setSelectedAddOnsItems([]);
    setSelectedVariation("Half");
    setSpecialInstructions("");
    setSelectedItems([]);
    toggleDrawer();
  };

  const closeHandler = () => {
    setQuantity(1);
    setSelectedVariation("Half");
    setSpecialInstructions("");
    setSelectedItems([]);
    toggleDrawer();
  };

  const handleRelatedItems = (item: Partial<Food>) => {
    if (selectedItems.some((selectedItem) => selectedItem.id === item.id)) {
      // Remove the item if it already exists
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem.id !== item.id)
      );
    } else {
      // Add the item to the selectedItems
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleAddOnsChange = (selectedAddOn: Variation) => {
    if (selectedAddOnsItems.some((item) => item.id === selectedAddOn.id)) {
      setSelectedAddOnsItems(
        selectedAddOnsItems.filter((item) => item.id !== selectedAddOn.id)
      );
    } else {
      setSelectedAddOnsItems([...selectedAddOnsItems, selectedAddOn]);
    }
  };

  // Load special instructions from local storage when component mounts
  useEffect(() => {
    const storedInstructions = localStorage.getItem("specialInstructions");
    if (storedInstructions) {
      setSpecialInstructions(storedInstructions);
    }
  }, []);

  // Update local storage whenever specialInstructions changes
  useEffect(() => {
    localStorage.setItem("specialInstructions", specialInstructions);
  }, [specialInstructions]);

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
    <>
      <ItemsDrawer isOpen={isOpen} isLargeDevice={isLargeDevice}>
        <div
          className={`overflow-y-auto ${isLargeDevice
            ? "max-h-[calc(100vh-100px)] pb-28"
            : "max-h-[100vh] pb-24"
            }`}
        >
          <div className="mb-3">
            <img
              src={
                selectedItem?.image
                  ? selectedItem?.image
                  : "https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
              }
              alt=""
              className="h-auto max-h-[220px] lg:max-h-[280px] w-full object-cover rounded-b-lg md:rounded-t-lg shadow-lg"
            />
          </div>
          <div className=" p-4">
            {/* Close Button */}
            <div className="flex justify-end fixed top-5 right-7 z-50">
              <button
                className="bg-gray-50 h-8 w-8 border rounded-full mb-3 flex items-center justify-center"
                onClick={closeHandler}
              >
                <RxCross2 />
              </button>
            </div>

            {/* Item Details */}
            <div>
              <h2 className="font-semibold">{selectedItem?.name}</h2>
              <h2 className="text-xs font-semibold pt-1">
                Price ৳{selectedItem?.sellPrice}
              </h2>
              <h2 className="text-xs text-gray-500 pt-2">
                {selectedItem?.description}
              </h2>
            </div>

            {/* Variation */}
            {selectedItem?.Variation && (
              <div className="border shadow p-2 rounded-md mt-4">
                <h2 className="mb-3 text-xs font-semibold">Variation</h2>
                {selectedItem?.Variation.map((variation) => (
                  <label
                    key={variation.name}
                    className="flex justify-between mb-3 text-xs capitalize"
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        value={variation.name}
                        checked={selectedVariation === variation.name}
                        onChange={() => setSelectedVariation(variation.name)}
                        className="mr-2"
                      />
                      {variation.name}
                    </div>
                    <h2>{variation.price}</h2>
                  </label>
                ))}
              </div>
            )}

            {/* Add Ons */}
            <h2 className="mt-4 text-[13px] font-semibold flex justify-between items-center">
              <p>Add Ons </p>
              <p className="text-gray-500 text-xs">(Optional)</p>
            </h2>
            <p className="mb-3 mt-1 text-xs">Select up to 5</p>
            {selectedItem?.addOns?.slice(0, 5)?.map((item, index) => {
              return (
                <label
                  key={index}
                  className="p-3 flex flex-row justify-between items-center border rounded-md relative mt-2 cursor-pointer z-10"
                >
                  {/* Checkbox before image */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAddOnsItems.some(
                        (selectedItem) => selectedItem.id === item.id
                      )}
                      onChange={() => handleAddOnsChange(item)}
                      className="mr-2 h-4 w-4"
                    />
                    <p className="text-xs font-semibold text-gray-800">
                      {item?.name}
                    </p>
                  </div>
                  <p className="text-xs lg:text-base font-medium text-textColor">
                    + ৳{item?.price}
                  </p>
                </label>
              );
            })}

            <h2 className="mt-4 text-[13px] font-semibold flex justify-between items-center">
              <p>Frequently bought together </p>
              <p className="text-gray-500 text-xs">(Optional)</p>
            </h2>
            <p className="mb-3 mt-1 text-xs">Others around you liked this</p>
            {selectedItem?.relatedItems
              ?.slice(0, showAll ? 10 : 3)
              ?.map((item) => {
                return (
                  <label
                    key={item.id}
                    className="p-2 flex flex-row justify-between items-center border rounded-md relative mt-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(
                          (selectedItem) => selectedItem.id === item.id
                        )}
                        onChange={() => handleRelatedItems(item)}
                        className="mr-2 h-4 w-4"
                      />
                      <img
                        src="https://images.deliveryhero.io/image/fd-bd/Products/5331721.jpg??width=400"
                        alt=""
                        className="h-12 w-12 object-cover rounded-md"
                      />
                      <p className="text-xs font-semibold text-gray-800">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs lg:text-base font-medium text-textColor">
                      ৳{item.sellPrice}
                    </p>
                  </label>
                );
              })}

            {
              <button
                onClick={() => setShowAll(showAll ? false : true)}
                className="mt-2 text-blue-500  text-xs"
              >
                {selectedItem?.relatedItems &&
                  selectedItem?.relatedItems?.length > 3 &&
                  !showAll
                  ? "Show all"
                  : selectedItem?.relatedItems &&
                    selectedItem?.relatedItems?.length <= 3
                    ? ""
                    : "Show less"}
              </button>
            }
            {/* Special Instructions */}
            <label className="form-control w-full mt-2">
              <div className="label">
                <h2 className="font-semibold text-xs">Special instructions</h2>
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)} // Update state on change
                className="focus:outline-none border rounded-md p-2 text-xs md:text-sm"
                placeholder="Special instructions"
              ></textarea>
            </label>
          </div>
        </div>

        {/* Total Price and Add to Cart */}
        <div
          className={`p-4 pt-2 border bottom-0 absolute w-full bg-white z-50 ${isLargeDevice ? "rounded-b-lg" : ""
            }`}
        >
          <p className="text-sm font-semibold pb-2">
            Total Price: ৳{subTotalPrice}
          </p>
          <div className="flex justify-between">
            <div className="flex items-center border rounded-md text-sm">
              <button
                onClick={decrement}
                className="px-3.5 rounded-md rounded-e-none h-full text-[11px] bg-gray-200"
              >
                <FaMinus />
              </button>
              <span className="px-3.5">{quantity}</span>
              <button
                onClick={increment}
                className="px-3.5 rounded-md rounded-s-none h-full text-[14px] bg-gray-200"
              >
                <FiPlus />
              </button>
            </div>
            <button
              onClick={addToCart}
              className="bg-primaryColor px-3 py-1.5 rounded-md text-white h-fit text-sm"
            >
              Add to cart
            </button>
          </div>
        </div>
      </ItemsDrawer>
    </>
  );
};

export default ItemsCart;

const ItemsDrawer = ({ children, isOpen, isLargeDevice }: DrawerProps) => {
  if (isLargeDevice) {
    return (
      <div
        className={`fixed top-0 left-0 inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden ${isOpen ? "bg-black bg-opacity-50" : "hidden"
          }`}
        style={{ zIndex: 999 }}
      >
        <div
          className={`bg-white rounded-lg shadow-lg transition-transform duration-500 ease-in-out ${isOpen ? "scale-100" : "scale-0"
            } md:max-w-lg w-full h-auto `}
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
            } fixed bottom-0 left-0 w-full min-h-[100%]`}
        >
          {children}
        </div>
      </div>
    );
  }
};
