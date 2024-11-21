import React, { useEffect, useState } from "react";
import { useFrappeAuth, useFrappeDocTypeEventListener, useFrappeDocumentEventListener, useFrappeGetCall, useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk";
import { FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";

// Example of getting the user roles (this would typically come from your authentication context)


const Orders = () => {
  // Define the workflow states and transitions
  const {currentUser} = useFrappeAuth();
  const {data:roles} = useFrappeGetCall(`excel_restaurant_pos.api.item.get_roles?user=${currentUser}`)
  const userRoles = roles?.message?.map((role:any)=>role?.Role)
  console.log({userRoles});

  console.log(currentUser);
  const states = [
    { id: 1, state: "Order Placed", nextState: "Work in progress", role: "Restaurant Waiter" },
    { id: 2, state: "Sent to Kitchen", nextState: "Work in progress", role: "Restaurant Waiter" },
    { id: 3, state: "Work in progress", nextState: "Preparing", role: "Restaurant Chef" },
    { id: 4, state: "Canceled", nextState: "Canceled", role: "Restaurant Waiter" },
    { id: 5, state: "Preparing", nextState: "Ready for Pickup", role: "Restaurant Chef" },
    { id: 6, state: "Ready for Pickup", nextState: "Served", role: "Restaurant Waiter" },
    { id: 7, state: "Served", nextState: "Completed", role: "Restaurant Manager" },
    { id: 8, state: "Completed", nextState: "Completed", role: "Restaurant Manager" },
  ];

  const transitions = [
    { id: 1, state: "Order Placed", action: "Accept", nextState: "Work in progress", allowed: "Restaurant Waiter" },
    { id: 2, state: "Order Placed", action: "Reject", nextState: "Canceled", allowed: "Restaurant Waiter" },
    { id: 3, state: "Work in progress", action: "Ready", nextState: "Ready for Pickup", allowed: "Restaurant Chef" },
    { id: 3, state: "Work in progress", action: "Reject", nextState: "Canceled", allowed: "Restaurant Chef" },
    { id: 4, state: "Ready for Pickup", action: "Completed", nextState: "Completed", allowed: "Restaurant Manager" },
  ];

  // Get the logged-in user's roles (can be an array of multiple roles)
// This would be dynamic in a real app

  // Fetch orders with filters: excluding 'Completed' and 'Cancelled' status
  const { data: result ,mutate} = useFrappeGetCall("excel_restaurant_pos.api.item.get_order_list",["*"])
  const orders = result?.message
  console.log(orders);


  // Get allowed states for the user roles
  const getAllowedStates = (roles: string[]) => {
    return states.filter((state) => roles.includes(state.role));
  };

  // Get allowed actions for the user roles and current state
  const getAllowedActions = (currentState: string, roles: string[]) => {
    return transitions.filter(
      (trans) => trans?.state === currentState && roles?.includes(trans?.allowed)
    );
  };
  useFrappeDocTypeEventListener("Table Order", (eventData) => {
    console.log("Event data:", eventData);
});
useFrappeDocumentEventListener("Table Order", "on_update", (eventData) => {
  mutate();
  console.log("Event data:", eventData);
});
  // Handle order status change based on allowed transitions
  const { updateDoc } = useFrappeUpdateDoc(); // Hook to update the order document

  const handleStatusChange = (orderId, currentStatus, roles, action) => {
    const transition = transitions?.find(
      (trans) => trans?.state === currentStatus && roles?.includes(trans?.allowed) && trans?.action === action
    );
  
    if (transition) {
      const nextState = transition.nextState;
      // Define the type for updateData
      const updateData: { status: string; docstatus?: number } = { status: nextState };
      if (nextState === "Completed") {
        updateData.docstatus = 1;
      }
  
      // Update the order status using the useFrappeUpdateDoc hook
      updateDoc("Table Order", orderId, updateData)
        .then((res) => {
          if (res) {
            console.log("Order status updated successfully:", res);
            mutate(); // Refresh the list of orders
          }
        })
        .catch((error) => {
          console.log("Error updating order status:", error);
        });
    } else {
      console.log("Invalid transition for the current state and role.");
    }
  };

  // Filter orders based on user roles and valid statuses



 useEffect(() => {
  const intervalId = setInterval(() => {
    mutate();
  }, 10000);

  // Cleanup function to clear the interval on unmount
  return () => clearInterval(intervalId);
}, [mutate]);


useEffect(()=>{
  console.log("userRoles",userRoles);
  // find Order Placed
  const orderPlaced = orders?.filter((order:any)=>order?.status==="Order Placed")
  const checkManagerOrWaiter = userRoles?.includes("Restaurant Manager") || userRoles?.includes("Restaurant Waiter")
  const checkChef = userRoles?.includes("Restaurant Chef")
  if(checkManagerOrWaiter && orderPlaced?.length>0){
    toast.success("There is an order placed but not sent to kitchen yet")
  }
  const WorkInProgress = orders?.filter((order:any)=>order?.status==="Work in progress")
  if(checkManagerOrWaiter && WorkInProgress?.length>0){
    toast.success("There is an order in progress")
  }
},[orders])

  return (
    <div className="p-4">
      <h2 className="font-semibold text-xl mb-4">Orders</h2>

      {/* Loop through each filtered order and display it in a card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders?.map((order) => (
          <div key={order.name} className="bg-white shadow-lg rounded-md p-4">
            {/* Order Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">{order?.name}</h3>
              <div className="text-sm text-gray-500">{order?.table ? order?.table : "Parcel"}</div>
            </div>

            {/* Order Details */}
            <div className="mt-2 text-sm">
              <p className="font-semibold">Total: ৳{order?.total_amount}</p>
              <p className="font-semibold">Status: {order?.status}</p>
            </div>
            {/* Special Instructions */}
    {order?.remarks && (
      <div className="mt-2 text-sm ">
        <strong>Note:</strong> {order?.remarks}
      </div>
    )}


            {/* Order Item List */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <ul className="list-none space-y-2">
                {order?.item_list?.map((item, index) => (
                  <li key={index} className="flex justify-between text-xs">
                    <span>{item?.item}</span>
                    <span>৳{item?.rate} x {item?.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Action Buttons based on allowed actions */}
            <div className="mt-4 w-fit flex h-fit gap-4">
              {getAllowedActions(order?.status, userRoles).map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleStatusChange(order?.name, order?.status, userRoles, action?.action)}
                  className="w-full bg-primaryColor text-white py-1.5 px-4 rounded"
                >
                  {action.action}
                </button>
              ))}
            </div>

            {/* Edit Icon */}
            {/* <div className="mt-2 text-right">
              <FiEdit className="text-gray-500 cursor-pointer" />
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
