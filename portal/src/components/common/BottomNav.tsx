import { useState } from "react";
import { BsCartCheck } from "react-icons/bs";
import { FiHome } from "react-icons/fi";
import { TbReportSearch } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { useCartContext } from "../../context/cartContext";
import { URLItems } from "../../routes/routes-link";
import { styles } from "../../utilities/cn";
import CheckoutPopup from "../alert/CheckoutPopup";
import AllCarts from "../itemspage/AllCarts";

const BottomNav = ({ className }: { className?: string }) => {
  const [showCart, setShowCart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { cartCount } = useCartContext();

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div
        className={`bg-gray flex py-2 justify-evenly px-0 sm:px-24 sm:justify-between items-center gap-2 bottom_nav p-2 pb-5 pt-5 ${className}`}
      >
        <NavLink
          to={"/"}
          className="flex flex-col p-2 justify-center items-center cursor-pointer"
        >
          <FiHome size={15} />
          <p className="text-xs text-gray-light">Home</p>
        </NavLink>
        <NavLink
          to={URLItems()}
          className="flex flex-col justify-center items-center p-2 cursor-pointer"
        >
          <TbReportSearch size={15} />
          <p className="text-xs text-gray-light">All</p>
        </NavLink>
        <div className="relative">
          <button
            onClick={() => {
              setShowCart(true);
            }}
            className={`flex flex-col justify-center items-center p-2 cursor-pointer ${
              showCart ? "active" : ""
            }`}
          >
            <BsCartCheck size={15} />
            <p className="text-xs text-gray-light">Cart</p>
            <div
              className={styles(
                "absolute top-0 right-0 h-4 w-4 bg-primaryColor rounded-full flex justify-center items-center text-white text-xs",
                { "top-1 right-3": showCart }
              )}
            >
              {cartCount}
            </div>
          </button>
        </div>
      </div>
      {showCart && (
        <AllCarts
          isOpen={showCart}
          toggleDrawer={() => setShowCart(false)}
          setShowPopup={setShowPopup}
        />
      )}
      {showPopup && <CheckoutPopup handleClosePopup={handleClosePopup} />}
    </>
  );
};

export default BottomNav;
