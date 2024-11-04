import { ButtonProps } from "../../interface";
import { styles } from "../../utilities/cn";




function Button({
    label,
    disabled,
    isLoading,
    onClick,
    type = "button",
    className = "",
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={isLoading || disabled}
            className={styles(
                "bg-primaryColor py-2 xlg:py-3 px-3 xlg:px-4 !text-white text-[14px] xlg:text-[16px] font-[500] xmd:font-bold rounded active:scale-[0.95]",
                className,
                { "bg-gray-500 cursor-not-allowed": disabled }
            )}
        >
            {isLoading ? "Loading..." : label || "--"}
        </button>
    );
}

export default Button;
