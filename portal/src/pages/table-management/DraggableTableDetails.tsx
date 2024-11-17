import { styles } from "../../utilities/cn";
import { RestaurantTable } from "../../types/ExcelRestaurantPos/RestaurantTable";

interface DraggableTableDetailsProps {
  setIsDetailsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTable: RestaurantTable;
}

const DraggableTableDetails = ({
  setIsDetailsModalOpen,
  selectedTable,
}: DraggableTableDetailsProps) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[500px]">
        <h2 className="text-lg font-semibold mb-4">Table Details</h2>
        <div className="space-y-2 ">
          <RowData
            title="Table No"
            value={selectedTable.table_no ? selectedTable.table_no.toString() : "--"}
          />
          <RowData title="Seat" value={selectedTable.seat + " Seats"} />
          <RowData
            title="Shape"
            value={selectedTable.type ? selectedTable.type : "--"}
            valueClass="capitalize"
          />
          <div className="flex">
            <h2 className="w-40 font-semibold text-sm">Background Color</h2>
            <div
              className={styles(
                `w-10 h-4 rounded bg-[${selectedTable?.bg_color}]`
              )}
            ></div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsDetailsModalOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableTableDetails;

const RowData = ({ title = "", value = "", valueClass = "" }) => {
  return (
    <div className="flex">
      <h2 className="w-40 font-semibold text-sm">{title}</h2>
      <h2 className={styles("text-sm", valueClass)}>{value}</h2>
    </div>
  );
};
