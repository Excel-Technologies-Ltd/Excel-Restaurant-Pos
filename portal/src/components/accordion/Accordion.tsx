import { MdKeyboardArrowRight } from "react-icons/md";

type Props = {
  children: React.ReactNode;
  title: string;
  isAccordion?: boolean;
};

const Accordion = ({ children, title = "", isAccordion = false }: Props) => {
  if (isAccordion) {
    return (
      <details className="rounded-md">
        <summary className="flex justify-between transition cursor-pointer font-medium  p-2 rounded-md">
          <div className="block">
            <div className="flex"></div>
            <p className="font-semibold ps-1 text-xs">{title}</p>
          </div>
          <MdKeyboardArrowRight className="icon text-sm" />
        </summary>
        <div className="pt-2 px-4">{children}</div>
      </details>
    );
  } else {
    return <div>{children}</div>;
  }
};

export default Accordion;
