import Modal from "../../components/modal/Modal";
import { styles } from "../../utilities/cn";

type Props = {
  selectedOrderDetails: any;
  setSelectedOrderDetails: any;
};

const OrderModal = ({ selectedOrderDetails, setSelectedOrderDetails }: Props) => {
  return (
    <Modal title="Order Details" isOpen={true} onClose={() => setSelectedOrderDetails(null)}>

          <div className="">
            {/* Table no */}
            <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center mb-3 font-medium text-sm">
              <h2 className="flex items-center">Table No : <p className="font-semibold text-gray-800 ps-1">{selectedOrderDetails?.table}</p></h2>
              <h2 className="flex items-center">Order No : <p className="font-semibold text-gray-800 ps-1">{selectedOrderDetails?.name}</p></h2>
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse min-w-[900px] border rounded-lg overflow-hidden p-5 ">
            <thead className="">
              <tr className="bg-gray-200 text-gray-700 text-left !rounded-t-lg">
                <th className="px-4 py-2 border-b w-44">Item Name</th>
                <th className="px-4 py-2 border-b">Quantity</th>
                <th className="px-4 py-2 border-b">Rate</th>
                <th className="px-4 py-2 border-b">Amount</th>
                <th className="px-4 py-2 border-b"> Item Status</th>
                <th className="px-4 py-2 border-b">Delivery Status </th>

                {/* <th className="px-4 py-2 border-b">Action</th> */}
              </tr>
            </thead>
            <tbody className="divide-y">

              {/* Added divide for white gaps between rows */}
              
                  <>
                    {selectedOrderDetails?.item_list?.map((item, index) => (
                      <tr
                        key={`${item.name}-${index}`}
                        className={``}
                      >
                        <TableData className="w-44">
                          {item?.item}
                        </TableData>
                        <TableData className="">
                          {item?.qty}
                        </TableData>
                        <TableData className="">
                          {item?.rate}
                        </TableData>
                        <TableData className="">
                          {item?.amount}
                        </TableData>
                        <TableData className="">
                          {item?.is_parcel ? "Takeaway" : "Dining"}
                        </TableData>
                        <TableData className="">
                        <div className={styles("bg-gray-300 rounded-md px-2 py-1 w-fit ",{"bg-green-300/50":item?.is_ready,"bg-orange-300/50":!item?.is_ready})}>
                            {item?.is_ready ? "Ready" : "Not Ready"}
                          </div>
                        </TableData>
                        {/* {index === 0 ? (
                          <TableData className="flex gap-3 border-b-0">
                            {getAllowedActions(selectedOrderDetails?.status, userRoles)?.map(
                              (action) => (
                                <button
                                  key={action.action}
                                  onClick={() =>
                                    handleCompleteAction(
                                      item?.name,
                                      item?.status,
                                      userRoles,
                                      action?.action
                                    )
                                  }
                                  className=" bg-primaryColor text-white py-1.5 px-4 rounded whitespace-nowrap"
                                >
                                  {action?.action}
                                </button>
                              )
                            )}
                          </TableData>
                        ) : (
                          // <td className=""></td>
                          <div className=""></div>
                        )} */}
                      </tr>
                    ))}
                  </>
                
            </tbody>
          </table>
          </div>
        </Modal>
  );
};

export default OrderModal;

const TableData = ({children , className=""}:{children?:React.ReactNode , className?:string }) => {
    return <td className={styles("px-4 py-2 border-b text-sm md:text-[15px]",className)}>{children}</td>;
  };
  