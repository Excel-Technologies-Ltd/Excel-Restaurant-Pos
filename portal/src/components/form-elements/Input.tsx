/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { forwardRef } from "react";

// INPUT PROPS
type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  pattern?: "textOnly" | "numberOnly" | "float" | "username";
  type?: string;
  className?: string;
  placeholder?: string;
  max?: number;
  min?: number;
  numberOnly?: boolean;
  readOnly?: boolean;
  handleKeyUp?: () => void;
  parentClass?: string;
  isReadOnly?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
};

// input component
const Input = forwardRef<HTMLInputElement, Props>((props: Props, ref) => {
  const {
    value,
    onChange,
    name,
    label,
    required,
    errMsg,
    disabled,
    type = "text",
    className,
    placeholder,
    max,
    min,
    readOnly = false,
    handleKeyUp,
    parentClass,
    isReadOnly = false,
    onClick,
    onFocus
  } = props;

  return (
    <div
      className={`flex flex-col w-full items-start justify-start ${parentClass}`}
    >
      {/* LABEL WITH REQUIRED STAR */}
      {label && (
        <div className="flex w-full">
          <div className="input_label">{label}</div>
          {required && <span className="input_required">*</span>}
        </div>
      )}

      {/* INPUT BOX */}
      <input
        type={type}
        className={`custom_input ${
          disabled && "disabled_bg placeholder:!text-grayColor"
        } ${className}`}
        value={value}
        name={name}
        onClick={onClick}
        readOnly={readOnly || isReadOnly}
        onChange={onChange}
        disabled={disabled}
        maxLength={max || 250}
        onKeyUp={handleKeyUp}
        placeholder={`${placeholder ? placeholder : "Enter " + label}`}
        ref={ref}
        min={min}
        onFocus={onFocus}
      />

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error  ">{errMsg}!</span>}
    </div>
  );
});

export default Input;

export const CartError = ({ errMsg }: { errMsg: string }) => {
  return errMsg && <span className="input_error  ">{errMsg}</span>;
};
