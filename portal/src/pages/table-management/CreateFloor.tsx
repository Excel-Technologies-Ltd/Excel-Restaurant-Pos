import { useState } from "react";
import Input from "../../components/form-elements/Input";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList } from 'frappe-react-sdk'
import { RestaurantFloor } from "../../types/ExcelRestaurantPos/RestaurantFloor";
import toast from "react-hot-toast/headless";

type Props = {
  setIsOpenFloorCreate: React.Dispatch<React.SetStateAction<boolean>>;
  mutate:any
};


const CreateFloor = ({ setIsOpenFloorCreate ,mutate }: Props) => {
  const [floorName, setFloorName] = useState("");

  const {data}=useFrappeGetDoc('Restaurant Settings', 'Restaurant Settings', {
    fields: ['*']
  })
  const company=data?.company

  const { createDoc, loading, error } = useFrappeCreateDoc<RestaurantFloor>()




  // State to manage the form data


  const createFloor = async () => {
    // Here you would typically handle the floor creation logic,
    // such as making an API call to save the floor data.
    if (!floorName) return

    try {
      await createDoc("Restaurant Floor", {
        floor: floorName,
        company: company,
  
      })
  
      // Reset the form
      setFloorName("");
  
  
      // Close the modal
      setIsOpenFloorCreate(false);
      // toast.success("Floor created successfully")
      mutate()
    } catch (error:any) {
      toast.error(error?.message)
    }
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
          <Input label="Floor Name" value={floorName} onChange={(e) => setFloorName(e.target.value)} />

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsOpenFloorCreate(false)}
              className="mr-2 cancel_btn"
            >
              Cancel
            </button>
            <button type="submit" className="main_btn disabled:opacity-50" disabled={floorName.length === 0}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFloor;
