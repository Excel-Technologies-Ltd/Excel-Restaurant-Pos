// * Button Type
export interface ButtonProps {
    label: string;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: "submit" | "button" | "reset" | undefined;
  }
  