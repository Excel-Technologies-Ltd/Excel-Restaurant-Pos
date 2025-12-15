import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk";
import { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import ChartOption from "./charts/chart-option/ChartOption.js";
import LineChart from "./charts/chart-option/LineChart.js";

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

  const { data: Last7DaysSales } = useFrappeGetCall("excel_restaurant_pos.api.item.get_last_seven_days_sales", {
    period: "weekly",
    item_count: 14,
  });

  const { data: dashboardCard } = useFrappeGetCall("excel_restaurant_pos.api.item.dashboard_data", );
  const { data: top5 } = useFrappeGetCall("excel_restaurant_pos.api.item.get_top_items_by_sales_period", );

  // Card Data set on useEffect
  const [cardData, setCardData] = useState<any[]>([]);

  useEffect(() => {
    // i need proper icon for each card match title
    setCardData([
    { title: "Chef Orders", count: dashboardCard?.message?.chef_orders_count, icon: <FaUser/>},
    { title: "Total Orders", count: dashboardCard?.message?.total_orders_count, icon: <FaUser/>},
    { title: "Canceled Orders", count: dashboardCard?.message?.canceled_orders_count, icon: <FaUser/>},
    { title: "Unpaid Orders", count: dashboardCard?.message?.unpaid_orders_count, icon: <FaUser/>},
    { title: "Top Monthly Item", count: dashboardCard?.message?.top_monthly_item, icon: <FaUser/>},
    { title: "Top Weekly Item", count: dashboardCard?.message?.top_weekly_item, icon: <FaUser/>},
    { title: "Top Yearly Item", count: dashboardCard?.message?.top_yearly_item, icon: <FaUser/>},
    { title: "Top Monthly Category", count: dashboardCard?.message?.top_monthly_category, icon: <FaUser/>},
    { title: "Top Weekly Category", count: dashboardCard?.message?.top_weekly_category, icon: <FaUser/>},
    { title: "Top Yearly Category", count: dashboardCard?.message?.top_yearly_category, icon: <FaUser/>}
])
}, [dashboardCard]);

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
            {cardData.map((item, index) => (
              <CategoryCard
                key={index}
                title={item?.title}
                count={item?.count}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card Data */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 px-0">
        {cardData.map((card, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 border">
                <div className="text-2xl text-gray-700">{card?.icon}</div>
                <div>
                    <h3 className="text-base font-semibold">{card?.title}</h3>
                    <p className="text-gray-600 text-sm mt-2">{card?.count}</p>
                </div>
            </div>
        ))}
        </div> */}

      {/* Highcharts */}
      <div className="grid lg:grid-cols-2 gap-4 mt-5">
        <div className="overflow-x-auto">
          <div className="min-w-[400px] max-w-full ">
            <LineChart chartData={Last7DaysSales} />
          </div>
        </div>

        {/* Option Chart */}
        <div className="overflow-x-auto">
          <div className="min-w-[400px] max-w-full">
            <ChartOption chartData={top5} />
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
          <div className="stat-desc text-gray-600">{`${count}`}</div>
        </div>
        <div className="stat-value text-xs bg-primaryColor p-2 h-6 w-6 rounded-full text-white flex items-center justify-center hidden">
          {count}
        </div>
      </div>
    </div>
  );
};
