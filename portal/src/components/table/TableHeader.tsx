/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "../../utilities/cn";

// table header data type
export type HeaderData = {
  isAction?: boolean;
  heading: string | JSX.Element;
  w: string;
  sortIcon?: boolean;
};

// Table Header component props
export type TableHeaderPropType = {
  data: HeaderData[];
  className?: string;
};

// Table Header component
function TableHeader({ data, className = "" }: TableHeaderPropType) {
  const totalItems = data?.length;
  const defaultWidth = `${100 / totalItems}%`;

  return (
    <div
      className={styles(
        "flex justify-between px-6 h-full border-b border-borderColor py-[6px] bg-grayTextColor text-white",
        className
      )}
    >
      {/* HEADER TITLES */}
      {data?.map((item, index) => (
        <p
          className={styles(
            "p-2 py-2.5 text-[12px] 2xl:text-[14px] font-semibold text-start",
            { "sticky right-0 bg-grayTextColor h-full": item?.isAction },
            { "py-[18px]": item?.heading === "" }
            // { "odd:bg-borderColor": rowColor }
          )}
          key={index}
          style={{ width: item?.w || defaultWidth }}
        >
          {item?.heading}
        </p>
      ))}
    </div>
  );
}

export default TableHeader;
