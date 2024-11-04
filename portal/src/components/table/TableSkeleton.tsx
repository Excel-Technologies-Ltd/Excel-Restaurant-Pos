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
  heading: string | JSX.Element;
  w: string;
  sortIcon?: boolean;
};

// Table Header component props
export type TableHeaderPropType = {
  data: HeaderData[];
  className?: string;
  length?: number[];
};

// Table Header component
function TableSkeleton({
  data,
  className = "",
  length = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}: TableHeaderPropType) {
  const totalItems = data.length;
  const defaultWidth = `${100 / totalItems}%`;

  return (
    <>
      {length?.map((_, i) => (
        <div
          key={i}
          className={styles(
            "flex justify-between px-6 h-full border-b border-borderColor py-[6px]",
            className
          )}
        >
          {/* HEADER TITLES */}
          {data?.map((item, index) => (
            <div
              className="p-2 py-2.5 text-[12px] 2xl:text-[14px] font-semibold text-start"
              key={index}
              style={{ width: item.w || defaultWidth }}
            >
              <div className="animate-pulse h-4  bg-gradient-to-br from-gray-300 to-gray-200 rounded-full mb-2"></div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default TableSkeleton;
