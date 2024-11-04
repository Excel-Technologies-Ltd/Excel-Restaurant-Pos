import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { zIndex } from "../../data/zIndex";
import { setSidebarOpen } from "../../redux/features/sidebar/sidebar";
import { RootState } from "../../redux/store/Store";
import { styles } from "../../utilities/cn";
import { GetMenuItems } from "./sidebar-routes-array/sidebar-array";

type Props = {};

const MobileSidebar = ({}: Props) => {
  // get sidebar open state from store
  const { sidebarOpen } = useSelector((store: RootState) => store.sidebar);

  const dispatch = useDispatch();

  // router location
  const router = useLocation();

  // route array
  const routeArray = router?.pathname?.split("/");

  // get menu items
  const { menuItems } = GetMenuItems();

  const submenuUrl = (item: any) => {
    const items = item?.map((item: any) => item?.url);
    return items?.map((path: any) => path.slice(1));
  };

  return (
    <div
      className={styles(
        "h-screen fixed top-0 left-0 w-14 bg-white pt-16 mobile_sidebar shadow",
        { hidden: sidebarOpen }
      )}
      style={{ zIndex: zIndex.mobileSidebar }}
    >
      <div className="flex flex-col items-center gap-3">
        {menuItems?.map((item, index) => {
          return (
            <div key={index} title={item?.label}>
              {/* <Tooltip title={item?.label}> */}
              <NavLink
                to={item?.submenu ? item?.submenu?.[0]?.url : item?.url}
                onClick={() => {
                  if (item?.submenu) {
                    item?.submenu ? toast.success("SubMenu") : "";
                    dispatch(setSidebarOpen(!sidebarOpen));
                  }
                }}
                className={styles(
                  "flex items-center justify-between p-2 text-grayTextColor text-base rounded-lg group hover:text-primaryColor bg-borderColor shadow border border-transparent",
                  {
                    active: submenuUrl(item?.submenu)?.includes(routeArray[1]),
                  },
                  {
                    active: item?.moduleName?.includes(
                      routeArray[1]?.toLowerCase()
                    ),
                  }
                )}
              >
                {item?.icon}
              </NavLink>
              {/* </Tooltip> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSidebar;
