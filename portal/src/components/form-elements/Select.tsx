/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";
import { styles } from "../../utilities/cn";

// select input props
type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onChange?: any;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: number | string;
  selectShow?: string | JSX.Element;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
  isHideSelect?: boolean;
  isReadOnly?: boolean;
};

// Select input component
function Select({
  value,
  onChange,
  name,
  label,
  required,
  errMsg,
  selectShow = "--Select--",
  isHideSelect,
  disabled,
  className = "",
  placeholder,
  children,
  isReadOnly = false,
}: Props) {
  const emptyValue = value === "" || value === "0";
  return (
    <div className="flex flex-col w-full items-start justify-start relative appearance-class">
      {/* LABEL WITH REQUIRED STAR */}
      {(label || required) && (
        <div className="flex w-full">
          {label && <div className="input_label"> {label}</div>}
          {required && <span className="input_required">*</span>}
        </div>
      )}

      {/* SELECT INPUT */}
      <select
        readOnly={isReadOnly}
        className={styles(
          `custom_input appearance-none`,
          { "disabled_bg placeholder:!text-grayColor": disabled },
          // { default_option: emptyValue },
          className
        )}
        // className={`custom_input appearance-none ${
        //   disabled && "disabled_bg placeholder:!text-grayColor"
        // } ${emptyValue && "default_option"} ${className}`}
        value={value}
        name={name}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        onChange={onChange}
        disabled={disabled}
        placeholder={`${placeholder ? placeholder : "Enter" + " " + label}`}
      >
        {!isHideSelect && (
          <option value="" className="!text-textColor">
            {selectShow}
          </option>
        )}

        {children}
      </select>

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error">{errMsg}!</span>}
    </div>
  );
}

export default Select;
