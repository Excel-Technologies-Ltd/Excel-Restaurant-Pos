import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeGetCall,
  useFrappePostCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Pagination from "../../components/pagination/Pagination";
import { useLoading } from "../../context/loadingContext";
import { styles } from "../../utilities/cn";


const ChefOrders = () => {

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to the first page
  };

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
      id: 2,
      state: "Work in progress",
      action: "Accept All",
      nextState: "Preparing",
      allowed: "Restaurant Chef",
    },
    {
      id: 3,
      state: "Preparing",
      action: "Prepared",
      nextState: "Ready to Serve",
      allowed: "Restaurant Chef",
    },
  ];

  const { data: result, mutate, isLoading } = useFrappeGetCall(
    `excel_restaurant_pos.api.item.get_chef_order_list?page=${currentPage}&page_size=${itemsPerPage}`,
    ["*"]
  );
  const orders = result?.message?.data;
  console.log(orders);

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
    call: markAsReady
  } = useFrappePostCall("excel_restaurant_pos.api.item.make_as_ready_item");

  const {
    call: markAsAccepted
  } = useFrappePostCall("excel_restaurant_pos.api.item.make_as_accepted_item");

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
      "bg-white",
      "bg-gray-100 ",
    ];
    return colors[orderIndex % colors.length];
  };

  const handlemarkItemReady = async (order_id: string, item_name: string, is_create_recipe: number) => {
    startLoading();
    try {
      const result = await markAsReady({ body: { order_id, item_name, is_create_recipe } });
      toast.success("Marked as Ready");
      console.log(result);
      mutate(); // Refresh the data
    } catch (error) {
      console.log(error);
      toast.error("Error marking item as ready");
    } finally {
      stopLoading();
    }
  };

  // const confirmMarkItemReady = (order_id: string, item_name: string) => {
  //   {
  //     toast((t) => (
  //       <div>
  //         <p className="mb-3">Serve from ready stock?</p>
  //         <div className="flex gap-2">
  //           <button
  //             onClick={async () => {

  //               await handlemarkItemReady(order_id, item_name, 1);
  //               toast.dismiss(t.id);
  //             }}
  //             className="px-3 py-1 bg-gray-300 rounded"
  //           >
  //             No
  //           </button>
  //           <button
  //             onClick={async () => {
  //               await handlemarkItemReady(order_id, item_name, 0);
  //               toast.dismiss(t.id);
  //             }}
  //             className="px-3 py-1 bg-blue-500 text-white rounded"
  //           >
  //             Yes
  //           </button>
  //         </div>
  //       </div>
  //     ), { duration: Infinity });
  //   };
  // }
  const confirmMarkItemReady = (order_id: string, item_name: string) => {
    toast((t) => (
      <div className="p-4 max-w-sm relative">
        {/* Close button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute top-0 right-[-0px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Serve from ready stock?</h3>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await handlemarkItemReady(order_id, item_name, 1);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-300 min-w-[60px]"
          >
            No
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await handlemarkItemReady(order_id, item_name, 0);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm min-w-[60px]"
          >
            Yes
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '0',
        minWidth: '320px',
      },
      position: 'top-center',
    });
  };

  const handlemarkItemAccepted = async (order_id: string, item_name: string) => {

    startLoading();
    try {
      const result = await markAsAccepted({ body: { order_id, item_name } });
      toast.success("Marked as Accepted");
      console.log(result);
      mutate(); // Refresh the data
    } catch (error) {
      console.log(error);
      toast.error("Error marking item as accepted");
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
    <div className="p-6 rounded-lg">
      <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>

      <div className="bg-white shadow-sm rounded-lg p-3">
        <div className="overflow-x-auto bg-white rounded-lg pb-2">
          <table className="table-auto w-full border-collapse min-w-[1100px] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="px-4 py-2 border-b w-36">Order ID</th>
                <th className="px-4 py-2 border-b">Table</th>
                <th className="px-4 py-2 border-b w-44">Status</th>
                <th className="px-4 py-2 border-b">Item Name</th>
                <th className="px-4 py-2 border-b">Quantity</th>
                <th className="px-4 py-2 border-b">Remarks</th>
                <th className="px-4 py-2 border-b">Item Status</th>
                <th className="px-4 py-2 border-b w-44">Delivery Status</th>
                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!isLoading && orders?.map((order, orderIndex) => {
                const bgColor = getBackgroundColor(orderIndex);
                const allowedActions = getAllowedActions(order?.status, userRoles);

                return (
                  <React.Fragment key={order.name}>
                    {order?.item_list?.map((item, index) => (
                      <tr key={`${order.name}-${index}`} className={`${bgColor}`}>
                        {index === 0 && (
                          <>
                            <td
                              className="px-4 py-2 border-b w-36 text-start"
                              rowSpan={order.item_list.length + (order?.remarks ? 1 : 0)}
                            >
                              {order?.name}
                            </td>
                            <td
                              className="px-4 py-2 border-b w-44"
                              rowSpan={order.item_list.length + (order?.remarks ? 1 : 0)}
                            >
                              {order?.table || "Takeaway Order"}
                            </td>
                            <td
                              className="px-4 py-2 border-b w-52"
                              rowSpan={order.item_list.length + (order?.remarks ? 1 : 0)}
                            >
                              <div className={styles("bg-gray-300 rounded-md px-2 py-1 w-fit border", {
                                "bg-green-300/40 border-green-300": order?.status === "Completed",
                                "bg-orange-300/40 border-orange-200": order?.status !== "Completed" && order?.status !== "Canceled" && order?.status !== "Work in progress" && order?.status !== "Order Placed",
                                "bg-red-300/40 border-red-300": order?.status === "Canceled",
                                "bg-yellow-300/40 border-yellow-300": order?.status === "Work in progress",
                                "bg-teal-400/40 border-teal-300": order?.status === "Order Placed"
                              })}>
                                {order?.status}
                              </div>
                            </td>
                          </>
                        )}

                        <td className="px-4 py-2 border-b w-44">{item?.item}</td>
                        <td className="px-4 py-2 border-b">{item?.qty}</td>
                        <td className="px-4 py-2 border-b">{item?.remarks}</td>
                        <td className="px-4 py-2 border-b">
                          {item?.is_parcel ? "Takeaway" : "Dining"}
                        </td>

                        <td className="px-4 py-2 border-b w-32">
                          {item?.is_ready ? (
                            <div className="bg-green-300/50 border border-green-300 rounded-md px-4 py-1.5 w-fit">
                              Served
                            </div>
                          ) : (
                            <>
                              {/* Only show "Ready to Serve" button when order is in "Preparing" status */}
                              {item?.is_ready === 0 && item?.is_accepted === 1 && (
                                <button
                                  onClick={() => {
                                    if (item?.is_recipe_item) {
                                      confirmMarkItemReady(order?.name, item?.name)
                                    } else {
                                      handlemarkItemReady(order?.name, item?.name, 1)
                                    }
                                  }}
                                  className="bg-primaryColor text-white py-1.5 px-4 rounded"
                                >
                                  {item?.is_recipe_item ? "Process Recipe" : "Ready to Serve"}
                                </button>
                              )}
                              {/* Show status text for other statuses */}
                              {item?.is_accepted === 0 && (
                                <button
                                  onClick={() => handlemarkItemAccepted(order?.name, item?.name)}
                                  className="bg-primaryColor text-white py-1.5 px-4 rounded"
                                >
                                  Accept
                                </button>
                              )}
                            </>
                          )}
                        </td>

                        {/* Action column - show for first item only */}
                        {index === 0 && (
                          <td className="px-4 py-2 border-b" rowSpan={order.item_list.length + (order?.remarks ? 1 : 0)}>
                            <div className="flex gap-2 flex-wrap">
                              {allowedActions?.map((action) => (
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
                                  className="bg-primaryColor text-white py-1.5 px-4 rounded text-sm whitespace-nowrap"
                                >
                                  {action?.action}
                                </button>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Instructions row */}
                    {order?.remarks && (
                      <tr className={`${bgColor}`}>
                        <td colSpan={6} className="px-4 py-2 border-b">
                          <span className="font-semibold">Instructions:</span>{" "}
                          {order?.remarks}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={result?.message?.totalPages}
            totalDataCount={result?.message?.totalDataCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ChefOrders;

const TableData = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return <td className={styles("px-4 py-2 last:border-b-0 text-sm md:text-[15px] text-start", className)}>{children}</td>;
};