import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeGetCall,
  useFrappePostCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLoading } from "../../context/loadingContext";

const ChefOrders = () => {
  const { startLoading, stopLoading } = useLoading();
  const { currentUser } = useFrappeAuth();
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
      id: 3,
      state: "Work in progress",
      action: "Prepared",
      nextState: "Ready to Serve",
      allowed: "Restaurant Chef",
    },
  ];

  const { data: result, mutate } = useFrappeGetCall(
    "excel_restaurant_pos.api.item.get_chef_order_list",
    ["*"]
  );
  const orders = result?.message;

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
  const {
    call: markAsReady,
    loading,
    error,
  } = useFrappePostCall("excel_restaurant_pos.api.item.make_as_ready_item");

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
  const handlemarkItemReady = async (order_id: string, item_name: string) => {
    startLoading();
    try {
      const result = await markAsReady({ body: { order_id, item_name } });
      toast.success("Marked as Ready");
      console.log(result);
    } catch (error) {
      console.log(error);
    } finally {
      stopLoading();
    }
  };
  useFrappeDocTypeEventListener("Table Order", () => {
    mutate();
  });
  useFrappeDocumentEventListener("Table Order", "on_update", (eventData) => {
    mutate();
  });

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="px-4 py-2 border-b">Order ID</th>
              <th className="px-4 py-2 border-b">Table</th>
              <th className="px-4 py-2 border-b">Status</th>

              <th className="px-4 py-2 border-b">Item Name</th>
              <th className="px-4 py-2 border-b">QTY</th>
              <th className="px-4 py-2 border-b">Item Status</th>
              <th className="px-4 py-2 border-b">Delivery Status</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {orders?.map((order, orderIndex) => {
              const bgColor = getBackgroundColor(orderIndex); // Get the background color for the entire order
              return (
                <>
                  {order?.item_list?.map((item, index) => (
                    <tr
                      key={`${order.name}-${index}`}
                      className={`${bgColor} hover:bg-gray-50`}
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
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 border-b"></td>
                          <td className="px-4 py-2 border-b"></td>
                          <td className="px-4 py-2 border-b"></td>
                        </>
                      )}
                      <td className="px-4 py-2 border-b">{item?.item}</td>
                      <td className="px-4 py-2 border-b">{item?.qty}</td>

                      <td className="px-4 py-2 border-b">
                        {item?.is_parcel ? "Parcel" : "Dining"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {item?.is_ready ? (
                          "Served"
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handlemarkItemReady(order?.name, item?.name)
                              }
                              className=" bg-primaryColor text-white py-1.5 px-4 rounded"
                            >
                              Ready to Serve
                            </button>
                          </>
                        )}
                      </td>

                      {index === 0 && order?.item_list?.length > 1 ? (
                        <td className=" py-2 flex gap-3">
                          {getAllowedActions(order?.status, userRoles)?.map(
                            (action) => (
                              <button
                                key={action.action}
                                onClick={() =>
                                  handleStatusChange(
                                    order?.name,
                                    order?.status,
                                    userRoles,
                                    action?.action
                                  )
                                }
                                className="w-full bg-primaryColor text-white py-1.5 px-4 rounded"
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
                  {order?.remarks && (
                    <tr className={`${bgColor}`}>
                      <td colSpan={11} className="h-5">
                        {" "}
                        <span className="font-semibold">
                          Instructions:
                        </span>{" "}
                        {order?.remarks ? order?.remarks : "Not found"}
                      </td>
                    </tr>
                  )}
                  <tr className={`bg-white`}>
                    <td colSpan={11} className="h-5"></td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChefOrders;
