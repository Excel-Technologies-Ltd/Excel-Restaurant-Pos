import React, { useEffect, useState } from "react"; // Import React and hooks
import { IoChevronDown } from "react-icons/io5";

const Select: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [content, setContent] = useState<string>("Select Option"); 

  const optionArray: string[] = ["Football", "Cricket", "Tennis", "Badminton"];

  // Close the dropdown if clicked outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown")) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    // Attach event listener
    document.addEventListener("click", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <button
      className="bg-[#fff] border border-[#d1d1d1] rounded-xl w-[200px] justify-between px-3 py-2 flex items-center gap-8 relative cursor-pointer dropdown"
      onClick={() => setIsActive(!isActive)}
    >
      {content}
      <IoChevronDown
        className={`${
          isActive ? "rotate-[180deg]" : "rotate-0"
        } transition-all duration-300 text-[1.2rem]`}
      />
      <div
        className={`${
          isActive ? "opacity-100 scale-[1]" : "opacity-0 scale-[0.8]"
        } w-full absolute top-12 left-0 right-0 z-40 bg-[#fff] rounded-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          boxShadow: "0 15px 60px -15px rgba(0, 0, 0, 0.3)",
        }}
      >
        {optionArray.map((option, index) => (
          <p
            className="py-2 px-4 hover:bg-[#ececec] transition-all duration-200"
            key={index}
            onClick={(e) => {
              void e;
              setContent(option);
              setIsActive(false);
            }}
          >
            {option}
          </p>
        ))}
      </div>
    </button>
  );
};

export default Select;
