// react icons
import { RxCross1 } from "react-icons/rx";

type Props = {
  children: React.ReactNode;
  rightModalOpen: boolean;
  setRightModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleCloseModal: () => void;
};

const ModalRightToLeft = ({
  children,
  rightModalOpen,
  handleCloseModal,
}: Props) => {
  return (
    <div
      className="w-full flex items-center justify-center gap-[20px] fixed"
      style={{ zIndex: 999 }}
    >
      {/*  right modal  */}
      <div
        className={`${
          rightModalOpen ? " visible" : " invisible"
        } w-full h-screen fixed bg-[rgba(0,0,0,0.49)] top-0 left-0 z-50  transition-all duration-300`}
      >
        <div
          className={`${
            rightModalOpen
              ? " translate-x-[0px] opacity-100"
              : " translate-x-[100%] opacity-0"
          } zenUIRightModal w-[89%] h-screen bg-whiteColor transition-all duration-500 float-right modal-scrollable`}
        >
          <div className="w-full flex items-end px-4 justify-end p-2">
            <RxCross1
              className="p-2 w-fit text-[2rem] bg-gray-200 rounded-full transition-all duration-300 cursor-pointer"
              onClick={handleCloseModal}
            />
          </div>

          <div className="flex items-start flex-col px-5 justify-between gap-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRightToLeft;
