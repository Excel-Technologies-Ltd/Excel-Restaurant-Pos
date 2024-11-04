import { useState } from "react";
import { IoFastFoodOutline } from "react-icons/io5";
import ItemsPageBottom from "../../components/header/ItemsPageBottom";
import ItemList from "../../components/itemspage/ItemList";

type FoodCategory = {
  id: number;
  name: string;
  description: string;
};

const ItemsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("0");
  return (
    <div className="h-screen">
      <div className="h-screen flex">
        {/* Category column with scrolling */}
        <div className="overflow-y-auto bg-gray-50 w-32 shadow-md">
          <div className={`bg-gray h-[70vh] pt-12 px-2 `}>
            <div
              onClick={() => setSelectedCategory(String(0))}
              className={`p-2 cursor-pointer flex flex-col justify-center items-center border border-primaryColor rounded-md h-20 mt-2 hover:bg-lightPrimaryColor  ${"0" === selectedCategory ? "bg-lightPrimaryColor" : ""
                }`}
            >
              <IoFastFoodOutline className="text-primaryColor text-2xl mb-2" />
              <p className="text-xs md:text-sm text-gray-light text-center">
                All
              </p>
            </div>
            {foodCategories?.map((category: FoodCategory, index: number) => (
              <div
                onClick={() => setSelectedCategory(String(category?.id))}
                key={index}
                className={`p-2 cursor-pointer flex flex-col justify-center items-center border border-primaryColor rounded-md h-20 mt-2 hover:bg-lightPrimaryColor  ${String(category?.id) === selectedCategory
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
          <ItemList className="py-12" selectedCategory={selectedCategory} />
        </div>
      </div>
      <ItemsPageBottom />
    </div>
  );
};

export default ItemsPage;

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
