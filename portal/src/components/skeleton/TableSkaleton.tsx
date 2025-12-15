type Props = {};

const TableSkaleton = ({}: Props) => {
  return (
    <div className="grid gap-2 mt-2">
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <div className="flex justify-between gap-2">
        <div className="h-[20px] w-full max-w-40 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-[20px] w-full max-w-60 rounded bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  );
};

export default TableSkaleton;

const RowSkeleton = () => {
  return (
    <div className="h-[20px] w-full rounded bg-gray-200 animate-pulse"></div>
  );
};