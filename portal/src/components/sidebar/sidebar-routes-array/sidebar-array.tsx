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
import { PiListChecksFill } from "react-icons/pi";
import { RiFileUserFill } from "react-icons/ri";
import { TbCategoryFilled } from "react-icons/tb";
import {
  URLCategories,
  URLDashboard,
  URLFoods,
  URLOrders,
  URLTableManagement,
  URLUsers,
} from "../../../routes/routes-link";

interface MenuItem {
  label: string;
  url: string;
  badge?: JSX.Element;
  icon: JSX.Element;
  submenu?: Submenu[];
  moduleName?: string[];
  isModuleAccess: boolean;
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
    },
    {
      label: "Pos",
      url: URLFoods(),
      icon: <IoFastFoodSharp size={19} />,
      isModuleAccess: true,
    },
    {
      label: "Table Management",
      url: URLTableManagement(),
      icon: <MdOutlineTableRestaurant size={19} />,
      isModuleAccess: true,
    },
    {
      label: "Orders ",
      url: URLOrders(),
      icon: <PiListChecksFill size={19} />,
      isModuleAccess: true,
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
