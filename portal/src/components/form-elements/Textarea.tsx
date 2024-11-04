/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void | undefined;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  max?: number;
  isReadOnly?: boolean;
};

// Textarea input component
function Textarea({
  value,
  onChange,
  name,
  label,
  required,
  errMsg,
  disabled,
  className,
  placeholder,
  max = 1000,
  isReadOnly = false,
}: // numberOnly,
Props) {
  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex w-full">
        {label && <div className="input_label"> {label}</div>}
        {required && <span className="input_required">*</span>}
      </div>

      {/* TEXTAREA BOx */}
      <textarea
        className={`custom_input ${
          disabled && "disabled_bg  placeholder:!text-grayColor "
        } ${className}`}
        value={value}
        name={name}
        onChange={onChange}
        disabled={disabled}
        maxLength={max}
        placeholder={`${placeholder ? placeholder : "Enter " + label}`}
        readOnly={isReadOnly}
      />

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error">{errMsg}!</span>}
    </div>
  );
}

export default Textarea;
