
import { createBrowserRouter, RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import MainLayout from "../layout/MainLayout";
import {
  URLCategories,
  URLDashboard,
  URLAdminPos,
  URLItem,
  URLItems,
  URLOrders,
  URLTableManagement,
  URLUsers,
} from "./routes-link";
import { URLLogin } from "./routes-link.js";
import Error from "../pages/error/Error";
// import Dashboard from "../pages/dashboard/Dashboard";
import DraggableTable from "../pages/table-management/DraggableTable.js";
// import Foods from "../pages/foods/Foods.js";
// import Orders from "../pages/orders/Orders.js";
import Login from "../pages/login/Login.js";
import { lazy } from "react";
const Home = lazy(() => import("../pages/Home/Home.js"));
const Items = lazy(() => import("../pages/Items/Items"));
// const DraggableTable = lazy(
//   () => import("../pages/table-management/DraggableTable")
// );
const Orders = lazy(() => import("../pages/orders/Orders"));
const Pos = lazy(() => import("../pages/Admin/Pos/Pos"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
// const Login = lazy(() => import("../pages/login/Login"));
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: URLItems(),
        element: <Items />,
      },
      {
        path: URLItem(),
        element: "<Item />",
      },
    ],
  },
  {
    errorElement: <Error />,
    element: <DashboardLayout />,
    children: [
      {
        path: URLDashboard(),
        element: <Dashboard />,
      },
      {
        path: URLTableManagement(),
        element: <DraggableTable />,
      },
      {
        path: URLAdminPos(),
        element: <Pos />,
      },
      {
        path: URLOrders(),
        element: <Orders />,
      },
      {
        path: URLCategories(),
        element: "Categories",
      },
      {
        path: URLUsers(),
        element: "Users",
      },
    ],
  },
  {
    path: URLLogin(),
    element: <Login />,
  },
  // {
  //   path: "*",
  //   element: <Error />,
  // },
], { basename: '/restaurant' });
