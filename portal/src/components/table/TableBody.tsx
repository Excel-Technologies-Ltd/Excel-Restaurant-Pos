/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "../../utilities/cn";

// Table Body data Type
type BodyData = {
  value: string | number | JSX.Element;
  w: string;
  dataClass?: string;
  isAction?: boolean;
};

// Table Body component props
type TableBodyPropType = {
  index: number;
  className?: string;
  rowColor?: string | boolean;
  data: BodyData[];
};

// Table Body component
function TableBody({
  data,
  index,
  className = "",
  rowColor = "",
}: TableBodyPropType) {
  const totalItems = data.length;
  const defaultWidth = `${100 / totalItems}%`;

  return (
    <div
      key={index}
      className={styles(
        `flex justify-between items-center px-6 h-full border-b border-borderColor bg-white last:border-none`,
        { "odd:bg-borderColor": rowColor },
        className
      )}
    >
      {/* BODY ITEM */}
      {data?.map((data, i) => (
        <div
          className={styles(
            "p-2 text-textColor text-[11px] 2xl:text-[13px] ",
            data?.dataClass ? data?.dataClass : "",
            { "sticky right-0 bg-white h-full": data?.isAction },
            { "odd:bg-borderColor": rowColor }
          )}
          style={{ width: data.w || defaultWidth }}
          key={i}
        >
          {/* TITLE */}
          <div className="flex flex-col">
            <div className="text-[11px] 2xl:text-[13px] text-grayColor font-normal">
              {data?.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableBody;
