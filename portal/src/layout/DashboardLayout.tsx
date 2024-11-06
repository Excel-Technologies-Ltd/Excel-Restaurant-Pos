import { Navigate, Outlet } from "react-router";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { URLLogin } from "../routes/routes-link";
import { useFrappeAuth } from "frappe-react-sdk";

type Props = {};

const DashboardLayout = ({ }: Props) => {
  const { isLoading, currentUser } = useFrappeAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* <Loading /> */}
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={URLLogin()} />;
  }

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
