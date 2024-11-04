/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "../../utilities/cn";

// Checkbox component props
type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  marginTop?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClass?: string;
  placeholder?: string;
  max?: number;
  checked?: boolean;
};

// Checkbox component
function Checkbox({
  onChange,
  name,
  label,
  required = false,
  className,
  labelClass = "",
  checked,
  marginTop,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col w-full items-start justify-start ">
      <div className="flex"></div>
      <label
        className={`flex justify-center items-center  gap-2 ${
          marginTop && marginTop
        } `}
      >
        {/* INPUT BOX */}
        <input
          type="checkbox"
          name={name}
          checked={checked}
          id={name}
          onChange={onChange}
          disabled={disabled}
          className={`accent-violetColor border-borderColor active:outline-none active:shadow-none rounded-sm h-3 2xl:h-4 w-3 2xl:w-4 focus:shadow-none outline-none focus:outline-none focus:ring-0 focus:border focus:border-violetColor ${className}`}
        />

        {/* LABEL */}
        <p className={styles("input_label mb-0", labelClass)}>{label}</p>
        {required && <span className="-mt-[6px] text-dangerColor">*</span>}
      </label>
    </div>
  );
}

export default Checkbox;
