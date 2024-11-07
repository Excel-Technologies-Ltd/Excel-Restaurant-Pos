/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { HiOutlineLockClosed } from "react-icons/hi";

// password component props
type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label: string;
  required?: boolean;
  errMsg?: string;
  strengthMsg?: React.ReactNode;
  disabled?: boolean;
  pattern?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  max?: number;
};

// password component
function Password({
  value,
  onChange,
  name,
  label,
  required,
  errMsg,
  strengthMsg,
  disabled,
  pattern,
  type,
  className,
  placeholder,
  max,
}: Props) {
  // password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex">
        <div className="input_label font-bold">{label}</div>
        {required && <span className="input_required">*</span>}
      </div>

      {/* PASSWORD INPUT BOX  */}
      <div className="relative w-full">
        <input
          type={showPassword ? type : "password"}
          className={`custom_input ps-9 ${disabled && "disabled_bg"
            } ${className}`}
          value={value}
          name={name}
          onChange={onChange}
          disabled={disabled}
          pattern={pattern}
          maxLength={max || 36}
          placeholder={`${placeholder ? placeholder : ""}`}
        />

        {/* ICON */}
        <div className="absolute left-3 top-1/2 text-base transform -translate-y-1/2 text-blueColor">
          <HiOutlineLockClosed
            size={17}
            className="text-xl text-loyalBlueColor font-medium"
          />
        </div>

        {/* VISIBILITY TOGGLER */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-5 top-1/2 text-base transform -translate-y-1/2 cursor-pointer dark:text-gray-500"
        >
          {showPassword ? (
            <FiEyeOff size={15} className="text-xl text-grayTextColor" />
          ) : (
            <FiEye size={15} className="text-xl text-grayTextColor" />
          )}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      <div className="flex justify-between w-full">
        {errMsg && <span className="input_error">{errMsg}!</span>}
        {strengthMsg && <>{strengthMsg}</>}
      </div>
    </div>
  );
}

export default Password;
