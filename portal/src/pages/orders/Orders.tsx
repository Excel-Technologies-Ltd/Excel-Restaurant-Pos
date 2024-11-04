import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Dropdown from "../../components/dropdown/Dropdoun";
import Table from "../../components/table/Table";
import TableBody from "../../components/table/TableBody";
import TableHeader from "../../components/table/TableHeader";
import { items } from "../../data/items";
import { styles } from "../../utilities/cn";

type Props = {};

const Orders = ({}: Props) => {
  console.log({ items });
  return (
    <div className="p-4">
      <Table className="min-w-[920px] bg-white">
        <TableHeader data={tableData()} />
        {items?.slice(0, 3)?.map((item, index) => {
          return <TableBody data={tableData(item)} key={index} index={index} />;
        })}
      </Table>
    </div>
  );
};

export default Orders;

const tableData = (item?: any) => [
  {
    heading: "Name",
    value: <>{item?.name || "--"}</>,
    w: "170px",
  },
  {
    heading: "Description",
    value: item?.description || "--",
    w: "250px",
  },
  {
    heading: "Price",
    value: "৳ " + item?.sellPrice || "--",
    w: "",
  },
  {
    heading: "Quantity",
    value: item?.quantity || "1",
    w: "",
  },
  {
    heading: "TotalPrice",
    value: "৳ " + item?.sellPrice || "--",
    w: "",
  },
  {
    heading: "Status",
    value: (
      <div>
        <select
          className={styles("border rounded-md p-1 focus:outline-none", {
            "border-green-500 bg-green-500": item?.status === "served",
          })}
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Served</option>
        </select>
      </div>
    ),
    w: "",
  },
  {
    heading: "",
    value: (
      <div className="flex gap-2 ">
        <Dropdown
          buttonTitle={<HiOutlineDotsVertical size={18} />}
          titleClass={styles("min-w-fit px-2 py-[5px] 2xl:py-[9px]")}
          id={String(item?.id)}
          isItemTop="right-8 -bottom-2"
          itemClass="py-[7px] 2xl:py-[7px]"
          data={[
            {
              label: "Edit",
              button: () => {},
              icon: <FiEdit className="" />,
            },
            {
              label: "Delete",
              button: () => {},
              icon: <AiOutlineDelete />,
              className: "text-redColor border-b-0",
            },
          ]}
        />
      </div>
    ),
    w: "50px",
    isAction: true,
  },
];
