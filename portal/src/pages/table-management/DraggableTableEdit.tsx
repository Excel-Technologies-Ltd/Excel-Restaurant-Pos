interface TableData {
  tableNo: string; // Assuming tableNo is a string
  seat: string; // Assuming seat is a string
  bgColor: string; // Assuming bgColor is a string representing a color
}

interface DraggableTableEditProps {
  newTableData: TableData; // The current table data being edited
  setNewTableData: React.Dispatch<React.SetStateAction<TableData>>; // Function to update table data
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Function to open/close the edit modal
  saveEdit: () => void; // Function to save the edited table data
}

const DraggableTableEdit = ({
  newTableData,
  setNewTableData,
  setIsEditModalOpen,
  saveEdit,
}: DraggableTableEditProps) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Table</h2>
        <div>
          <label className="block mb-2">
            Table No:
            <input
              type="text"
              value={newTableData.tableNo}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  tableNo: e.target.value,
                })
              }
              className="border p-2 w-full"
            />
          </label>
          <label className="block mb-2">
            Seat:
            <input
              type="text"
              value={newTableData.seat}
              onChange={(e) =>
                setNewTableData({ ...newTableData, seat: e.target.value })
              }
              className="border p-2 w-full"
            />
          </label>
          <div className="block mb-2">
            Background Color:
            <input
              type="color"
              className="cursor-pointer w-full mt-2"
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
