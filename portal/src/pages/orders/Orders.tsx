import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeGetCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import SingleOrderModal from "./SingleOrderModal";

const Orders = () => {
  const { currentUser } = useFrappeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [discount, setDiscount] = useState(0);

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
  const { data: result, mutate } = useFrappeGetCall(
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
      await updateDoc("Table Order", selectedOrder, updateData);
      toast.success("Order completed and discount applied!");
      setIsModalOpen(false); // Close the modal
      mutate(); // Refresh the order list
    } catch (error) {
      toast.error("Error completing order with discount.");
      console.log("Error:", error);
    }
  };

  const getBackgroundColor = (orderIndex: number) => {
    const colors = [
      "bg-gray-100",
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-pink-100",
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

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>

      {/* Filter checkboxes */}
      <div className="mb-4">
        {[
          "Order Placed",
          "Work in progress",
          "Ready to Serve",
          "Completed",
          "Canceled",
        ].map((state) => (
          <label key={state} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={selectedState === state}
              onChange={() =>
                setSelectedState(selectedState === state ? "" : state)
              } // Toggle between states
              className="form-checkbox"
            />
            <span className="ml-2">{state}</span>
          </label>
        ))}
        {/* Reset button */}
        <button
          onClick={() => setSelectedState("")} // Reset the selected state to null
          className="ml-4 bg-gray-300 text-gray-700 py-2 px-4 rounded"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="px-4 py-2 border-b">Order ID</th>
              <th className="px-4 py-2 border-b">Table</th>
              <th className="px-4 py-2 border-b">Status</th>
              {/* <th className="px-4 py-2 border-b">Tax</th>
              <th className="px-4 py-2 border-b">Discount</th>
              <th className="px-4 py-2 border-b">Amount</th> */}
              <th className="px-4 py-2 border-b">Total Amount</th>
              <th className="px-4 py-2 border-b">Item Name</th>
              <th className="px-4 py-2 border-b">QTY</th>
              <th className="px-4 py-2 border-b">Rate</th>
              <th className="px-4 py-2 border-b">Amount</th>
              <th className="px-4 py-2 border-b"> Item Status</th>
              <th className="px-4 py-2 border-b">Delivery Status </th>

              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {" "}
            {/* Added divide for white gaps between rows */}
            {orders?.map((order, orderIndex) => {
              const bgColor = getBackgroundColor(orderIndex); // Get the background color for the entire order
              return (
                <>
                  {order?.item_list?.map((item, index) => (
                    <tr
                      key={`${order.name}-${index}`}
                      className={`${bgColor}  hover:bg-gray-50`}
                    >
                      {index === 0 ? (
                        <>
                          <td className="px-4 py-2 border-b">{order?.name}</td>
                          <td className="px-4 py-2 border-b">
                            {order?.table || "Parcel Order"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {order?.status}
                          </td>
                          {/* <td className="px-4 py-2 border-b">{order?.tax}</td>
                          <td className="px-4 py-2 border-b">{order?.discount}</td>
                          <td className="px-4 py-2 border-b">{order?.amount}</td> */}
                          <td className="px-4 py-2 border-b">
                            {order?.total_amount?.toFixed(2)}
                          </td>
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
                      <td className="px-4 py-2 border-b">{item?.item}</td>
                      <td className="px-4 py-2 border-b">{item?.qty}</td>
                      <td className="px-4 py-2 border-b">{item?.rate}</td>
                      <td className="px-4 py-2 border-b">{item?.amount}</td>
                      <td className="px-4 py-2 border-b">
                        {item?.is_parcel ? "Parcel" : "Dining"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {item?.is_ready ? "Ready" : "Not Ready"}
                      </td>
                      {index === 0 ? (
                        <td className="px-4 py-2  flex gap-3">
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
                                className=" bg-primaryColor text-white py-1.5 px-4 rounded"
                              >
                                {action?.action}
                              </button>
                            )
                          )}
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </tr>
                  ))}
                  {/* Empty row at the end of the order */}
                  <tr className={`${bgColor}`}>
                    <td colSpan={11} className="h-5"></td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Set Discount for Completed Order
            </h2>

            <div className="mb-4">
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700"
              >
                Discount (%)
              </label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="bg-primaryColor text-white py-2 px-4 rounded"
              >
                Apply Discount
              </button>
            </div>
          </div>
          {selectedOrder && (
            <SingleOrderModal
              orderId={selectedOrder}
              closeModal={() => setIsModalOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
