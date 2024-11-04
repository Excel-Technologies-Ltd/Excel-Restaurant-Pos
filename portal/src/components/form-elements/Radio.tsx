/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { ChangeEvent } from "react";

// radio components props
type Props = {
  value?: string | number | boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  max?: number;
  checked?: boolean;
  readOnly?: boolean;
};

// Radio component
function Radio({
  onChange,
  name,
  label,
  required,
  errMsg,
  className,
  value,
  checked,
}: Props) {
  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex">
        {required && <span className="input_required">*</span>}
      </div>
      <label className="input_label flex justify-center items-start xl:items-center gap-2">
        {/* RADIO INPUT */}
        <input
          type="radio"
          name={name}
          checked={checked}
          id={name}
          onChange={onChange}
          className={`border-gray-300 rounded-full h-3 2xl:h-4 w-3 2xl:w-4 ${className}`}
          value={value?.toString()}
        />
        {label}
      </label>

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error ">{errMsg}</span>}
    </div>
  );
}

export default Radio;
