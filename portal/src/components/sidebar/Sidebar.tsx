/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdOutlineMenu } from "react-icons/md";
import { TbCircle, TbCircleFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { zIndex } from "../../data/zIndex";
import useWindowWidth from "../../hook/useWindowWidth";
import Pos from "../../pages/Admin/Pos/Pos";
import ModalRightToLeft from "../../pages/table-management/ModalRightToLeft";
import { closeRightModal } from "../../redux/features/modal/foodsModal";
import { setSidebarOpen } from "../../redux/features/sidebar/sidebar";
import { RootState } from "../../redux/store/Store";
import { styles } from "../../utilities/cn";
import MobileSidebar from "./MobileSidebar";
import { GetMenuItems } from "./sidebar-routes-array/sidebar-array";
import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk";

// sidebar props type
type Props = {
  children: React.ReactNode;
};

/**
 * @description Sidebar component
 */
const Sidebar = ({ children }: Props) => {
 


  // action dispatcher
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {currentUser} = useFrappeAuth();
  const {data:roles} = useFrappeGetCall(`excel_restaurant_pos.api.item.get_roles?user=${currentUser}`)
  const userRoles = roles?.message?.map((role:any)=>role?.Role)


  // Get the modal state from Redux
  const rightModalOpen = useSelector(
    (state: RootState) => state.foodsModal.rightModalOpen
  );

  // const handleCloseModal = () => dispatch(closeRightModal());

  const handleCloseModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete("table");

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });

    dispatch(closeRightModal()); // Close the modal
  };

  // get sidebar open state from store
  const { sidebarOpen } = useSelector((store: RootState) => store.sidebar);

  // selected menu state
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);

  // use window width hook
  const w900 = useWindowWidth(900);

  // sidebar open state
  const sidebarVal = w900 ? false : true;

  // router location
  const router = useLocation();

  // route array
  const routeArray = router?.pathname?.split("/");

  // get menu items
  const { menuItems } = GetMenuItems();

  // // active menu index

  const activeIndex = menuItems?.findIndex((element) => {
    const label = element?.url?.toLowerCase();

    return label === `/${routeArray[1]?.toLowerCase()}` && true;
  });

  const handleMenuClick = (index: number) => {
    if (selectedMenu === index) {
      setSelectedMenu(null);
    } else {
      setSelectedMenu(index);
    }

    if (
      selectedMenu !== null &&
      !menuItems[selectedMenu]?.submenu &&
      selectedMenu !== index
    ) {
      setSelectedMenu(null);
    }
  };
  const filteredMenuItems = menuItems?.filter((menuItem) => {
    return menuItem?.requiredRoles?.some((role) => userRoles?.includes(role));
  });

  const submenuUrl = (item: any) => {
    const items = item?.map((item: any) => item?.url);
    return items?.map((path: any) => path.slice(1));
  };

  useEffect(() => {
    dispatch(setSidebarOpen(sidebarVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w900, dispatch]);

  useEffect(() => {
    setSelectedMenu(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MobileSidebar />
      <aside
        className={styles(
          "fixed top-0 left-0 w-52 h-screen duration-500 ease-in-out sidebar",
          { "-translate-x-52": !sidebarOpen },
          { "translate-x-0": sidebarOpen }
        )}
        style={{ zIndex: zIndex.sidebar }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-bgColor shadow">
          <div className="uppercase font-bold text-primaryColor flex items-center gap-3">
            <button
              onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
              type="button"
              className={styles("inline-flex items-center text-sm ")}
            >
              <MdOutlineMenu size={22} className="text-grayColor" />
            </button>
            <Link to={"/"}>Restaurant Pos</Link>
          </div>
          {/* SIDEBAR ITEM LIST */}
          <ul className="space-y-2 font-medium mt-6">
            {filteredMenuItems?.map((menuItem, index) => (
              <li key={index}>
                {menuItem?.submenu ? (
                  <>
                    <label
                      htmlFor={`menu-${index}`}
                      className="flex items-center justify-between p-2 text-grayTextColor rounded-md group cursor-pointer hover:text-primaryColor hover:bg-lightPrimaryColor "
                      onClick={() =>
                        navigate(
                          menuItem?.submenu ? menuItem?.submenu?.[0]?.url : ""
                        )
                      }
                    >
                      <div
                        className={styles("flex items-center ", {
                          "text-primaryColor":
                            selectedMenu === index ||
                            submenuUrl(menuItem?.submenu)?.includes(
                              routeArray[1]
                            ),
                        })}
                      >
                        {menuItem?.icon}
                        <span
                          className={styles(
                            "ms-3  text-[12px] 2xl:text-[14px]",
                            {
                              "text-primaryColor": selectedMenu === index,
                            }
                          )}
                        >
                          {menuItem?.label}
                        </span>
                      </div>
                      {!submenuUrl(menuItem?.submenu)?.includes(
                        routeArray[1]
                      ) && <IoIosArrowDown size={14} />}
                      {submenuUrl(menuItem?.submenu)?.includes(
                        routeArray[1]
                      ) && <IoIosArrowUp size={14} />}
                    </label>

                    <input
                      type="checkbox"
                      id={`menu-${index}`}
                      className="hidden"
                      checked={submenuUrl(menuItem?.submenu)?.includes(
                        routeArray[1]
                      )}
                      // checked={selectedMenu === index}
                      onChange={() => handleMenuClick(index)}
                    />
                    <ul
                      className={`pl-5 space-y-2 ${submenuUrl(menuItem?.submenu)?.includes(routeArray[1])
                        ? "block"
                        : "hidden"
                        }`}
                    >
                      {menuItem?.submenu?.map((subMenuItem, subIndex) => (
                        <li key={subIndex} className=" first:mt-2">
                          <NavLink
                            to={subMenuItem?.url}
                            onClick={() =>
                              dispatch(
                                setSidebarOpen(w900 ? false : sidebarOpen)
                              )
                            }
                            className="flex items-center py-2 ps-2 text-grayTextColor rounded-md group hover:text-primaryColor hover:bg-lightPrimaryColor"
                          >
                            {/* {subMenuItem?.icon} */}
                            {subMenuItem?.url?.split("/")[1] !=
                              routeArray[1] && <TbCircle size={12} />}

                            {subMenuItem?.url?.split("/")[1] ===
                              routeArray[1] && <TbCircleFilled size={12} />}
                            <span className={styles("ms-1 text-xs")}>
                              {subMenuItem?.label}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink
                    onClick={() => {
                      setSelectedMenu(null),
                        dispatch(setSidebarOpen(w900 ? false : sidebarOpen));
                    }}
                    to={menuItem?.url}
                    className={styles(
                      "flex items-center justify-between p-2 text-grayTextColor text-base rounded-md group hover:text-primaryColor hover:bg-lightPrimaryColor",
                      {
                        "active font-semibold": menuItem?.moduleName?.includes(
                          routeArray[1]?.toLowerCase()
                        ),
                      }
                    )}
                  >
                    <div className="flex items-center">
                      {menuItem?.icon}
                      <span className="ms-3 text-xs">{menuItem?.label}</span>
                    </div>
                    {menuItem?.badge && menuItem?.badge}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div
        onClick={() => dispatch(setSidebarOpen(w900 ? false : sidebarOpen))}
        className={styles(
          ` duration-500 ease-in-out min-h-[100vh] pt-12`,
          { "ml-52": sidebarOpen && !w900 },
          { "ml-14": sidebarOpen && w900 },
          { "ml-14": !sidebarOpen }
        )}
      >
        {children}
      </div>

      {rightModalOpen && false && (
        <ModalRightToLeft
          rightModalOpen={rightModalOpen}
          handleCloseModal={handleCloseModal}
        >
          <Pos />
        </ModalRightToLeft>
      )}
    </>
  );
};

export default Sidebar;
