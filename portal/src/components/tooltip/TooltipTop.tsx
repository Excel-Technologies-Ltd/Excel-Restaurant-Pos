/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

// Tooltip component
const TooltipTop = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="group inline-block relative cursor-pointer max-w-fit min-w-fit z-50">
      <div className="absolute hidden group-hover:block pr-0.5 whitespace-nowrap top-1 w-full">
        <div className="flex flex-col justify-start items-center -translate-y-full">
          <div className="bg-borderColor shadow-md text-textColor rounded-lg py-1 px-3 cursor-default text-base">
            {title}
          </div>
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[8px] border-l-transparent border-r-transparent border-t-borderColor -mt-[1px]"></div>
        </div>
      </div>
      {/* <span className="font-semibold text-lg">{children}</span> */}
      <>{children}</>
    </div>
  );
};

export default TooltipTop;
