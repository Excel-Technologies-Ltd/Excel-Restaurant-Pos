import * as ReactDOM from "react-dom";
import { CgDanger } from "react-icons/cg";
import { GoInfo } from "react-icons/go";
import { IoIosWarning } from "react-icons/io";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const confirmRoot = document.createElement("div");
const body = document.querySelector("body");
body?.appendChild(confirmRoot);

interface Props {
  title?: string;
  text: string;
  options?: {
    falseButtonText?: string;
    trueButtonText?: string;
  };
  icon?: "cross" | "danger" | "warning" | "success" | "info";
}

interface ConfirmDialogProps {
  title?: string;
  text: string;
  options?: {
    falseButtonText?: string;
    trueButtonText?: string;
  };
  icon?: "cross" | "danger" | "warning" | "success" | "info";
  giveAnswer: (answer: boolean) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
function ConfirmDialog({
  title = "Delete Confirmation",
  text = "Are you sure you want to delete this user?",
  giveAnswer,
  options,
  icon = "warning",
}: ConfirmDialogProps) {
  const iconMap = {
    danger: <CgDanger className="text-4xl text-redColor" />,
    warning: <IoIosWarning className="text-4xl text-redColor" />,
    success: <IoCheckmarkSharp className="text-5xl text-greenColor" />,
    info: <GoInfo className="text-4xl text-cyanColor" />,
    cross: <RxCross2 className="text-4xl text-redColor" />,
  };

  const mainIcon = iconMap[icon] || (
    <RxCross2 className="text-4xl text-redColor" />
  );
  return (
    <div className="fixed inset-0 flex items-center justify-center px-3 z-50">
      <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg z-50 max-w-lg w-full relative grid justify-center">
        <div className="absolute h-20 w-20 rounded-full bg-white shadow z-50 -top-10 left-1/2 transform -translate-x-1/2  flex justify-center items-center">
          {mainIcon}
        </div>
        <div className="p-6 mt-7">
          <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
          <h3 className="text-textColor mb-6 text-center text-base">{text}</h3>
          <div className="flex justify-center space-x-4">
            <button className="main_btn" onClick={() => giveAnswer(true)}>
              {options?.trueButtonText ? options?.trueButtonText : "Confirm"}
            </button>
            <button className="back_btn" onClick={() => giveAnswer(false)}>
              {options?.falseButtonText ? options?.falseButtonText : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const customConfirm = ({
  text,
  title,
  options,
  icon,
}: Props): Promise<boolean> =>
  new Promise((res) => {
    const giveAnswer = (answer: boolean) => {
      ReactDOM.unmountComponentAtNode(confirmRoot);
      res(answer);
    };

    ReactDOM.render(
      <ConfirmDialog
        title={title}
        text={text}
        giveAnswer={giveAnswer}
        options={options}
        icon={icon}
      />,
      confirmRoot
    );
  });
