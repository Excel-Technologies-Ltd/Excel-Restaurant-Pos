import { useState } from "react";
import Input from "../../components/form-elements/Input";

type Props = {
  setIsOpenFloorCreate: React.Dispatch<React.SetStateAction<boolean>>;
};
const CreateFloor = ({ setIsOpenFloorCreate }: Props) => {
  // State to manage the form data
  const [floorName, setFloorName] = useState("");
  const [floorNumber, setFloorNumber] = useState("");

  const createFloor = () => {
    // Here you would typically handle the floor creation logic,
    // such as making an API call to save the floor data.
    const newFloor = {
      name: floorName,
      number: floorNumber,
    };

    console.log("Creating floor:", newFloor);

    // Reset the form
    setFloorName("");
    setFloorNumber("");

    // Close the modal
    setIsOpenFloorCreate(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-5"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-full xsm:min-w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Create New Floor</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createFloor();
          }}
          className="space-y-3
          "
        >
          <Input label="Floor Name" />
          <Input label="Floor Number" />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsOpenFloorCreate(false)}
              className="mr-2 cancel_btn"
            >
              Cancel
            </button>
            <button type="submit" className="main_btn">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFloor;
