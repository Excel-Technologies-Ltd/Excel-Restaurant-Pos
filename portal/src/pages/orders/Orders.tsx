import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "../../components/form-elements/Select";
import NotFound from "../../components/not-found/NotFound";
import Pagination from "../../components/pagination/Pagination";
import { useLoading } from "../../context/loadingContext";
import { styles } from "../../utilities/cn";
import OrderModal from "./OrderModal";
import SingleOrderModal from "./SingleOrderModal";

const Orders = () => {
  const { currentUser } = useFrappeAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [discount, setDiscount] = useState(0);
  const { startLoading, stopLoading } = useLoading();
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // const totalDataCount = 200; // Example total data count
  // const totalPages = Math.ceil(totalDataCount / itemsPerPage);

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
    `excel_restaurant_pos.api.item.get_order_list?status=${selectedState ? encodeURIComponent(selectedState) : ""
    }&page=${currentPage}&page_size=${itemsPerPage}`,
    ["*"]
  );
  const orders = result?.message?.data;

  // Manage the selected state for filtering

  // const getAllowedStates = (roles: string[]) => {
  //   return states.filter((state) => roles.includes(state.role));
  // };

  const getAllowedActions = (currentState: string, roles: string[]) => {
    return transitions?.filter(
      (trans) =>
        trans?.state === currentState && roles?.some((role) => trans?.allowed === role)
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
            mutate()
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
      docstatus: 1,
    };

    try {
      startLoading();
      await updateDoc("Table Order", selectedOrder, updateData);
      toast.success("Order completed and discount applied!");
      setIsModalOpen(false); // Close the modal
      // Refresh the order list
    } catch (error) {
      toast.error("Error completing order with discount.");
      console.log("Error:", error);
    } finally {
      stopLoading();
    }
  };

  const getBackgroundColor = (orderIndex: number) => {
    const colors = [
      "bg-white ",
      "bg-gray-100",
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

  // initialy not fetch print format
  const { mutate: mutatePrintFormat } = useFrappeGetCall(
    `excel_restaurant_pos.api.print.get_print_format_sales_invoice`, {
    swr: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      revalidateIfStale: false,
    }
  }
  );
  const handleSalesInvoicePrint = (salesInvoice: string) => {
    try {
      // You can print either Table Order or Sales Invoice
      const doctype = "Sales Invoice"
      const docName = salesInvoice
      let printFormat = "Standard";
      mutatePrintFormat().then((res) => {
        printFormat = res?.message;
        const printUrl = `/api/method/frappe.utils.print_format.download_pdf?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(docName)}&format=${encodeURIComponent(printFormat)}&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en`
        window.open(printUrl, "_blank");
        toast.success("Opening print preview...");
      });


      // Generate print URL



      // Open print preview in new window
      window.open(printUrl, "_blank");
      toast.success("Opening print preview...");
    } catch (error) {
      toast.error("Error opening print preview");
      console.error("Print error:", error);
    }
  };

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

  console.log({ orders });


  return (
    <div className="p-6 rounded-lg">
      <h2 className="font-semibold text-2xl text-gray-800 mb-6">Orders</h2>


      {/* Filter checkboxes */}
      <div className="mb-4 flex gap-2 md:gap-4">
        <div className="w-60">
          <Select
            isHideSelect
            value={selectedState || ""}
            onChange={(e) => {
              setSelectedState(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Orders</option>
            {renderSelect()}
          </Select>
        </div>
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
          <table className="table-auto w-full border-collapse min-w-[1380px] border rounded-lg overflow-hidden p-5 ">
            <thead className="">
              <tr className="bg-gray-200 text-gray-700 text-left !rounded-t-lg">
                <th className="px-4 py-2 border-b w-36">Order ID</th>
                <th className="px-4 py-2 border-b">Table</th>
                <th className="px-4 py-2 border-b w-52">Status</th>
                <th className="px-4 py-2 border-b">Total Amount</th>
                <th className="px-4 py-2 border-b w-44">Item Name</th>
                <th className="px-4 py-2 border-b">Quantity</th>
                <th className="px-4 py-2 border-b">Rate</th>
                <th className="px-4 py-2 border-b">Amount</th>
                <th className="px-4 py-2 border-b"> Item Status</th>
                <th className="px-4 py-2 border-b w-40">Delivery Status </th>

                <th className="px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.length === 0 && <NotFound />}
              {orders?.length > 0 &&
                orders?.map((order: any, orderIndex: number) => {
                  const bgColor = getBackgroundColor(orderIndex);
                  return (
                    <React.Fragment key={order.name} >
                      {order?.item_list?.map((item: any, index: number) => (
                        <tr key={`${order.name}-${index}`} className={`${bgColor} `}>
                          {index === 0 && (
                            <>
                              <td
                                className="px-4 py-2 border-b w-36 text-start"
                                rowSpan={order.item_list.length}
                              >
                                {order?.name}
                              </td>
                              <td
                                className="px-4 py-2 border-b w-44"
                                rowSpan={order.item_list.length}
                              >
                                {order?.table || "Takeaway Order"}
                              </td>
                              <td
                                className="px-4 py-2 border-b w-52"
                                rowSpan={order.item_list.length}
                              >
                                <div
                                  className={styles(
                                    "bg-gray-300 rounded-md px-2 py-1 w-fit border",
                                    {
                                      "bg-green-300/40 border-green-300":
                                        order?.status === "Completed",
                                      "bg-orange-300/40 border-orange-200":
                                        order?.status !== "Completed",
                                      "bg-red-300/40 border-red-300":
                                        order?.status === "Canceled",
                                      "bg-yellow-300/40 border-yellow-300":
                                        order?.status === "Work in progress",
                                      "bg-teal-300/40 border-teal-300":
                                        order?.status === "Order Placed",
                                    }
                                  )}
                                >
                                  {order?.status}
                                </div>
                              </td>
                              <td
                                className="px-4 py-2 border-b"
                                rowSpan={order.item_list.length}
                              >
                                {order?.total_amount?.toFixed(2)}
                              </td>
                            </>
                          )}

                          <td className="px-4 py-2 border-b w-44">{item?.item}</td>
                          <td className="px-4 py-2 border-b">{item?.qty}</td>
                          <td className="px-4 py-2 border-b">{item?.rate}</td>
                          <td className="px-4 py-2 border-b">{item?.amount}</td>
                          <td className="px-4 py-2 border-b">
                            {item?.is_parcel ? "Takeaway" : "Dining"}
                          </td>
                          <td className="px-4 py-2 border-b w-40">
                            <div
                              className={styles(
                                "bg-gray-300 rounded-md px-2 py-1 w-fit border",
                                {
                                  "bg-green-300/50 border-green-300": item?.is_ready,
                                  "bg-orange-300/50 border-orange-300": !item?.is_ready,
                                }
                              )}
                            >
                              {item?.is_ready ? "Ready" : "Not Ready"}
                            </div>
                          </td>
                          {index === 0 ? (
                            <td
                              className="px-4 py-2 border-b flex gap-3 border-b-0"
                              rowSpan={order.item_list.length}
                            >
                              {getAllowedActions(order?.status, userRoles)
                                .slice(0, 1)
                                ?.map((action) => (
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
                                    className="bg-primaryColor text-white py-1.5 px-4 rounded whitespace-nowrap"
                                  >
                                    {action?.action}
                                  </button>
                                ))}

                              {order?.status === "Completed" && (
                                <button
                                  onClick={() => handleSalesInvoicePrint(order?.sales_invoice)}
                                  className="bg-primaryColor text-white py-1.5 px-4 rounded whitespace-nowrap"
                                >
                                  Print
                                </button>
                              )}
                            </td>
                          ) : (
                            <td
                              className="px-4 py-2 border-b flex gap-3 border-b-0"
                              rowSpan={order.item_list.length}
                            >

                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
            </tbody>
            {/* <tbody className="divide-y">

              
              {orders?.length === 0 && <NotFound />}
              {orders?.length > 0 && orders?.map((order, orderIndex) => {
                const bgColor = getBackgroundColor(orderIndex); // Get the background color for the entire order
                return (
                  <>
                    {order?.item_list?.map((item, index) => (
                      <tr
                        key={`${order.name}-${index}`}
                        className={`${bgColor}`}
                      >
                        {index === 0 ? (
                          <>
                            <TableData className="w-36 text-start">
                              {order?.name}
                            </TableData>
                            <TableData className="w-44">
                              {order?.table || "Parcel Order"}
                            </TableData>
                            <TableData className="w-44">
                              <div className={styles("bg-gray-300 rounded-md px-2 py-1 w-fit border",
                                {"bg-green-300/40 border-green-300":order?.status === "Completed","bg-orange-300/40 border-orange-200":order?.status !== "Completed" , "bg-red-300/40 border-red-300":order?.status === "Canceled" , "bg-yellow-300/40 border-yellow-300":order?.status === "Work in progress" , "bg-teal-300/40 border-teal-300":order?.status === "Order Placed"})}>
                                {order?.status}
                              </div>
                            </TableData>
                            <TableData className="">
                              {order?.total_amount?.toFixed(2)}
                            </TableData>
                          </>
                        ) 
                        : (
                          <>
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                            <td className="px-4 py-2 border-b"></td>
                          </>
                        )
                        }
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
                          {item?.is_parcel ? "Parcel" : "Dining"}
                        </TableData>
                        <TableData className="w-32">
                        <div className={styles("bg-gray-300 rounded-md px-2 py-1 w-fit border",{"bg-green-300/50 border-green-300":item?.is_ready,"bg-orange-300/50 border-orange-300":!item?.is_ready})}>
                          {item?.is_ready ? "Ready" : "Not Ready"}
                          </div>
                        </TableData>
                        {index === 0 ? (
                          <TableData className="flex gap-3 border-b-0">
                            {getAllowedActions(order?.status, userRoles).slice(0, 1)?.map(
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
                        ) 
                        : (
                          <div className=""></div>
                        )
                        }
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody> */}
          </table>
        </div>

        {/* {isLoading && <TableSkaleton />} */}
        <Pagination
          currentPage={currentPage}
          totalPages={result?.message?.totalPages}
          totalDataCount={result?.message?.totalDataCount}
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
              mutate={mutate}
              handleSalesInvoicePrint={handleSalesInvoicePrint}
            />
          )}
        </div>
        // </div>
      )}

      {selectedOrderDetails &&
        <OrderModal
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
        />
      }

    </div>
  );
};

export default Orders;


const TableData = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return <td className={styles("px-4 py-2 border-b text-sm md:text-[15px] text-start", className)}>{children}</td>;
};
