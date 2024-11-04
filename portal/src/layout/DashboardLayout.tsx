import { Outlet } from "react-router";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

type Props = {};

const DashboardLayout = ({}: Props) => {
  return (
    <div className="">
      <Header />
      <div className="bg-gray-50">
        <Sidebar>
          <Outlet />
        </Sidebar>
      </div>
    </div>
  );
};

export default DashboardLayout;
