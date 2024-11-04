import { Outlet } from "react-router";
import Header from "../components/header/Header";

type Props = {};

const MainLayout = ({ }: Props) => {
  return (
    <div className="">
      <Header />
      <div className="">
        <Outlet />
        {/* <ItemsPageBottom /> */}
      </div>
    </div>
  );
};

export default MainLayout;
