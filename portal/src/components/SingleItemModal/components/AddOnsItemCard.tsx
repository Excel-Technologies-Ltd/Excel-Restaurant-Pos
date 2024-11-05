import { Food } from '../../../data/items'
import { FiPlus } from 'react-icons/fi'
import { LuMinus } from 'react-icons/lu'

type AddOnItemCardProps = {
    item: Food,
    handleAddOnsChange: (item: Food) => void,
    selectedItems: Food[],
    decrementAddOns: (id: number) => void,
    incrementAddOns: (id: number) => void
}

const AddOnsItemCard = (props: AddOnItemCardProps) => {
    const { item, handleAddOnsChange, selectedItems, decrementAddOns, incrementAddOns } = props;
    console.log("selectedItems", selectedItems);
    const quantity = selectedItems.find(selectedItem => selectedItem?.id === item?.id)?.quantity;
    console.log("quantity", quantity);
    return (
        <div
            className="p-3 flex flex-row items-center border rounded-md relative mt-2 z-10"
        >
            {/* Checkbox before image */}
            <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                    type="checkbox"
                    checked={selectedItems.some(
                        (selectedItem) => selectedItem.id === item.id
                    )}
                    onChange={() => handleAddOnsChange(item)}
                    className="mr-2 h-4 w-4"
                />
                <p className="text-xs font-semibold text-gray-800">
                    {item?.name}
                </p>
            </label>
            <div className="w-4/12 flex justify-between">
                {
                    selectedItems?.some(
                        (selectedItem) => selectedItem?.id === item?.id
                    ) &&
                    <div className="flex items-center rounded-md h-fit ">
                        {selectedItems.find(item => item.id === item.id)?.quantity === 1 ? (
                            <button
                                onClick={() => decrementAddOns(item.id as number)}
                                className="px-2 rounded-md rounded-e-none text-xs bg-gray-200 cursor-not-allowed h-fit py-1 border"
                            >
                                <LuMinus className="text-[10px]" />
                            </button>
                        ) : (
                            <button
                                onClick={() => decrementAddOns(item.id as number)}
                                className="px-2 rounded-md rounded-e-none text-sm bg-gray-200 h-fit py-1 border"
                            >
                                <LuMinus className="text-[10px]" />
                            </button>
                        )}
                        <span className="px-2 text-[10px] h-full flex items-center border py-[1.5px]">
                            {quantity}
                        </span>
                        {/* {quantities[item.id] > 0 && ( */}
                        <button
                            onClick={() => incrementAddOns(item.id)}
                            className="px-2 rounded-md rounded-s-none bg-gray-200 h-fit py-1 border"
                        >
                            <FiPlus className="text-[10px]" />
                        </button>
                        {/* )} */}
                    </div>
                }
                <p className="text-xs lg:text-base font-medium text-textColor flex ml-auto items-center">
                    <FiPlus /> ৳{item?.sellPrice}
                </p>
            </div>
        </div>
    )
}


export default AddOnsItemCard