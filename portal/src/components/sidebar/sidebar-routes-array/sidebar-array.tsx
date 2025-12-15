/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { AiFillDashboard } from "react-icons/ai";
import { IoFastFoodSharp } from "react-icons/io5";
import { MdOutlineTableRestaurant } from "react-icons/md";
import { PiChefHatFill, PiListChecksFill } from "react-icons/pi";
import { RiFileUserFill } from "react-icons/ri";
import { TbCategoryFilled } from "react-icons/tb";
import { FaIndustry } from "react-icons/fa";
import { URLAdminPos, URLCategories, URLChefOrders, URLDashboard, URLOrders, URLProduction, URLStockTransfer, URLTableManagement, URLUsers, URLWastage } from "../../../routes/routes-link";
import { MdCompareArrows } from "react-icons/md";


interface MenuItem {
  label: string;
  url: string;
  badge?: JSX.Element;
  icon: JSX.Element;
  submenu?: Submenu[];
  moduleName?: string[];
  isModuleAccess: boolean;
  requiredRoles?: string[]
}
interface Submenu {
  label: string;
  url: string;
  badge?: JSX.Element;
  icon: JSX.Element;
}

export const GetMenuItems = () => {
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      url: URLDashboard(),
      icon: <AiFillDashboard size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager","Restaurant Waiter","Restaurant Cashier","Restaurant Chef"],
    },
    {
      label: "POS",
      url: URLAdminPos(),
      icon: <IoFastFoodSharp size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager", "Restaurant Waiter","Restaurant Cashier"],
    },
    {
      label: "Table Management",
      url: URLTableManagement(),
      icon: <MdOutlineTableRestaurant size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager"],
    },
    {
      label: "Orders ",
      url: URLOrders(),
      icon: <PiListChecksFill size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager", "Restaurant Waiter","Restaurant Cashier"],
    },
    {
      label: "Kitchen Orders",
      url: URLChefOrders(),
      icon: <PiChefHatFill size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Chef"],
    },
    {
      label: "Production",
      url: URLProduction(),
      icon: <FaIndustry size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager", "Restaurant Chef"],
    },
    {
      label: "Stock Transfer",
      url: URLStockTransfer(),
      icon: <MdCompareArrows size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager", "Restaurant Chef"],
    },
    {
      label: "Wastage Management",
      url: URLWastage(),
      icon: <FaIndustry size={19} />,
      isModuleAccess: true,
      requiredRoles: ["Restaurant Manager", "Restaurant Chef"],
    },
    {
      label: "Categories ",
      url: URLCategories(),
      icon: <TbCategoryFilled size={19} />,
      isModuleAccess: false,
    },
    {
      label: "Users",
      url: URLUsers(),
      icon: <RiFileUserFill size={19} />,
      isModuleAccess: false,
    },
  ];

  // Filter menu items based on condition
  const filteredMenuItems = menuItems?.filter(
    (item) => item?.isModuleAccess !== false
  );

  return { menuItems: filteredMenuItems };
};
