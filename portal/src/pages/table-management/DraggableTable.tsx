import {
  useFrappeCreateDoc,
  useFrappeDeleteDoc,
  useFrappeDocTypeEventListener,
  useFrappeDocumentEventListener,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappeUpdateDoc,
} from "frappe-react-sdk";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidEdit } from "react-icons/bi";
import { CgSpinner, CgUnavailable } from "react-icons/cg";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { IoRestaurant } from "react-icons/io5";
import { MdOutlineShoppingCartCheckout, MdTableBar } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { TbRotate2 } from "react-icons/tb"; // Rotate icon
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "../../components/form-elements/Select";
import { useLoading } from "../../context/loadingContext";
import { closeRightModal, openRightModal } from "../../redux/features/modal/foodsModal";
import { RootState } from "../../redux/store/Store";
import { RestaurantTable } from "../../types/ExcelRestaurantPos/RestaurantTable";
import { styles } from "../../utilities/cn";
import Pos from "../Admin/Pos/Pos";
import CreateFloor from "./CreateFloor";
import DraggableTableCreate from "./DraggableTableCreate";
import DraggableTableDetails from "./DraggableTableDetails";
import DraggableTableEdit from "./DraggableTableEdit";
import ModalRightToLeft from "./ModalRightToLeft";

// Interface for table shape
export interface TableShape {
  id?: string;
  seat: string;
  tableNo: string;
  shape: "rectangle" | "circle" | "road";
  length: number;
  breadth: number;
  position: {
    x: number;
    y: number;
  };
  bgColor: string;
  isBooked?: boolean;
  rotation?: number;
}

const DraggableTable: React.FC = () => {
  const [isOpenFloorCreate, setIsOpenFloorCreate] = useState(false);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable[] | []>(
    []
  );

  const [newTableShape, setNewTableShape] = useState<
    "Rectangle" | "Circle" | "Road"
  >("Rectangle");
  const tableToUpdate = useRef<RestaurantTable[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const { updateDoc } = useFrappeUpdateDoc<RestaurantTable>();
  const { deleteDoc } = useFrappeDeleteDoc();
  const [draggableTable, setDraggableTable] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);

  // console.log("draggableTable", updatedData);

  const { startLoading, stopLoading } = useLoading();
  const { data } = useFrappeGetDoc(
    "Restaurant Settings",
    "Restaurant Settings",
    {
      fields: ["*"],
    }
  );
  const company = data?.company;
  const { data: floors, mutate: mutateFloors } =
    useFrappeGetDocList("Restaurant Floor");
  const { data: tablesFromERP, mutate: mutateTables, isLoading: isLoadingTables} = useFrappeGetDocList(
    "Restaurant Table",
    {
      fields: ["*"],
      filters: [
        ["company", "=", company],
        ["restaurant_floor", "=", selectedFloor],
      ],
    }
  );

  useFrappeDocTypeEventListener("Restaurant Floor", async (doc) => {
    await mutateFloors();
  });

  const updateTable = async () => {
    try {

      const updatedTables = tableToUpdate.current
        .map((table) => {
          const existingTable = tables.find((t) => t.name === table.name);
          return existingTable ? { ...existingTable } : null;
        })
        .filter((table) => table !== null);

      startLoading();
      for (const table of updatedTables) {
        if (table?.name) {
          await updateDoc("Restaurant Table", table.name, table);
        }
      }
      await mutateTables();
      toast.success("Table updated successfully.");
      tableToUpdate.current = [];
      stopLoading();
    } catch (error) {
      console.log("error in updateTable", error);
    }
  };
  const { data: result, mutate } = useFrappeGetCall(
    "excel_restaurant_pos.api.item.get_running_order_list",
    ["*"]
  );
  const orders = result?.message;

  useEffect(() => {
    mutateTables();
    if (selectedFloor) {
      setNewTableData((prev) => ({
        ...prev,
        restaurant_floor: selectedFloor,
      }));
    }
  }, [selectedFloor]);

  const { createDoc } = useFrappeCreateDoc<RestaurantTable>();

  // useFrappeDocTypeEventListener("Restaurant Table", (doc) => {
  //   mutateTables();
  //   console.log("doc", doc);
  // });

  // useEffect(() => {
  //   if (floors?.length) {
  //     if (!selectedFloor)
  //       setSelectedFloor(floors?.[0]?.name)
  //   }
  //   if (tablesFromERP) {
  //     const updatedTables = tablesFromERP?.map((table) => ({
  //       ...table,
  //       length: +table.length,
  //       breadth: +table.breadth,
  //       position: JSON.parse(table.position)
  //     }))
  //     setTables(updatedTables)
  //   }
  // }, [floors, selectedFloor, tablesFromERP])
  useEffect(() => {
    // Initialize tables with booking status
    if (tablesFromERP && orders) {
      if (floors?.length) {
        if (!selectedFloor) setSelectedFloor(floors?.[0]?.name);
      }
      const updatedTables = tablesFromERP?.map((table) => {
        const isBooked = orders?.some(
          (order: any) => order?.table === table?.name
        );
        return {
          ...table,
          length: +table.length,
          breadth: +table.breadth,
          position: JSON.parse(table.position),
          isBooked,
        };
      });
      setTables(updatedTables);
    }
  }, [floors, selectedFloor, tablesFromERP, orders]);

  useEffect(() => {
    if (tablesFromERP) {
      // if the table is already in the state, then don't add it again
      const newTables = tablesFromERP?.filter(
        (table) => !tables.some((t) => t.name === table.name)
      );
      setTables((prev) => [...prev, ...newTables]);
    }
  }, []);

  // console.log(floors);

  const dispatch = useDispatch();
  const rightModalOpen = useSelector(
    (state: RootState) => state.foodsModal.rightModalOpen
  );

  const handleOpenRightModal = (table_id) => {
    // Get the current URL
    const currentUrl = new URL(window.location);
  
    // Set the query parameter
    currentUrl.searchParams.set("table_id", table_id);
  
    // Push the updated URL to the browser history
    window.history.pushState({}, "", currentUrl);
  
    // Open the modal
    dispatch(openRightModal(true));
  };
  

  const initialNewTable: RestaurantTable = {
    id: new Date().toISOString(),
    table_no: "",
    type: "Rectangle",
    length: 180,
    breadth: 80,
    position: { x: 10, y: 55 },
    seat: "",
    company: company,
    restaurant_floor: "",
    rotation: "",
    bg_color: newTableShape == "Road" ? "#BFBFBF" : "#155e75",
  };

  const [newTableData, setNewTableData] =
    useState<RestaurantTable>(initialNewTable);

  const headerRef = useRef<HTMLDivElement>(null); // Ref for the header

  // const bookedColor = "#880000";
  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete("table");
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
    dispatch(closeRightModal());
  };

  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
  }, [tables]);

  const openCreateTableModal = () => {
    if (!floors?.length) return toast.error("Please create a floor first.");
    // console.log("initialNewTable", initialNewTable);
    setNewTableData((prev) => {
      return {
        ...prev,
        restaurant_floor: selectedFloor,
      };
    });
    setIsCreateModalOpen(true);
  };

  const createTable = async () => {
    try {
      startLoading();
      
      if(!newTableData?.seat && newTableShape !== "Road"){
        toast.error("Please fill in all the details before creating the table.");
        return;
      }

      if (
        !newTableData?.restaurant_floor ||
        !newTableData?.type
      ) {
        toast.error(
          "Please fill in all the details before creating the table."
        );
        return;
      }

      const newTable = {
        ...newTableData,
        type: newTableShape == "Road" ? "Road" : newTableData?.type,
        id: new Date().toISOString(),
      };
      console.log("newTable", newTable);

      createDoc("Restaurant Table", newTable);

      setTables((prev) => [...prev, newTable]);

      // const newTable: RestaurantTable = {
      //   ...newTableData,
      // };

      // setTables((prev) => [...prev, newTable]);
      setIsCreateModalOpen(false);
      setNewTableData(initialNewTable);
      stopLoading();
    } catch (error) {
      console.log("error in createTable", error);
    }
  };

  const deleteTable = async (name: string) => {
    try {
      await deleteDoc("Restaurant Table", name);
      toast.success("Table deleted successfully.");
      mutateTables();
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const handleEdit = (name: string) => {
    const table = tables.find((t) => t.name === name);
    if (table) {
      setNewTableData({
        ...table,
      });
      setNewTableShape(table.type);
      setSelectedTable([table]);
      setIsEditModalOpen(true);
    }
  };

  const saveEdit = async () => {
    try {
      startLoading();

      if (newTableData?.name) {
        await updateDoc("Restaurant Table", newTableData?.name, newTableData);
      }

      await mutateTables();
      toast.success("Table updated successfully.");
      setIsEditModalOpen(false);
      stopLoading();
    } catch (error) {
      console.log("error in updateTable", error);
    }
  };

  const openFloorCreateModal = () => {
    setIsOpenFloorCreate(true);
  };

  const handleRotate = (
    e: React.MouseEvent | React.TouchEvent,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const targetedTable = tables.find((table) => table.name === name);
    if (!targetedTable) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + targetedTable.length / 2;
    const centerY = rect.top + targetedTable.breadth / 2;

    const initialClientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const initialClientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const initialAngle = Math.atan2(
      initialClientY - centerY,
      initialClientX - centerX
    );

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const degrees = ((currentAngle - initialAngle) * 180) / Math.PI;

      setTables((prev) =>
        prev.map((t) =>
          t.name === name
            ? {
                ...t,
                rotation: (
                  parseFloat(targetedTable.rotation || "0") + degrees
                ).toString(),
              }
            : t
        )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);

      // Add the table to the array to be updated if it is not already in the array then add the table to the state
      if (!tableToUpdate.current.some((table) => table?.name === name)) {
        tableToUpdate.current.push(targetedTable);
      }
      // if the table is already in the array then update the table state
      tableToUpdate.current = tableToUpdate.current.map((table) =>
        table.name === name ? targetedTable : table
      );
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
  };  

  // Custom Resize Functionality
  const handleResize = (
    e: React.MouseEvent | React.TouchEvent,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
  
    const targetedTable = tables.find((table) => table.name === name);
    if (!targetedTable) return;
  
    const initialLength = targetedTable.length;
    const initialBreadth = targetedTable.breadth;
    const initialClientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const initialClientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  
    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;
  
      const newLength = Math.max(initialLength + clientX - initialClientX, 50);
      const newBreadth = Math.max(
        initialBreadth + clientY - initialClientY,
        50
      );
  
      // Update targetedTable dimensions directly
      targetedTable.length =
        targetedTable.type === "Circle" ? newLength : newLength;
      targetedTable.breadth =
        targetedTable.type === "Circle" ? newLength : newBreadth;
  
      // Ensure `tableToUpdate.current` is updated
      if (!tableToUpdate.current.some((table) => table.name === name)) {
        tableToUpdate.current.push(targetedTable);
      } else {
        tableToUpdate.current = tableToUpdate.current.map((table) =>
          table.name === name ? targetedTable : table
        );
      }
  
      // Update the tables in state
      setTables((prev) =>
        prev.map((t) =>
          t.name === name
            ? {
                ...t,
                length: targetedTable.type === "Circle" ? newLength : newLength,
                breadth:
                  targetedTable.type === "Circle" ? newLength : newBreadth,
              }
            : t
        )
      );
    };
  
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
  
      // Finalize updates to `tableToUpdate.current`
      if (!tableToUpdate.current.some((table) => table.name === name)) {
        tableToUpdate.current.push(targetedTable);
      } else {
        tableToUpdate.current = tableToUpdate.current.map((table) =>
          table.name === name ? targetedTable : table
        );
      }
    };
  
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    const targetedTable = tables.find((table) => table.name === name);
    if (!targetedTable) return;

    const headerHeight = headerRef.current?.offsetHeight || 0; // Optional: prevent dragging above header
    const initialX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const initialY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      const newX = targetedTable.position.x + (clientX - initialX);
      const newY = Math.max(
        headerHeight,
        targetedTable.position.y + (clientY - initialY)
      ); // Prevent dragging above header

      setTables((prev) =>
        prev.map((t) =>
          t.name === name ? { ...t, position: { x: newX, y: newY } } : t
        )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);

      if (!tableToUpdate.current.some((table) => table.name === name)) {
        tableToUpdate.current.push(targetedTable);
      }
      
      tableToUpdate.current = tableToUpdate.current.map((table) =>
        table.name === name ? targetedTable : table
      );
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
  };

  const handleDragStart = (name: string) => {
    setDraggableTable(name);
  };
  const handleDragEnd = () => {
    setDraggableTable(null);
  };

  const handleTableClick = (tableName: string) => {
    const order = orders?.find((order: any) => order.table === tableName);
    if (order) {
      setSelectedOrder(order); // Set the selected order
      setShowOrderModal(true); // Open the modal
    } else {
      toast.error("No order details available for this table.");
    }
  };

  useFrappeDocTypeEventListener("Table Order", () => {
    mutate();
  });
  useFrappeDocumentEventListener("Table Order", "on_update", () => {
    mutate();
  });

  return (
    <div className="flex flex-col items-center bg-gray-200 h-[calc(100vh-48px)] w-full relative overflow-x-auto ">
      {/* Header with Ref */}
      <div
        ref={headerRef} // Set header ref
        className="w-full flex flex-col sm:flex-row justify-between gap-3 pb-2 pt-2 px-2 sticky top-0 left-0 bg-gray-200 border-b border-gray-300 z-10 header"
      >
        <div className="space-y-2 sm:space-y-0">
          <button
            onClick={() => openFloorCreateModal()}
            className="mr-2 main_btn bg-blue-500 hover:bg-blue-600"
          >
            Create Floor
          </button>
          <button
            onClick={() => openCreateTableModal()}
            className="main_btn mr-2"
          >
            Create Table
          </button>
          <button onClick={() => updateTable()} className="main_btn">
            Update Table
          </button>
        </div>
        {floors?.length && (
          <div className="flex">
            <Select
              className="w-32 text-xs md:text-base py-2.5 sm:py-2"
              isHideSelect
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setNewTableData((prev) => ({
                  ...prev,
                  restaurant_floor: e.target.value,
                }));
              }}
            >
              {floors?.map((floor) => (
                <option value={floor?.name}>{floor?.name}</option>
              ))}
            </Select>
            {/* <button className="main_btn h-fit">Save</button> */}
          </div>
        )}
      </div>

      {isLoadingTables && <div className="absolute inset-0 flex justify-center items-center bg-white/30" style={{zIndex: 1000}}>
        <div className="bg-[#E5E7EB] py-4 px-6 rounded-lg shadow-lgs flex items-center">
        <CgSpinner size={32} className="animate-spin mr-3" /><h2 className="text-base">Loading...</h2>
        </div>
      </div>}

      <div className="w-full mt-8 absolute border-5">
        {tables?.map((table) => (
          <div
            key={table.name}
            style={{
              width: table.type === "Circle" ? table.length : table.length,
              height: table.type === "Circle" ? table.length : table.breadth,
              minHeight: table.type === "Road" ? "70px" : "130px",
              minWidth: table.type === "Road" ? "150px" : "150px",
              left: `${table.position.x}px`,
              top: `${table.position.y}px`,
              borderRadius: table.type === "Circle" ? "50%" : "8px",
              // backgroundColor: table?.is_booked ? bookedColor : table.bg_color,
              backgroundColor:
                draggableTable === table.name ? "green" : table.bg_color,
              transform: `rotate(${table.rotation || 0}deg)`,
            }}
            className={styles(
              "absolute cursor-move group",
              // {
              //   "!bg-red-800": table?.isBooked,
              // }
            )}
            // onMouseDown={(e) => handleDrag(e, table?.name as string)}
            // onTouchStart={(e) => handleDrag(e, table?.name as string)}
            onMouseDown={(e) => {
              handleDragStart(table?.name as string);
              handleDrag(e, table?.name as string);
            }}
            onMouseUp={handleDragEnd}
            onTouchStart={(e) => {
              handleDragStart(table?.name as string);
              handleDrag(e, table?.name as string);
            }}
            onTouchEnd={handleDragEnd}
            // onClick={() => table?.isBooked && handleTableClick(table?.name)}
          >
            <div className="relative h-full w-full justify-center items-center grid">
              {table?.type === "Road" ?
              <></>
              :
              <div className="text-white">
                 <div className="flex justify-start flex items-center gap-1"> <IoRestaurant className="" /> {table?.name}</div>
                <div className="flex justify-start flex items-center gap-1"> <MdTableBar className="" /> {table?.table_no}</div>
                
                <div className="flex justify-start mb-2">
                  {table?.isBooked ? (
                  <div className="w-full h-full flex justify-start items-center text-red-500 text-lg font-bold">
                    <CgUnavailable className="text-xl me-1" /> Booked
                  </div>
                ):(
                  <div className="w-full h-full flex justify-start items-center text-white text-lg font-bold">
                    <FaRegCheckCircle className="text-base mr-1" /> Available
                  </div>
                )}
                </div>

                <div className="flex justify-start">
                  {table?.seat && (
                  <div className="space-x-2 group-hover:visible visible z-30">
                    <button
                      onClick={() => handleEdit(table?.name as string)}
                      onTouchEnd={() => handleEdit(table?.name as string)}
                      className="bg-blue-500 bg-opacity-40 text-white px-2 py-1 rounded"
                    >
                      <BiSolidEdit />
                    </button>
                    <button
                      onClick={() => table?.isBooked && handleTableClick(table?.name as string)}
                      onTouchEnd={() => table?.isBooked && handleTableClick(table?.name as string)}
                      // onClick={() => handleRightSideModal(table?.name as string)}
                      // onTouchEnd={() =>
                      //   handleRightSideModal(table?.name as string)
                      // }
                      className="bg-green-500 bg-opacity-40 text-white px-2 py-1 rounded"
                    >
                      <IoMdEye />
                    </button>
                    <button
                      // onClick={() => table?.isBooked && handleTableClick(table?.name as string)}
                      // onTouchEnd={() => table?.isBooked && handleTableClick(table?.name as string)}
                      onClick={() => handleOpenRightModal(table?.name as string)}
                      onTouchEnd={() =>
                        handleOpenRightModal(table?.name as string)
                      }
                      className="bg-teal-500 bg-opacity-40 text-white px-2 py-1 rounded"
                    >
                      <MdOutlineShoppingCartCheckout />
                    </button>
                  </div>
                )}
                </div>
              </div>}

              {/* Start rectangle table  */}
              {table?.seat &&
                table?.type == "Rectangle" &&
                table?.length >= table?.breadth && (
                  <div className="flex justify-around absolute -top-[20px] w-full">
                    {Array?.from(
                      { length: Math.ceil(Number(table?.seat) / 2) },
                      (_, i) => {
                        return (
                          <div
                            key={i}
                            // className={styles(
                            //   "w-10 h-3 bg-primaryColor rounded-t",
                            //   `bg[${table?.is_booked ? "bg-" + bookedColor : ""
                            //   }]`
                            // )}
                            className="w-10 h-3 bg-primaryColor rounded-t"
                          ></div>
                        );
                      }
                    )}
                  </div>
                )}
              {table?.seat &&
                table?.type == "Rectangle" &&
                table?.length >= table?.breadth && (
                  <div className="flex justify-around absolute -bottom-[20px] w-full">
                    {Array?.from(
                      { length: Math.floor(Number(table?.seat) / 2) },
                      (_, i) => {
                        return (
                          <div
                            key={i}
                            className={styles(
                              "w-10 h-3 bg-primaryColor rounded-b"
                              // `bg[${table?.is_booked ? "bg-" + bookedColor : ""
                              // }]`
                            )}
                          ></div>
                        );
                      }
                    )}
                  </div>
                )}

              {table?.seat &&
                table?.type == "Rectangle" &&
                table?.length < table?.breadth && (
                  <div className="absolute flex flex-col justify-around -right-[20px] h-full">
                    {Array?.from(
                      { length: Math.ceil(Number(table?.seat) / 2) },
                      (_, i) => {
                        return (
                          <div
                            key={i}
                            className={styles(
                              "w-3 h-10 bg-primaryColor rounded-e"
                              // `bg[${table?.is_booked ? "bg-" + bookedColor : ""
                              // }]`
                            )}
                          ></div>
                        );
                      }
                    )}
                  </div>
                )}
              {table?.seat &&
                table?.type == "Rectangle" &&
                table?.length < table?.breadth && (
                  <div className="absolute flex flex-col justify-around -left-[20px] w-full h-full">
                    {Array?.from(
                      { length: Math.floor(Number(table?.seat) / 2) },
                      (_, i) => {
                        return (
                          <div
                            key={i}
                            className={styles(
                              "w-3 h-10 bg-primaryColor rounded-s"
                              // `bg[${table?.is_booked ? "bg-" + bookedColor : ""
                              // }]`
                            )}
                          ></div>
                        );
                      }
                    )}
                  </div>
                )}

              {/* End Rectangle table */}

              {/* Start Circle table */}
              {table?.seat && table?.type == "Circle" && (
                <div
                  className={styles(
                    "absolute flex justify-center items-center -right-[20px]s h-full w-full"
                  )}
                >
                  {Array?.from({ length: Number(table?.seat) }, (_, i) => {
                    return (
                      <div
                        key={i}
                        className={styles(
                          "bg-primaryColor absolute ",
                          // `bg[${table?.is_booked ? "bg-" + bookedColor : ""}]`,
                          { "w-10 h-3 rounded-b -bottom-[18px]": i == 0 },
                          { "w-10 h-3 rounded-t -top-[18px]": i == 1 },
                          { "w-3 h-10 rounded-s -left-[18px] ": i == 2 },
                          { "w-3 h-10 rounded-e -right-[18px]": i == 3 }
                        )}
                      ></div>
                    );
                  })}
                </div>
              )}
              {/* End Circle table */}

              <button
                onClick={() => deleteTable(table?.name as string)}
                onTouchEnd={() => deleteTable(table?.name as string)}
                className={styles(
                  "absolute top-0 right-0 p-1 bg-red-500 text-white rounded invisible group-hover:visible",
                  {
                    "left-[50%] transform -translate-x-1/2 w-fit":
                      table.type === "Circle",
                  }
                )}
                // className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded invisible group-hover:visible"
              >
                <RxCross2 />
              </button>

              {/* Resize Handle */}
              <div
                onMouseDown={(e) => {
                  handleResize(e, table?.name as string)
                  handleDragEnd()
                }}
                onTouchStart={(e) => {
                  handleResize(e, table?.name as string)
                  handleDragEnd()
                }}
                className={styles(
                  "absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-full invisible group-hover:visible",
                  {
                    "p-1 left-[50%] transform -translate-x-1/2":
                      table.type === "Circle",
                  }
                )}
                // className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-full invisible group-hover:visible"
                style={{ touchAction: "none" }} // Prevent page scrolling during resize
              />

              {/* Rotate Handle */}
              <div
                onMouseDown={(e) => handleRotate(e, table?.name as string)}
                onTouchStart={(e) => handleRotate(e, table?.name as string)}
                className={styles(
                  "absolute top-0 left-0 w-6 h-6 cursor-pointer rounded-full flex justify-center items-center text-white invisible group-hover:visible",
                  {
                    "p-1 top-[50%] transform -translate-y-1/2":
                      table?.type === "Circle",
                  }
                )}
                // className="absolute top-0 left-0 w-6 h-6 cursor-pointer rounded-full flex justify-center items-center invisible group-hover:visible bg-primaryColor text-white"
              >
                <TbRotate2 />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <DraggableTableCreate
          newTableData={newTableData}
          setNewTableData={setNewTableData}
          setIsCreateModalOpen={setIsCreateModalOpen}
          createTable={createTable}
          setNewTableShape={setNewTableShape}
        />
      )}

      {isEditModalOpen && (
        <DraggableTableEdit
          newTableData={newTableData}
          setNewTableData={setNewTableData}
          setIsEditModalOpen={setIsEditModalOpen}
          saveEdit={saveEdit}
        />
      )}

      {isDetailsModalOpen && selectedTable && (
        <DraggableTableDetails
          setIsDetailsModalOpen={setIsDetailsModalOpen}
          selectedTable={selectedTable}
        />
      )}

      {isOpenFloorCreate && (
        <CreateFloor
          setIsOpenFloorCreate={setIsOpenFloorCreate}
          mutate={mutateFloors}
        />
      )}

      {rightModalOpen && (
        <ModalRightToLeft
          rightModalOpen={true}
          handleCloseModal={handleCloseModal}
        >
          <Pos />
        </ModalRightToLeft>
      )}
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-3" style={{zIndex: 1000}}>
          <div className="bg-white rounded-lg shadow-2xl w-96 md:w-[450px] p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-6 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowOrderModal(false)}
            >
              <RxCross2 size={24} />
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
              Order Details
            </h2>

            {/* Order Information */}
            <div className="space-y-4 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Order ID :</span>
                <span className="text-gray-800">{selectedOrder?.name}</span>
              </div>
              {/* <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Customer:</span>
          <span className="text-gray-800">{selectedOrder?.customer_name}</span>
        </div> */}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Table :</span>
                <span className="text-gray-800">{selectedOrder?.table}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Status :</span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    selectedOrder?.status === "Ready for Pickup"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedOrder?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">
                  Total Amount :
                </span>
                <span className="text-lg font-bold text-gray-800">
                  ৳{selectedOrder?.total_amount}
                </span>
              </div>
            </div>

            {/* Item List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Items :
              </h3>
              <ul className="divide-y divide-gray-200">
                {selectedOrder?.item_list?.map((item: any, index: number) => (
                  <li
                    key={index}
                    className="py-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm md:text-base">{item?.item}</p>
                      <p className="text-sm md:text-base text-gray-600">
                        {item?.qty} x ৳{item?.rate}
                      </p>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      ৳{item?.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <button
              className="w-full bg-primaryColor mt-6 text-white py-2 rounded-lg font-semibold"
              onClick={() => setShowOrderModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableTable;
