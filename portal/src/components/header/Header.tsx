import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDoc,
} from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import { ImCalculator } from "react-icons/im";
import { MdOutlineMenu } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { zIndex } from "../../data/zIndex";
import { setSidebarOpen } from "../../redux/features/sidebar/sidebar";
import { RootState } from "../../redux/store/Store";
import { URLDashboard, URLLogin } from "../../routes/routes-link";
import { styles } from "../../utilities/cn";
import Calculator from "../calculator/Calculator";

type Props = {};

const Header = ({}: Props) => {
  const { data: getLogoAndTitle } = useFrappeGetCall(
    "excel_restaurant_pos.api.item.get_logo_and_title",
    { fields: ["*"] }
  );
  const { logout, currentUser } = useFrappeAuth();
  const { data: getFullName } = useFrappeGetDoc(
    "User",
    currentUser ?? undefined,
    ["full_name"]
  );

  // get First letter of first name and last name
  // const firstLetter = getFullName?.full_name?.split(" ")[0]?.[0] ?? "";

  // action dispatcher
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathDashboard = pathname?.split("/")[1];

  // get sidebar state from store
  const { sidebarOpen } = useSelector((store: RootState) => store.sidebar);

  // dropdown state
  const [dropdown, setDropDown] = useState(false);
  const [dropdownCalculator, setDropDownCalculator] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(URLLogin());
  };

  // handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdown !== false && !target.closest(".dropdown-container")) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown]);

  // const handleKeyDown = (e: KeyboardEvent) => {
  //   const key = e.key;

  //   if (pathDashboard !== "admin") return;

  //   if ((e.ctrlKey || e.metaKey) && key === "/") {
  //     e.preventDefault();
  //     setDropDownCalculator(true);
  //   } else if (key === "Escape") {
  //     setDropDownCalculator(false);
  //     // } else if (key === "Backspace") {
  //     //   e.preventDefault();
  //   } else if (["+", "-", "*", "%"].includes(key)) {
  //     e.preventDefault();
  //   } else if (!isNaN(Number(key)) || key === ".") {
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown); // Listen to keyboard events

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown); // Cleanup listener
  //   };
  // }, []);

  return (
    <div
      className="border-b fixed top-0 w-full bg-bgColor"
      style={{ zIndex: zIndex.header }}
    >
      <div className="h-12 flex justify-between items-center px-5">
        <div className="uppercase font-bold text-primaryColor flex items-center gap-3">
          {pathDashboard === "admin" && (
            <button
              onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
              type="button"
              className={styles("inline-flex items-center text-sm ")}
            >
              <MdOutlineMenu size={22} className="text-grayColor" />
            </button>
          )}
          <Link to={"/"} className="cursor-pointer flex items-center gap-2">
            <img
              src={getLogoAndTitle?.message?.logo}
              alt="Restaurant Pos Logo"
              className="w-8 h-8 object-contain"
            />
            <span>{getLogoAndTitle?.message?.title}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* {`/${pathDashboard}` === URLItems() && (
            <input
              type="search"
              placeholder="Search..."
              className="focus:outline-none border border-borderColor px-2 py-1.5 rounded text-xs w-[137px] sm:w-44 2xl:w-60"
            />
          )} */}

          {pathDashboard === "admin" && (
            <button
              onClick={() => {
                setDropDownCalculator(!dropdownCalculator);
              }}
              className="border border-borderColor p-1 rounded"
            >
              <ImCalculator className="text-xl text-gray-500" />
            </button>
          )}
          {true && (
            <div
              className={styles(
                "absolute top-12 right-4 w-80 opacity-0 transition-all duration-300",
                {
                  " opacity-100": dropdownCalculator,
                },
                {
                  hidden: !dropdownCalculator,
                }
              )}
              // ref={inputRef}
            >
              <Calculator isOpen={dropdownCalculator} />
            </div>
          )}

          <div className="flex items-center dropdown gap-2 z-50">
            <div className="relative">
              <button
                onClick={() => setDropDown(!dropdown)}
                className="gap-1 flex items-center  text-textColor dropdown-container"
              >
                {/* USER PROFILE */}
                {false ? (
                  <img
                    // src={user?.avatar?.image_url}
                    alt="User Avatar"
                    className="w-[35px] h-[35px] rounded-full cursor-pointer border border-borderColor shadow"
                  />
                ) : (
                  <div className="border border-borderColor shadow bg-lightPrimaryColor w-[35px] h-[35px] text-grayColor bg-lightBlue rounded-full cursor-pointer flex justify-center items-center">
                    {/* <FaUserCircle
                  className={`w-[30px] h-[30px] text-grayColor bg-lightBlue rounded-full cursor-pointer `}
                /> */}
                    <FaRegUserCircle color="#1e647a" size={23} />
                  </div>
                )}

                {/* USER NAME */}
                <div className="hidden ">
                  <p
                    className={`text-textColor text-xs text-start font-medium capitalize`}
                  >
                    {getFullName?.full_name}
                  </p>

                  {/* USER ROLE */}
                  <p
                    className={`text-lightGrayColor text-[10px] font-medium text-start `}
                  ></p>
                </div>
              </button>

              {/* DROPDOWN */}
              <div
                className={styles(
                  "absolute top-9 right-0 menu shadow bg-bgColor border rounded overflow-hidden p-0 m-0 w-[250px] 2xl:w-[300px] dropdown-container dropdownList",
                  { hidden: !dropdown }
                )}
              >
                {/* USER NAME AND ROLE */}
                {currentUser ? (
                  <div className="text-center flex flex-col border-b py-2 2xl:py-4 text-textColor capitalize text-sm 2xl:text-base">
                    {getFullName?.full_name}
                    <span className="lowercase text-xs 2xl:text-sm text-lightGrayColor">
                      {currentUser}
                    </span>
                  </div>
                ) : (
                  <></>
                )}
                {/* Dashboard */}
                <NavLink
                  className="border-b py-2 2xl:py-3 text-textColor text-[11px] 2xl:text-[13px] flex hover:bg-primaryColor hover:text-white rounded-none px-5 items-center gap-2"
                  to={URLDashboard()}
                  onClick={() => setDropDown(!dropdown)}
                >
                  {currentUser ? <RxDashboard /> : <BiLogIn />}{" "}
                  {currentUser ? "Dashboard" : "Login"}
                </NavLink>

                {/* LOGOUT */}
                {currentUser && (
                  <button
                    className="border-b py-2 w-full 2xl:py-3 text-textColor text-[11px] 2xl:text-[13px] flex hover:bg-primaryColor hover:text-white rounded-none px-5 items-center gap-2"
                    onClick={handleLogout}
                  >
                    <BiLogOut /> Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
