import { useFrappeGetDocList } from "frappe-react-sdk";
import Input from "../../components/form-elements/Input";
import Select from "../../components/form-elements/Select";
import { RestaurantTable, TableType } from "../../types/ExcelRestaurantPos/RestaurantTable";


interface DraggableTableEditProps {
  newTableData: RestaurantTable; // The current table data being edited
  setNewTableData: React.Dispatch<React.SetStateAction<RestaurantTable>>; // Function to update table data
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Function to open/close the edit modal
  saveEdit: () => void; // Function to save the edited table data
}

const DraggableTableEdit = ({
  newTableData,
  setNewTableData,
  setIsEditModalOpen,
  saveEdit,
}: DraggableTableEditProps) => {

  const { data: floors } = useFrappeGetDocList("Restaurant Floor");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white w-full max-w-[400px] p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Table</h2>
        <div className="w-full grid gap-3">
          <Select
            value={newTableData.type}
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
                  type: e.target.value as TableType,
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
          disabled
          >
            {floors?.map((floor) => (
              <option value={floor.name}>{floor.name}</option>
            ))}
          </Select>
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
              className="cursor-pointer w-full mt-2"
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
            onClick={() => setIsEditModalOpen(false)}
            className="mr-2 cancel_btn"
          >
            Cancel
          </button>
          <button onClick={saveEdit} className="main_btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableTableEdit;
