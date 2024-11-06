import { useRef, useState } from "react";
import ChartOption from "./charts/chart-option/ChartOption.js";
import LineChart from "./charts/chart-option/LineChart.js";
import { useFrappeAuth } from "frappe-react-sdk";

const Dashboard = () => {
  const { isLoading, currentUser } = useFrappeAuth();
  console.log(isLoading, currentUser);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="p-2">
      <div className="category">
        <div
          ref={scrollRef}
          className="rounded-md overflow-x-auto scrollbar-hide cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex gap-2 w-max justify-center items-center">
            {Array.from({ length: 14 }).map((_, index) => (
              <CategoryCard
                key={index}
                title={`Total Orders`}
                count={index + 13}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Highcharts */}
      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <div className="overflow-x-auto">
          <div className="min-w-[400px] max-w-full ">
            <LineChart />
          </div>
        </div>

        {/* Option Chart */}
        <div className="overflow-x-auto">
          <div className="min-w-[400px] max-w-full">
            <ChartOption />
          </div>
        </div>
      </div>

      {/* Calendar Chart */}
      {/* <div className="overflow-x-auto mt-5">
        <div className="min-w-[900px] max-w-full ">
          <CalendarChart />
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;

type TypeCategoryCard = {
  title: string;
  count?: number;
};

const CategoryCard = ({ title = "", count = 0 }: TypeCategoryCard) => {
  return (
    <div className="stats border select-none rounded-lg">
      <div className="px-3 py-2 flex items-center justify-between gap-4">
        <div className="">
          <div className="stat-title text-[15px] font-semibold text-gray-800">
            {title}
          </div>
          <div className="stat-desc">{`Category ${count}`}</div>
        </div>
        <div className="stat-value text-xs bg-primaryColor p-2 h-6 w-6 rounded-full text-white flex items-center justify-center">
          {count}
        </div>
      </div>
    </div>
  );
};
