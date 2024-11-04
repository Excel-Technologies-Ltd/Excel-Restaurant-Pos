/*
 * Created by: Max
 * Date created: 10.01.2024
 * Modified by: Max
 * Last modified: 05.02.2024
 * Reviewed by:
 * Date Reviewed:
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { styles } from "../../utilities/cn";

type Props = {
  data: Data[];
  buttonTitle: React.ReactNode;
  titleClass?: string;
  itemClass?: string;
  boxClass?: string;
  id?: string;
  isItemTop?: string;
};

type Data = {
  link?: string;
  button?: () => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};
/**
 * @description Notification dropdown component
 */
const Dropdown = ({
  data,
  buttonTitle,
  titleClass = "",
  itemClass = "",
  boxClass = "",
  isItemTop = "right-0 bottom-10",
  id = "",
}: Props) => {
  // notification open state
  const [open, setOpen] = useState(false);

  // handle open notification
  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  // handle open notification
  const handleButton = (data: any) => {
    data();
    setOpen((prev) => !prev);
  };

  // handle open notification
  const handleLink = () => {
    setOpen((prev) => !prev);
  };

  const dropdown = id?.split(" ");
  const dropdownId = dropdown?.[0] + dropdown[1] + id;

  // handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement; // Explicitly type event.target as HTMLElement
      if (
        open !== false &&
        !target.closest(`.dropdown-container${dropdownId}`)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const localItemClass =
    " text-start border-b border-borderColor hover:bg-borderColor flex items-center justify-start gap-2 text-[11px] 2xl:text-[13px] px-4 py-[9px] 2xl:py-[11px]";
  const boxStyle = isItemTop ? isItemTop : "right-0 top-10";

  return (
    <div className="flex-none gap-2">
      <div className=" relative w-fit">
        <div
          role="button"
          className={styles(
            `bg-white w-fit min-w-24 rounded-lg text-[11px] 2xl:text-[13px] px-4 py-[9px] 2xl:py-[11px] dropdown-container${dropdownId}`,
            titleClass
          )}
          onClick={handleOpen}
        >
          <div>{buttonTitle}</div>
        </div>
        {open && (
          <ul
            className={styles(
              `absolute z-50 shadow menu menu-sm bg-base-100 rounded-md w-fit min-w-40 bg-white text-textColor overflow-y-auto dropdown-container${dropdownId}`,
              boxStyle,
              boxClass
            )}
          >
            <div className=" max-h-[400px] flex flex-col">
              {data?.length == 0 && <div className="p-3">Items not found</div>}

              {data?.map((item, index) => {
                if (item?.disabled) {
                  return (
                    <button
                      key={index}
                      type="button"
                      className={styles(
                        "bg-borderColor cursor-not-allowed whitespace-nowrap",
                        localItemClass,
                        itemClass,
                        item?.className ? item?.className : ""
                      )}
                    >
                      {item?.icon}
                      {item?.label}
                    </button>
                  );
                }
                if (item?.link) {
                  return (
                    <Link
                      key={index}
                      onClick={handleLink}
                      to={item?.link}
                      className={styles(
                        "whitespace-nowrap",
                        localItemClass,
                        itemClass,
                        item?.className ? item?.className : ""
                      )}
                    >
                      {item?.icon}
                      {item?.label}
                    </Link>
                  );
                }
                if (item?.button) {
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleButton(item?.button);
                      }}
                      type="button"
                      className={styles(
                        "whitespace-nowrap",
                        localItemClass,
                        itemClass,
                        item?.className ? item?.className : ""
                      )}
                    >
                      {item?.icon}
                      {item?.label}
                    </button>
                  );
                }
              })}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
