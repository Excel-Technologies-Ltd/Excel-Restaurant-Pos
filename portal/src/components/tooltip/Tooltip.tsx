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
const Tooltip = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="group inline-block relative cursor-pointer "
      style={{ zIndex: 99999999 }}
    >
      <div className="absolute hidden group-hover:block left-full pr-0.5 whitespace-nowrap top-1/2 pl-1">
        <div className="flex flex-row-reverse items-center -translate-y-1/2">
          <div className="bg-borderColor shadow-md text-textColor rounded-lg py-1 px-3 cursor-default text-sm">
            {title}
          </div>
          <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-r-[8px] border-t-transparent border-b-transparent border-r-borderColor -mr-[1px] z-50"></div>
        </div>
      </div>
      <span className="font-semibold text-lg">{children}</span>
    </div>
  );
};

export default Tooltip;
