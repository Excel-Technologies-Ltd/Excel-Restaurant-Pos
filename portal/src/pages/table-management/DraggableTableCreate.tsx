import { useFrappeGetDocList } from "frappe-react-sdk";
import Input from "../../components/form-elements/Input";
import Select from "../../components/form-elements/Select";
import { RestaurantTable, TableType } from "../../types/ExcelRestaurantPos/RestaurantTable";



interface DraggableTableCreateProps {
  newTableData: RestaurantTable;
  setNewTableData: React.Dispatch<React.SetStateAction<RestaurantTable>>;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createTable: () => void; // This can also be more specific if it has parameters
}

// * DraggableTableCreate component
const DraggableTableCreate = ({
  newTableData,
  setNewTableData,
  setIsCreateModalOpen,
  createTable,
}: DraggableTableCreateProps) => {



  const { data: floors } = useFrappeGetDocList("Restaurant Floor");
  console.log(newTableData);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-5"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-full xsm:min-w-[400px]">
        <h2 className="text-xl mb-4 font-semibold">
          {newTableData.type
            ? `Create ${newTableData.type} ${newTableData.type === "Road" ? "" : "table"
            }`
            : "Create table"}
        </h2>
        <div className="space-y-3">
          <Select
          
            onChange={(e) => {
              
              setNewTableData({
                ...newTableData,
                type: e.target.value as TableType,
              });
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
            <option value="Rectangle">Rectangle</option>
            <option value="Circle">Circle</option>
            <option value="Road">Road</option>
          </Select>

          <Select label="Floor" value={newTableData.restaurant_floor} onChange={(e) => {
            setNewTableData({
              ...newTableData,
              restaurant_floor: e.target.value,
            });
          }}
          >
            {floors?.map((floor) => (
              <option value={floor.name}>{floor.name}</option>
            ))}
          </Select>

          <Input
            label="Table No"
            value={newTableData.table_no}
            onChange={(e) =>
              setNewTableData({
                ...newTableData,
                table_no: e.target.value,
              })
            }
          />
          <Input
            label="Seat"
            value={newTableData.seat}
            onChange={(e) =>
              setNewTableData({
                ...newTableData,
                seat: e.target.value,
              })
            }
          />

          <div className="block mb-2">
            Background Color:
            <input
              type="color"
              className="w-full mt-1"
              value={newTableData.bg_color}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  bg_color: e.target.value,
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
