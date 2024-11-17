import { useEffect, useState } from "react";
import { IoFastFoodOutline } from "react-icons/io5";
import ItemsPageBottom from "../../components/header/ItemsPageBottom";
import ItemList from "../../components/ItemList/ItemList";
import { useParams, useSearchParams } from "react-router-dom";
import Drawer from "../../components/Drawer/Drawer";
import Select from "../../components/form-elements/Select";
import Button from "../../components/Button/Button";
import { useFrappeDocTypeEventListener, useFrappeGetCall, useFrappeGetDocList } from "frappe-react-sdk";
import toast from "react-hot-toast";

type FoodCategory = {
  id?: number;
  name?: string;
  description?: string;
};

enum OrderType {
  DineIn = "dineIn",
  TakeAway = "takeAway",
}

const Items = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: categories,mutate} = useFrappeGetCall('excel_restaurant_pos.api.item.get_category_list', {
    fields: ["*"]
  },)
  useFrappeDocTypeEventListener('Item Group', (doc) => {
    console.log("Event Received:", doc);
    mutate();
    toast.success("Category updated!");
  });
  const [searchParams] = useSearchParams();
const table_id = searchParams.get("table_id");
 // Logs the value of `order_type`.

  

  const [isOpen, setIsOpen] = useState(false);
  const [isLargeDevice, setIsLargeDevice] = useState(window.innerWidth > 768);

  const [isTableSelectShow, setIsTableSelectShow] = useState(false);
  const order_type = searchParams.get("order_type");


  // useFrappeGetCall
  // const { data: categories, isLoading: isLoadingCategories } = useFrappeGetCall('excel_restaurant_pos.api.item.get_category_list', {
  //   fields: ["*"]
  // })



  
  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
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
  console.log(table_id);
}, [table_id])

  return (
    <div className="h-screen">
      <div className="h-screen flex">
        {/* Category column with scrolling */}
        <div className="overflow-y-auto bg-gray-50 w-32 shadow-md">
          <div className={`bg-gray h-[70vh] pt-12 px-2 `}>
            <div
              onClick={() => setSelectedCategory("")}
              className={`p-2 cursor-pointer flex flex-col justify-center items-center border border-primaryColor rounded-md h-20 mt-2 hover:bg-lightPrimaryColor  ${"" === selectedCategory ? "bg-lightPrimaryColor" : ""
                }`}
            >
              <IoFastFoodOutline className="text-primaryColor text-2xl mb-2" />
              <p className="text-xs md:text-sm text-gray-light text-center">
                All
              </p>
            </div>
            {categories?.message?.map((category: FoodCategory, index: number) => (
              <div
                onClick={() => setSelectedCategory(String(category?.name))}
                key={index}
                className={`p-2 cursor-pointer flex flex-col justify-center items-center border border-primaryColor rounded-md h-20 mt-2 hover:bg-lightPrimaryColor ${String(category?.id) === selectedCategory
                  ? "bg-lightPrimaryColor"
                  : ""
                  }`}
              >
                <IoFastFoodOutline className="text-primaryColor text-2xl mb-2" />
                <p className="text-xs md:text-sm text-gray-light text-center">
                  {" "}
                  {category?.name}
                </p>
              </div>
            ))}
            <div className="pt-16"></div>
          </div>
        </div>

        {/* Item list column */}
        <div className="h-full w-full overflow-y-auto">
        <p className="text-xs md:text-sm text-gray-light text-center">      
                  {selectedCategory}
                </p>
          
          <ItemList className="py-12"  selectedCategory={selectedCategory} table_id={table_id} />
        </div>
      </div>
      <ItemsPageBottom />
      {/* <Drawer isOpen={isOpen} isLargeDevice={isLargeDevice}>
        <div
          className={`overflow-y-auto p-4 ${isLargeDevice
            ? "max-h-[calc(100vh-100px)] "
            : "max-h-[100vh]"
            }`}
        >
          <div className="p-4">
            <label className="text-sm font-medium">How would you like to order?</label>
            <Select className="mt-2" onChange={(e) => {
              setSearchParams({ order_type: e.target.value })
              if (e.target.value === OrderType.DineIn)
                setIsTableSelectShow(true)
              else
                setIsTableSelectShow(false)

            }}
            >
              <option value={OrderType.DineIn}>Dine In</option>
              <option value={OrderType.TakeAway}>Take Away</option>
            </Select>
          </div>
          {isTableSelectShow && (
            <div className="mb-3 p-4">
              <label className="text-sm font-medium">Select Table</label>
              <Select className="mt-2" onChange={(e) => setSearchParams({ table_id: e.target.value })}>
                <option value={OrderType.DineIn}>Dine In</option>
                <option value={OrderType.TakeAway}>Take Away</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button className="mr-2 cancel_btn" onClick={() => {
              toggleDrawer()
            }} >
              Cancel
            </button>

            <Button className="main_btn" label="Start Order" onClick={() => {
              toggleDrawer()
            }} />

          </div>
        </div>
      </Drawer > */}
    </div >
  );
};

export default Items;

export const foodCategories: FoodCategory[] = [
  {
    id: 1,
    name: "Mutton",
    description: "Delicious and tender mutton dishes cooked to perfection.",
  },
  {
    id: 2,
    name: "Kacchi Biriyani",
    description: "Aromatic and flavorful kacchi biriyani with tender meat.",
  },
  {
    id: 3,
    name: "Chicken",
    description: "Variety of chicken dishes, grilled, fried, or curry-based.",
  },
  {
    id: 4,
    name: "Pizza",
    description: "Delicious hand-tossed pizzas with various toppings.",
  },
  {
    id: 5,
    name: "Burgers",
    description: "Juicy and flavorful burgers, made with fresh ingredients.",
  },
  {
    id: 6,
    name: "Pasta",
    description: "Italian pasta dishes, from spaghetti to lasagna.",
  },
  {
    id: 7,
    name: "Salads",
    description: "Fresh and healthy salads, with a variety of dressings.",
  },
  {
    id: 8,
    name: "Sushi",
    description: "Authentic sushi rolls, sashimi, and nigiri.",
  },
  {
    id: 9,
    name: "Seafood",
    description: "Fresh fish and seafood dishes, grilled or fried.",
  },
  {
    id: 10,
    name: "Steaks",
    description: "Tender and juicy steaks, cooked to perfection.",
  },
  {
    id: 11,
    name: "Sandwiches",
    description: "Tasty sandwiches with various fillings and bread types.",
  },
  {
    id: 12,
    name: "BBQ",
    description: "Smoked and grilled meats, served with signature sauces.",
  },
  {
    id: 13,
    name: "Desserts",
    description: "Sweet treats like cakes, ice creams, and pastries.",
  },
  {
    id: 14,
    name: "Beverages",
    description: "Refreshing drinks, including juices, sodas, and shakes.",
  },
  {
    id: 15,
    name: "Appetizers",
    description: "Start your meal with delicious starters and bites.",
  },
];

// export const foodCategories = [
//   { id: 1, title: "Fruits" },
//   { id: 2, title: "Vegetables" },
//   { id: 3, title: "Grains" },
//   { id: 4, title: "Legumes" },
//   { id: 5, title: "Nuts and Seeds" },
//   { id: 6, title: "Dairy Products" },
//   { id: 7, title: "Meat" },
//   { id: 8, title: "Poultry" },
//   { id: 9, title: "Fish and Seafood" },
//   { id: 10, title: "Eggs" },
//   { id: 11, title: "Baked Goods" },
//   { id: 12, title: "Condiments and Sauces" },
//   { id: 13, title: "Snacks" },
//   { id: 14, title: "Frozen Foods" },
//   { id: 15, title: "Cereals" },
//   { id: 16, title: "Herbs and Spices" },
//   { id: 17, title: "Beverages" },
//   { id: 18, title: "Soups and Broths" },
//   { id: 19, title: "Canned Goods" },
//   { id: 20, title: "Prepared Meals" },
// ];
