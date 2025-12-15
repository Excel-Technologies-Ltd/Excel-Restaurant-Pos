import { RxCross1 } from "react-icons/rx";

type Props = {
  children: React.ReactNode;
  rightModalOpen: boolean;
  handleCloseModal: () => void;
};

const ModalRightToLeft = ({
  children,
  rightModalOpen,
  handleCloseModal,
}: Props) => {
  const params = new URLSearchParams(window.location.search);

  const tableIdFromQuery = params.get("table_id") || "";

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-end transition-all duration-500 ${
        rightModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      style={{ zIndex: 998 }}
    >
      <div
        className={`bg-white sm:rounded-l-2xl shadow-lg w-full sm:w-[89%] h-full overflow-hidden transform transition-transform duration-500 ${
          rightModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="w-full flex justify-between py-4 px-8 border-b">
          <h2 className="text-lg font-semibold">From {tableIdFromQuery}</h2>
          <RxCross1
            className="text-xl text-gray-500 cursor-pointer hover:text-red-700 transition mt-1"
            onClick={handleCloseModal}
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default ModalRightToLeft;



// <div
    //   className="w-full flex items-center justify-center gap-[20px] fixed "
    //   style={{ zIndex: 999 }}
    // >
    //   {/*  right modal  */}
      // <div
      //   className={`${
      //     rightModalOpen ? " visible" : " invisible"
      //   } w-full h-screen fixed bg-[rgba(0,0,0,0.49)] top-0 left-0 z-50  transition-all duration-300`}
      // >
      //   <div
      //     className={`${
      //       rightModalOpen
      //         ? " translate-x-[0px] opacity-100"
      //         : " translate-x-[100%] opacity-0"
      //     } zenUIRightModal w-[89%] h-screen bg-whiteColor transition-all duration-500 float-right modal-scrollable`}
      //   >
      //     <div className="w-full flex items-end px-4 justify-end p-2">
      //       <RxCross1
      //         className="p-2 w-fit text-[2rem] bg-gray-200 rounded-full transition-all duration-300 cursor-pointer"
      //         onClick={handleCloseModal}
      //       />
      //     </div>

    //       <div className="flex items-start flex-col px-5 justify-between gap-8">
    //         {children}
    //       </div>
    //     </div>
    //   </div>
    // </div>