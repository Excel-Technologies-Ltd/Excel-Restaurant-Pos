type Props = {
  title?: string;
};

const NotFound = ({ title = "Data not found" }: Props) => {
  return (
    <div className="text-gray-500 text-sm h-20 flex items-center">
      {title}
    </div>
  );
};

export default NotFound;