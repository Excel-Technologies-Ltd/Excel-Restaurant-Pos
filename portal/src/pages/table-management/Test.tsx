import React, { useState } from "react";
import Draggable from "react-draggable";

const RotatableBox: React.FC = () => {
  const [rotation, setRotation] = useState<number>(0); // Track rotation in degrees
  const [isRotating, setIsRotating] = useState<boolean>(false); // Track if currently rotating

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRotating(true); // Start rotating
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isRotating) return;

    const box = document.getElementById("rotatable-box");
    if (!box) return;

    // Get box center coordinates
    const rect = box.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate the angle based on mouse position
    const angle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    // Update rotation state
    setRotation(angle);
  };

  const handleMouseUp = () => {
    setIsRotating(false); // Stop rotating
  };

  React.useEffect(() => {
    if (isRotating) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isRotating]);

  const eventHandler = (e:any, data:any) => {
    console.log("Event Type", e.type);
    console.log({ e, data });
  };

  return (
    <div className="">
      <Draggable onDrag={eventHandler}>
        <div className="flex justify-center items-center h-screen">
          {/* Rotatable box */}
          <div
            id="rotatable-box"
            className="h-12 w-12 bg-green-500 relative"
            style={{ transform: `rotate(${rotation}deg)` }} // Apply rotation
          >
            {/* Rotation handle */}
            <div
              className="absolute bottom-0 right-0 h-4 w-4 bg-red-500 rounded-full cursor-pointer"
              onMouseDown={handleMouseDown}
            >
              {rotation}
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default RotatableBox;

// import React, { useEffect, useState } from "react";
// import Draggable from "react-draggable";
// import toast from "react-hot-toast";
// import { BiSolidEdit } from "react-icons/bi";
// import { IoMdEye } from "react-icons/io";
// import { RxCross2 } from "react-icons/rx";
// import { useDispatch, useSelector } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import Select from "../../components/form-elements/Select";
// import {
//   closeRightModal,
//   openRightModal,
// } from "../../redux/features/modal/foodsModal";
// import { RootState } from "../../redux/store/Store";
// import { styles } from "../../utilities/cn";
// import Foods from "../foods/Foods";
// import CreateFloor from "./CreateFloor";
// import DraggableTableCreate from "./DraggableTableCreate";
// import DraggableTableDetails from "./DraggableTableDetails";
// import DraggableTableEdit from "./DraggableTableEdit";
// import ModalRightToLeft from "./ModalRightToLeft";

// // Interface for table shape
// export interface TableShape {
//   id: string;
//   seat: string;
//   tableNo: string;
//   shape: "rectangle" | "circle" | "road";
//   width: number;
//   height: number;
//   position: {
//     x: number;
//     y: number;
//   };
//   bgColor: string;
//   isBooked?: boolean;
//   rotation?: number;
// }

// const DraggableTable: React.FC = () => {
//   const dispatch = useDispatch();

//   // Get the modal state from Redux
//   const rightModalOpen = useSelector(
//     (state: RootState) => state.foodsModal.rightModalOpen
//   );

//   // Floor Create modal
//   const [isOpenFloorCreate, setIsOpenFloorCreate] = useState(false);

//   const [tables, setTables] = useState<TableShape[]>([]);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [selectedTable, setSelectedTable] = useState<TableShape | null>(null);
//   const [newTableShape, setNewTableShape] = useState<
//     "rectangle" | "circle" | "road"
//   >("rectangle");
//   const [newTableData, setNewTableData] = useState({
//     seat: "",
//     tableNo: "",
//     bgColor: newTableShape == "road" ? "#BFBFBF" : "#155e75",
//   });

//   const bookedColor = "#880000";

//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleRightSideModal = (id: string) => {
//     // Set the query parameter in the URL
//     const params = new URLSearchParams(location.search);
//     params.set("table", id); // Replace 'modal' and 'right' with your desired key and value

//     navigate({
//       pathname: location.pathname,
//       search: params.toString(),
//     });

//     dispatch(openRightModal()); // Open the modal
//   };

//   const handleCloseModal = () => {
//     const params = new URLSearchParams(location.search);
//     params.delete("table");

//     navigate({
//       pathname: location.pathname,
//       search: params.toString(),
//     });

//     dispatch(closeRightModal()); // Close the modal
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch("/data.json");
//       const data = await response.json();
//       setTables(data);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("tables", JSON.stringify(tables));
//   }, [tables]);

//   const handleDrag = (e: any, data: any, id: string) => {
//     void e;
//     setTables((prev) =>
//       prev.map((table) =>
//         table.id === id
//           ? { ...table, position: { x: data.x, y: data.y } }
//           : table
//       )
//     );
//   };

//   const handleResize = (e: React.MouseEvent | React.TouchEvent, id: string) => {
//     e.stopPropagation();
//     const table = tables.find((table) => table.id === id);
//     if (!table) return;

//     const initialWidth = table.width;
//     const initialHeight = table.height;

//     // Handling both mouse and touch events
//     const initialClientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const initialClientY = "touches" in e ? e.touches[0].clientY : e.clientY;

//     const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
//       const clientX =
//         "touches" in moveEvent
//           ? moveEvent.touches[0].clientX
//           : moveEvent.clientX;
//       const clientY =
//         "touches" in moveEvent
//           ? moveEvent.touches[0].clientY
//           : moveEvent.clientY;

//       const newWidth = Math.max(initialWidth + clientX - initialClientX, 50);
//       const newHeight = Math.max(initialHeight + clientY - initialClientY, 50);

//       setTables((prev) =>
//         prev.map((t) =>
//           t.id === id
//             ? {
//                 ...t,
//                 width: table.shape === "circle" ? newWidth : newWidth,
//                 height: table.shape === "circle" ? newWidth : newHeight,
//               }
//             : t
//         )
//       );
//     };

//     const onMouseUp = () => {
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//       document.removeEventListener("touchmove", onMouseMove);
//       document.removeEventListener("touchend", onMouseUp);
//     };

//     // Add event listeners for both mouse and touch
//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//     document.addEventListener("touchmove", onMouseMove);
//     document.addEventListener("touchend", onMouseUp);
//   };

//   const openCreateModal = (shape: "rectangle" | "circle" | "road") => {
//     setNewTableShape(shape);
//     setNewTableData({
//       seat: "",
//       tableNo: "",
//       bgColor: shape == "road" ? "#BFBFBF" : "#155e75",
//     });
//     setIsCreateModalOpen(true);
//   };
//   const openFloorCreateModal = () => {
//     setIsOpenFloorCreate(true);
//   };

//   const createTable = () => {
//     if (!newTableShape) return;

//     if (!newTableData.seat || !newTableData.tableNo) {
//       toast.error("Please fill in all the details before creating the table.");
//       return;
//     }

//     const newTable: TableShape = {
//       id: Date.now().toString(),
//       seat: newTableData.seat,
//       tableNo: newTableData.tableNo,
//       shape: newTableShape,
//       width: newTableShape === "circle" ? 100 : 180,
//       height: newTableShape === "circle" ? 100 : 80,
//       position: { x: 0, y: 0 },
//       bgColor: newTableData.bgColor,
//     };

//     setTables((prev) => [...prev, newTable]);
//     setIsCreateModalOpen(false);
//     setNewTableShape("rectangle");
//     setNewTableData({
//       seat: "",
//       tableNo: "",
//       bgColor: newTableShape == "road" ? "#BFBFBF" : "#155e75",
//     });
//   };

//   const deleteTable = (id: string) => {
//     setTables((prev) => prev.filter((table) => table.id !== id));
//   };

//   const handleEdit = (id: string) => {
//     const table = tables.find((t) => t.id === id);
//     if (table) {
//       setNewTableData({
//         seat: table.seat,
//         tableNo: table.tableNo,
//         bgColor: table.bgColor,
//       });
//       setNewTableShape(table.shape);
//       setSelectedTable(table);
//       setIsEditModalOpen(true);
//     }
//   };

//   const handleDetails = (id: string) => {
//     const table = tables.find((t) => t.id === id);
//     if (table) {
//       setSelectedTable(table);
//       setIsDetailsModalOpen(true);
//     }
//   };

//   const saveEdit = () => {
//     if (selectedTable) {
//       setTables((prev) =>
//         prev.map((table) =>
//           table.id === selectedTable.id
//             ? {
//                 ...table,
//                 seat: newTableData.seat,
//                 tableNo: newTableData.tableNo,
//                 bgColor: newTableData.bgColor,
//               }
//             : table
//         )
//       );
//       setIsEditModalOpen(false);
//     }
//   };

//   const [visibleTableId, setVisibleTableId] = useState(null); // Track the currently visible table

//   const handleToggleVisibility = (id: any) => {
//     setVisibleTableId((prevId) => (prevId === id ? null : id)); // Toggle visibility per table ID
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-200 h-[100vh] w-full relative overflow-x-auto">
//       <div className="w-full flex justify-between pb-2 pt-2 px-2 sticky top-0 left-0 bg-gray-200 border-b border-gray-300 z-10">
//         <div>
//           <button
//             onClick={() => openFloorCreateModal()}
//             className="mr-2 bg-blue-500 text-white p-2 rounded text-xs md:text-base "
//           >
//             Create Floor
//           </button>
//           <button
//             onClick={() => openCreateModal("rectangle")}
//             className="mr-2 bg-primaryColor text-white p-2 rounded text-xs md:text-base"
//           >
//             Create Table
//           </button>
//         </div>
//         <div className="">
//           <Select className="w-fit text-xs md:text-base" isHideSelect>
//             <option value="">First Floor</option>
//           </Select>
//         </div>
//       </div>

//       <div className="w-full mt-16 absolute border-5">
//         {tables.map((table) => (
//           <Draggable
//             key={table.id}
//             position={{ x: table.position.x, y: table.position.y }}
//             onStop={(e, data) => handleDrag(e, data, table.id)}
//             bounds={{
//               left: 0,
//               top: 0,
//               // right: window.innerWidth - table.width,
//               bottom: window.innerHeight - table.height,
//             }}
//           >
//             <div
//               onTouchStart={() => handleToggleVisibility(table.id)} // Toggle visibility on touch start
//               onClick={() => handleToggleVisibility(table.id)}
//               className={styles(
//                 `absolute flex flex-col items-center justify-center shadow-lg group cursor-move`,
//                 { "min-w-[72px] min-h-[72px]": table?.shape !== "road" }
//               )}
//               style={{
//                 width: table.shape === "circle" ? table.width : table.width,
//                 height: table.shape === "circle" ? table.width : table.height,
//                 borderRadius: table.shape === "circle" ? "50%" : "8px",
//                 backgroundColor: table?.isBooked ? bookedColor : table.bgColor,
//                 transform: `rotate(${table.rotation || 0}deg)`,
//               }}
//             >
//               <div className="relative h-full w-full justify-center items-center flex">
//                 {/* Start rectangle table  */}
//                 {table?.seat &&
//                   table?.shape == "rectangle" &&
//                   table?.width >= table?.height && (
//                     <div className="flex justify-around absolute -top-[20px] w-full">
//                       {Array?.from(
//                         { length: Number(table?.seat) / 2 },
//                         (_, i) => {
//                           return (
//                             <div
//                               key={i}
//                               className={styles(
//                                 "w-10 h-3 bg-primaryColor rounded-t",
//                                 `bg[${
//                                   table?.isBooked ? "bg-" + bookedColor : ""
//                                 }]`
//                               )}
//                             ></div>
//                           );
//                         }
//                       )}
//                     </div>
//                   )}
//                 {table?.seat &&
//                   table?.shape == "rectangle" &&
//                   table?.width >= table?.height && (
//                     <div className="flex justify-around absolute -bottom-[20px] w-full">
//                       {Array?.from(
//                         { length: Number(table?.seat) / 2 },
//                         (_, i) => {
//                           return (
//                             <div
//                               key={i}
//                               className={styles(
//                                 "w-10 h-3 bg-primaryColor rounded-b",
//                                 `bg[${
//                                   table?.isBooked ? "bg-" + bookedColor : ""
//                                 }]`
//                               )}
//                             ></div>
//                           );
//                         }
//                       )}
//                     </div>
//                   )}

//                 {table?.seat &&
//                   table?.shape == "rectangle" &&
//                   table?.width < table?.height && (
//                     <div className="absolute flex flex-col justify-around -right-[20px] h-full">
//                       {Array?.from(
//                         { length: Number(table?.seat) / 2 },
//                         (_, i) => {
//                           return (
//                             <div
//                               key={i}
//                               className={styles(
//                                 "w-3 h-10 bg-primaryColor rounded-e",
//                                 `bg[${
//                                   table?.isBooked ? "bg-" + bookedColor : ""
//                                 }]`
//                               )}
//                             ></div>
//                           );
//                         }
//                       )}
//                     </div>
//                   )}
//                 {table?.seat &&
//                   table?.shape == "rectangle" &&
//                   table?.width < table?.height && (
//                     <div className="absolute flex flex-col justify-around -left-[20px] w-full h-full">
//                       {Array?.from(
//                         { length: Number(table?.seat) / 2 },
//                         (_, i) => {
//                           return (
//                             <div
//                               key={i}
//                               className={styles(
//                                 "w-3 h-10 bg-primaryColor rounded-s",
//                                 `bg[${
//                                   table?.isBooked ? "bg-" + bookedColor : ""
//                                 }]`
//                               )}
//                             ></div>
//                           );
//                         }
//                       )}
//                     </div>
//                   )}

//                 {/* End Rectangle table */}

//                 {/* Start Circle table */}
//                 {table?.seat && table?.shape == "circle" && (
//                   <div
//                     className={styles(
//                       "absolute flex justify-center items-center -right-[20px]s h-full w-full"
//                     )}
//                   >
//                     {Array?.from({ length: Number(table?.seat) }, (_, i) => {
//                       return (
//                         <div
//                           key={i}
//                           className={styles(
//                             "bg-primaryColor absolute ",
//                             `bg[${table?.isBooked ? "bg-" + bookedColor : ""}]`,
//                             { "w-10 h-3 rounded-b -bottom-[18px]": i == 0 },
//                             { "w-10 h-3 rounded-t -top-[18px]": i == 1 },
//                             { "w-3 h-10 rounded-s -left-[18px] ": i == 2 },
//                             { "w-3 h-10 rounded-e -right-[18px]": i == 3 }
//                           )}
//                         ></div>
//                       );
//                     })}
//                   </div>
//                 )}
//                 {/* End Circle table */}

//                 {table?.shape !== "road" && (
//                   <div className="absolute space-x-2">
//                     <button
//                       onClick={() => handleEdit(table.id)}
//                       onTouchEnd={() => handleEdit(table.id)}
//                       className="bg-blue-500 bg-opacity-40 text-white px-2 py-1 rounded"
//                     >
//                       <BiSolidEdit />
//                     </button>
//                     <button
//                       onClick={() => handleDetails(table.id)}
//                       onTouchEnd={() => handleDetails(table.id)}
//                       className="bg-green-500 bg-opacity-40 text-white px-2 py-1 rounded hidden"
//                     >
//                       <IoMdEye />
//                     </button>
//                     <button
//                       onClick={() => handleRightSideModal(table?.id)}
//                       onTouchEnd={() => handleRightSideModal(table?.id)}
//                       className="bg-green-500 bg-opacity-40 text-white px-2 py-1 rounded"
//                     >
//                       <IoMdEye />
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => deleteTable(table.id)}
//                 onTouchEnd={() => deleteTable(table.id)}
//                 className={styles(
//                   "absolute top-0 right-0 p-1 bg-red-500 text-white rounded invisible group-hover:visible",
//                   {
//                     "left-[50%] transform -translate-x-1/2 w-fit":
//                       table.shape === "circle",
//                   },
//                   { visible: visibleTableId === table?.id }
//                 )}
//               >
//                 <RxCross2 />
//               </button>

//               <div
//                 onMouseDown={(e) => handleResize(e, table.id)}
//                 onTouchStart={(e) => handleResize(e, table.id)}
//                 className={styles(
//                   "absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-full invisible group-hover:visible",
//                   {
//                     "p-1 left-[50%] transform -translate-x-1/2":
//                       table.shape === "circle",
//                   },
//                   { visible: visibleTableId === table?.id }
//                 )}
//               />
//             </div>
//           </Draggable>
//         ))}
//       </div>

//       {/* Create Modal */}
//       {isCreateModalOpen && (
//         <DraggableTableCreate
//           newTableData={newTableData}
//           setNewTableData={setNewTableData}
//           newTableShape={newTableShape}
//           setNewTableShape={setNewTableShape}
//           setIsCreateModalOpen={setIsCreateModalOpen}
//           createTable={createTable}
//         />
//       )}

//       {/* Edit Modal */}
//       {isEditModalOpen && (
//         <DraggableTableEdit
//           newTableData={newTableData}
//           setNewTableData={setNewTableData}
//           setIsEditModalOpen={setIsEditModalOpen}
//           saveEdit={saveEdit}
//         />
//       )}

//       {/* Details Modal */}
//       {isDetailsModalOpen && selectedTable && (
//         <DraggableTableDetails
//           setIsDetailsModalOpen={setIsDetailsModalOpen}
//           selectedTable={selectedTable}
//         />
//       )}

//       {/* Details Modal */}
//       {isOpenFloorCreate && (
//         <CreateFloor setIsOpenFloorCreate={setIsOpenFloorCreate} />
//       )}

//       {rightModalOpen && (
//         <ModalRightToLeft
//           rightModalOpen={true}
//           // rightModalOpen={rightModalOpen}
//           handleCloseModal={handleCloseModal}
//         >
//           <Foods />
//         </ModalRightToLeft>
//       )}
//     </div>
//   );
// };

// export default DraggableTable;
