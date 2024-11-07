import { useFrappeGetDocList } from "frappe-react-sdk";
import Input from "../../components/form-elements/Input";
import Select from "../../components/form-elements/Select";
import { RestaurantTable } from "../../types/ExcelRestaurantPos/RestaurantTable";

// Define the type for the table data
// interface NewTableData {
//   tableNo: string;
//   seat: string; // Adjust type if seat count is numeric
//   bgColor: string; // Assume this is a hex color string
// }

// Define the props for the DraggableTableCreate component
interface DraggableTableCreateProps {
  newTableData: RestaurantTable;
  setNewTableData: React.Dispatch<React.SetStateAction<RestaurantTable>>;
  newTableShape: "rectangle" | "circle" | "road"; // or 'square' if needed
  setNewTableShape: React.Dispatch<
    React.SetStateAction<"rectangle" | "circle" | "road">
  >;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createTable: () => void; // This can also be more specific if it has parameters
}

const DraggableTableCreate = ({
  newTableData,
  setNewTableData,
  newTableShape,
  setNewTableShape,
  setIsCreateModalOpen,
  createTable,
}: DraggableTableCreateProps) => {

  const { data: floors } = useFrappeGetDocList("Restaurant Floor");
  const { data: company } = useFrappeGetDocList("Company")

  console.log("new ", newTableData);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-5"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-full xsm:min-w-[400px]">
        <h2 className="text-xl mb-4 font-semibold">
          {newTableShape
            ? `Create ${newTableShape} ${newTableShape === "road" ? "" : "table"
            }`
            : "Create table"}
        </h2>
        <div className="space-y-3">
          <Select
            value={newTableData.type}
            onChange={(e) => {
              // setNewTableShape(
              //   e.target.value as "Rectangle" | "Circle" | "Road"
              // );
              if (e.target.value === "Road") {
                setNewTableData({
                  ...newTableData,
                  bg_color: "#BFBFBF",
                });
              } else {
                setNewTableData({
                  ...newTableData,
                  bg_color: "#155e75",
                });
              }
            }}
            className="md:text-sm"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="road">Road</option>
          </Select>

          <Select label="Floor">
            {floors?.map((floor) => (
              <option value={floor.name}>{floor.name}</option>
            ))}
          </Select>

          <Input
            label="Table No"
            value={newTableData.tableNo}
            onChange={(e) =>
              setNewTableData({
                ...newTableData,
                tableNo: e.target.value,
              })
            }
          />
          <Input
            label="Seat"
            value={newTableData.seat}
            onChange={(e) =>
              setNewTableData({ ...newTableData, seat: e.target.value })
            }
          />

          <div className="block mb-2">
            Background Color:
            <input
              type="color"
              className="w-full mt-1"
              value={newTableData.bgColor}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  bgColor: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="mr-2 cancel_btn"
          >
            Cancel
          </button>
          <button onClick={createTable} className="main_btn">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableTableCreate;
