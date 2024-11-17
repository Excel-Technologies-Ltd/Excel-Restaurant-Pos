import React, { useState } from "react";
import { FiEdit } from "react-icons/fi";

const Workflow = () => {
  // Define the initial workflow state and transition data
  const [states, setStates] = useState([
    { id: 1, state: "Order Placed", nextState: "Work in progress", role: "Restaurant Waiter" },
    { id: 2, state: "Sent to Kitchen", nextState: "Work in progress", role: "Restaurant Waiter" },
    { id: 3, state: "Work in progress", nextState: "Preparing", role: "Restaurant Chef" },
    { id: 4, state: "Canceled", nextState: "Canceled", role: "Restaurant Waiter" },
    { id: 5, state: "Preparing", nextState: "Ready for Pickup", role: "Restaurant Chef" },
    { id: 6, state: "Ready for Pickup", nextState: "Served", role: "Restaurant Waiter" },
    { id: 7, state: "Served", nextState: "Completed", role: "Restaurant Manager" },
  ]);

  const [transitions, setTransitions] = useState([
    { id: 1, state: "Order Placed", action: "Approve", nextState: "Work in progress", allowed: "Restaurant Waiter" },
    { id: 2, state: "Order Placed", action: "Reject", nextState: "Canceled", allowed: "Restaurant Waiter" },
    { id: 3, state: "Work in progress", action: "Approve", nextState: "Preparing", allowed: "Restaurant Chef" },
    { id: 4, state: "Work in progress", action: "Reject", nextState: "Canceled", allowed: "Restaurant Chef" },
    { id: 5, state: "Preparing", action: "Ready for Pickup", nextState: "Ready for Pickup", allowed: "Restaurant Chef" },
    { id: 6, state: "Ready for Pickup", action: "Served", nextState: "Served", allowed: "Restaurant Waiter" },
    { id: 7, state: "Served", action: "Completed", nextState: "Completed", allowed: "Restaurant Manager" },
  ]);

  // Handle editing state data
  const handleEditState = (index: number, field: string, value: string) => {
    const newStates = [...states];
    newStates[index][field] = value;
    setStates(newStates);
  };

  // Handle editing transition data
  const handleEditTransition = (index: number, field: string, value: string) => {
    const newTransitions = [...transitions];
    newTransitions[index][field] = value;
    setTransitions(newTransitions);
  };

  return (
    <div className="p-4">
      {/* Workflow States Table */}
      <h2 className="font-semibold text-xl mb-4">Workflow States</h2>
      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200">State</th>
            <th className="py-2 px-4 bg-gray-200">Next State</th>
            <th className="py-2 px-4 bg-gray-200">Role</th>
            <th className="py-2 px-4 bg-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {states.map((state, index) => (
            <tr key={state.id}>
              <td className="py-2 px-4">{state.state}</td>
              <td className="py-2 px-4">
                <input
                  value={state.nextState}
                  onChange={(e) => handleEditState(index, "nextState", e.target.value)}
                  className="border p-1 rounded"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  value={state.role}
                  onChange={(e) => handleEditState(index, "role", e.target.value)}
                  className="border p-1 rounded"
                />
              </td>
              <td className="py-2 px-4 text-blue-500 cursor-pointer">
                <FiEdit />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Transition Rules Table */}
      <h2 className="font-semibold text-xl mt-8 mb-4">Transition Rules</h2>
      <table className="min-w-full table-auto bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200">State</th>
            <th className="py-2 px-4 bg-gray-200">Action</th>
            <th className="py-2 px-4 bg-gray-200">Next State</th>
            <th className="py-2 px-4 bg-gray-200">Allowed Role</th>
            <th className="py-2 px-4 bg-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transitions.map((transition, index) => (
            <tr key={transition.id}>
              <td className="py-2 px-4">{transition.state}</td>
              <td className="py-2 px-4">
                <input
                  value={transition.action}
                  onChange={(e) => handleEditTransition(index, "action", e.target.value)}
                  className="border p-1 rounded"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  value={transition.nextState}
                  onChange={(e) => handleEditTransition(index, "nextState", e.target.value)}
                  className="border p-1 rounded"
                />
              </td>
              <td className="py-2 px-4">
                <input
                  value={transition.allowed}
                  onChange={(e) => handleEditTransition(index, "allowed", e.target.value)}
                  className="border p-1 rounded"
                />
              </td>
              <td className="py-2 px-4 text-blue-500 cursor-pointer">
                <FiEdit />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Workflow;
