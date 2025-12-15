import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeGetCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "../../components/form-elements/Select";
import NotFound from "../../components/not-found/NotFound";
import Pagination from "../../components/pagination/Pagination";
import TableSkaleton from "../../components/skeleton/TableSkaleton";
import { useLoading } from "../../context/loadingContext";
import { styles } from "../../utilities/cn";
import SingleOrderModal from "./SingleOrderModal";
const Orders = () => {
  const { currentUser } = useFrappeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [discount, setDiscount] = useState(0);
  const { startLoading, stopLoading } = useLoading();

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalDataCount = 200; // Example total data count
  const totalPages = Math.ceil(totalDataCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to the first page
  };

  const { data: roles } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_roles?user=${currentUser}`
  );
  const userRoles = roles?.message?.map((role: any) => role?.Role);

  const states = [
    {
      id: 1,
      state: "Order Placed",
      nextState: "Work in progress",
      role: "Restaurant Waiter",
    },
    {
      id: 2,
      state: "Sent to Kitchen",
      nextState: "Work in progress",
      role: "Restaurant Waiter",
    },
    {
      id: 3,
      state: "Work in progress",
      nextState: "Preparing",
      role: "Restaurant Chef",
    },
    {
      id: 4,
      state: "Canceled",
      nextState: "Canceled",
      role: "Restaurant Waiter",
    },
    {
      id: 5,
      state: "Preparing",
      nextState: "Ready to Serve",
      role: "Restaurant Chef",
    },
    {
      id: 6,
      state: "Ready to Serve",
      nextState: "Served",
      role: "Restaurant Waiter",
    },
    {
      id: 7,
      state: "Served",
      nextState: "Completed",
      role: "Restaurant Manager",
    },
    {
      id: 8,
      state: "Completed",
      nextState: "Completed",
      role: "Restaurant Manager",
    },
  ];

  const transitions = [
    {
      id: 1,
      state: "Order Placed",
      action: "Accept",
      nextState: "Work in progress",
      allowed: "Restaurant Waiter",
    },
    {
      id: 2,
      state: "Order Placed",
      action: "Reject",
      nextState: "Canceled",
      allowed: "Restaurant Waiter",
    },
    {
      id: 4,
      state: "Work in progress",
      action: "Reject",
      nextState: "Canceled",
      allowed: "Restaurant Chef",
    },
    {
      id: 5,
      state: "Ready to Serve",
      action: "Pay Now",
      nextState: "Completed",
      allowed: "Restaurant Manager",
    },
    {
      id: 6,
      state: "Ready to Serve",
      action: "Pay Now",
      nextState: "Completed",
      allowed: "Restaurant Cashier",
    },
  ];
  const [selectedState, setSelectedState] = useState<string | null>("");
  const { data: result, mutate, isLoading } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_order_list?status=${
      selectedState ? encodeURIComponent(selectedState) : ""
    }`,
    ["*"]
  );
  const orders = result?.message;

  // Manage the selected state for filtering

  const getAllowedStates = (roles: string[]) => {
    return states.filter((state) => roles.includes(state.role));
  };

  const getAllowedActions = (currentState: string, roles: string[]) => {
    return transitions?.filter(
      (trans) =>
        trans?.state === currentState && roles?.includes(trans?.allowed)
    );
  };

  const { updateDoc } = useFrappeUpdateDoc();
  const handleCompleteAction = (orderId, currentStatus, roles, action) => {
    if (currentStatus === "Ready to Serve") {
      // Open the modal to set the discount when the order is being completed
      setSelectedOrder(orderId);
      setIsModalOpen(true);
    } else {
      handleStatusChange(orderId, currentStatus, roles, action);
    }
  };

  const handleStatusChange = (orderId, currentStatus, roles, action) => {
    const transition = transitions?.find(
      (trans) =>
        trans?.state === currentStatus &&
        roles?.includes(trans?.allowed) &&
        trans?.action === action
    );

    if (transition) {
      const nextState = transition.nextState;
      const updateData: { status: string; docstatus?: number } = {
        status: nextState,
      };
      if (nextState === "Completed") {
        updateData.docstatus = 1;
      }
      startLoading();
      updateDoc("Table Order", orderId, updateData)
        .then((res) => {
          if (res) {
            toast.success("Order status updated successfully!");
            mutate();
          }
        })
        .catch((error) => {
          toast.error("Error updating order status.");
          console.log("Error updating order status:", error);
        })
        .finally(() => {
          stopLoading();
        });
    } else {
      toast.error("Invalid transition for the current state and role.");
    }
  };
  const handleApplyDiscount = async () => {
    if (discount < 0 || discount > 100) {
      toast.error("Please enter a valid discount between 0 and 100.");
      return;
    }

    const updateData = {
      status: "Completed",
      discount,
      docstatus: 1, // Mark as completed
    };

    try {
      startLoading();
      await updateDoc("Table Order", selectedOrder, updateData);
      toast.success("Order completed and discount applied!");
      setIsModalOpen(false); // Close the modal
      mutate(); // Refresh the order list
    } catch (error) {
      toast.error("Error completing order with discount.");
      console.log("Error:", error);
    } finally {
      stopLoading();
    }
  };

  const getBackgroundColor = (orderIndex: number) => {
    const colors = [
      "bg-white hover:bg-gray-100",
      "bg-gray-100 hover:bg-gray-200",
      // "bg-gray-100 hover:bg-gray-200",
      // "bg-blue-100 hover:bg-blue-200",
      // "bg-green-100 hover:bg-green-200",
      // "bg-yellow-100 hover:bg-yellow-200",
      // "bg-pink-100 hover:bg-pink-200",
    ];
    return colors[orderIndex % colors.length];
  };

  useFrappeDocTypeEventListener("Table Order", () => {
    mutate();
    console.log("Order List Updated");
  });
  useFrappeDocumentEventListener("Table Order", "on_update", (eventData) => {
    mutate();
    console.log("Event data:", eventData);
  });

  // Filter orders based on the selected state
  useEffect(() => {
    mutate(); // Trigger API call whenever selectedState changes
  }, [selectedState, mutate]);

  // if(isLoading) return (
  //   <div className="p-6 rounded-lg">
  //     <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>
  //     {isLoading && <TableSkaleton />}
  //   </div>
  // )

  const renderSelect = () => {
    return (
      [
        "Order Placed",
        "Work in progress",
        "Ready to Serve",
        "Completed",
        "Canceled",
      ].map((state) => (
        <option value={state}>{state}</option>
      ))
    )
  }

  return (
    <div className="p-6 rounded-lg">
      <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>

      
      {/* Filter checkboxes */}
      <div className="mb-4 flex gap-2 md:gap-4">
        <div className="w-60">
          <Select isHideSelect value={selectedState || ""} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="">All Orders</option>
            {renderSelect()}
          </Select>
        </div>
        {/* {[
          "Order Placed",
          "Work in progress",
          "Ready to Serve",
          "Completed",
          "Canceled",
        ].map((state) => (
          <label key={state} className="inline-flex items-center mr-4 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedState === state}
              onChange={() =>
                setSelectedState(selectedState === state ? "" : state)
              } // Toggle between states
              className="form-checkbox cursor-pointer"
            />
            <span className="ml-2">{state}</span>
          </label>
        ))} */}
        {/* Reset button */}
        <button
          onClick={() => setSelectedState("")}
          className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-800 py-1 2xl:py-1.5 px-4 rounded transition-all duration-300"
        >
          Reset
        </button>
      </div>


      <div className="bg-white shadow-sm p-3 rounded-lg">
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse min-w-[1300px] border rounded-lg overflow-hidden p-5 ">
            <thead className="">
              <tr className="bg-gray-200 text-gray-700 text-left !rounded-t-lg">
                <th className="px-4 py-2 border-b w-32">Order ID</th>
                <th className="px-4 py-2 border-b">Table</th>
                <th className="px-4 py-2 border-b">Status</th>
                {/* <th className="px-4 py-2 border-b">Tax</th>
                <th className="px-4 py-2 border-b">Discount</th>
                <th className="px-4 py-2 border-b">Amount</th> */}
                <th className="px-4 py-2 border-b">Total Amount</th>
                <th className="px-4 py-2 border-b w-44">Item Name</th>
                <th className="px-4 py-2 border-b">Quantity</th>
                <th className="px-4 py-2 border-b">Rate</th>
                <th className="px-4 py-2 border-b">Amount</th>
                <th className="px-4 py-2 border-b"> Item Status</th>
                <th className="px-4 py-2 border-b">Delivery Status </th>

                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">

              
              {orders?.length === 0 && <NotFound />}
              {/* Added divide for white gaps between rows */}
              {!isLoading && orders?.length > 0 && orders?.slice(0, 6)?.map((order, orderIndex) => {
                const bgColor = getBackgroundColor(orderIndex); // Get the background color for the entire order
                return (
                  <>
                    {order?.item_list?.map((item, index) => (
                      <tr
                        key={`${order.name}-${index}`}
                        className={`${bgColor} `}
                      >
                        {index === 0 ? (
                          <>
                            <TableData className="w-32">
                              {order?.name}
                            </TableData>
                            <TableData className="">
                              {order?.table || "Takeaway Order"}
                            </TableData>
                            <TableData className="">
                              {order?.status}
                            </TableData>
                            {/* <td className="px-4 py-2 border-b">{order?.tax}</td>
                            <td className="px-4 py-2 border-b">{order?.discount}</td>
                            <td className="px-4 py-2 border-b">{order?.amount}</td> */}
                            <TableData className="">
                              {order?.total_amount?.toFixed(2)}
                            </TableData>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                            {/* <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td> */}
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                          </>
                        )}
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
                          {item?.is_ready ? "Ready" : "Not Ready"}
                        </TableData>
                        {index === 0 ? (
                          <TableData className="flex gap-3 border-b-0">
                            {getAllowedActions(order?.status, userRoles)?.map(
                              (action) => (
                                <button
                                  key={action.action}
                                  onClick={() =>
                                    handleCompleteAction(
                                      order?.name,
                                      order?.status,
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
                        )}
                      </tr>
                    ))}
                    {/* Empty row at the end of the order */}
                    {/* <tr className={`${bgColor}`}>
                      <td colSpan={11} className="h-5"></td>
                    </tr> */}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {isLoading && <TableSkaleton />}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalDataCount={totalDataCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
      {isModalOpen && (
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={{zIndex: 9999}}>
          <div className="bg-white p-6 rounded-lg w-96">
            {selectedOrder && (
              <SingleOrderModal
                orderId={selectedOrder}
                closeModal={() => setIsModalOpen(false)}
              />
            )}
          </div>
        // </div>
      )}
    </div>
  );
};

export default Orders;


const TableData = ({children , className=""}:{children:React.ReactNode , className?:string }) => {
  return <td className={styles("px-4 py-2 border-b text-sm md:text-[15px]",className)}>{children}</td>;
};
