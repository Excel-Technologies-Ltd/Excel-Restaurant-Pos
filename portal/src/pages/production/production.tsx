import { useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useState } from "react"

import Modal from "../../components/modal/Modal"
import Input from "../../components/form-elements/Input"
import { toast } from "react-hot-toast"

interface BOMItem {
    name: string;
    item: string;
    item_name: string;
    quantity: number;
    uom: string;
    is_active: number;
    is_default: number;
    bom_no: string;
    company: string;
}

interface BOMFormData {
    quantity: number;

}

const Production = () => {
    const { data: bomList, isLoading } = useFrappeGetDocList("BOM", {
        fields: ["name", "item", "item_name", "is_active"],
        filters:[["is_active", "=", 1],["is_default", "=", 1]],
        limit: 10
    })
    // warehouse list
    console.log("bomList", bomList)
    const [selectedBOM, setSelectedBOM] = useState<BOMItem | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [quantity, setQuantity] = useState <number>(0)


    // create process
    const { call: createProcess } = useFrappePostCall("excel_restaurant_pos.api.bom.run_bom_process")


    const handleOpenModal = (bom: BOMItem) => {
        setIsModalOpen(true)
        setSelectedBOM(bom)
    }


    const handleSubmit = () => {
        createProcess({
            bom_id: selectedBOM?.name,
            qty: quantity
        }).then((res) => {
            toast.success("Process execution started")
            // clear the quantity
            setQuantity(0)
        }).catch((err) => {
            console.log("err", err)
            toast.error("Failed to execute process")
        }).finally(() => {
            setIsModalOpen(false)
        })
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedBOM(null)
    }

    if (isLoading) {
        return <div className="p-4">Loading Production Recipes...</div>
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Production Recipes</h1>
                <p className="text-gray-600 mt-2">Manage and view your production recipes</p>
            </div>
<div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse min-w-[1380px] border rounded-lg overflow-hidden p-5 ">
           <thead>
                    <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            BOM No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Name
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UOM
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                <tbody>
                    {bomList?.map((bom: BOMItem) => (
                        <tr key={bom.name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {bom.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bom.item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bom.item_name}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bom.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bom.uom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    bom.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {bom.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleOpenModal(bom)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    Process
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
</div>
            {/* BOM Processing Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={`Process BOM: ${selectedBOM?.name}`}
                width="w-full md:max-w-[600px]"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">BOM Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Item: </span>{selectedBOM?.item_name}
                            </div>
                            <div>
                                <span className="font-medium">BOM Quantity: </span>{selectedBOM?.quantity} {selectedBOM?.uom}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Production Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value as unknown as number)}
                            required
                            min={1}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            onClick={handleCloseModal}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Process BOM
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Production