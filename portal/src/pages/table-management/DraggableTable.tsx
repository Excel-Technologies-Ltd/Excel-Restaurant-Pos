import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidEdit } from "react-icons/bi";
import { IoMdEye } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { TbRotate2 } from "react-icons/tb"; // Rotate icon
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "../../components/form-elements/Select";
import {
  closeRightModal,
  openRightModal,
} from "../../redux/features/modal/foodsModal";
import { debounce } from 'lodash';
import { RootState } from "../../redux/store/Store";
import { styles } from "../../utilities/cn";
import Pos from "../Admin/Pos/Pos";
import CreateFloor from "./CreateFloor";
import DraggableTableCreate from "./DraggableTableCreate";
import DraggableTableDetails from "./DraggableTableDetails";
import DraggableTableEdit from "./DraggableTableEdit";
import ModalRightToLeft from "./ModalRightToLeft";
import { useFrappeCreateDoc, useFrappeDocTypeEventListener, useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk";
import { RestaurantTable } from "../../types/ExcelRestaurantPos/RestaurantTable";

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
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [newTableShape, setNewTableShape] = useState<
    "Rectangle" | "Circle" | "Road"
  >("Rectangle");

  const { data: company } = useFrappeGetDocList("Company")
  const { data: floors, mutate } = useFrappeGetDocList("Restaurant Floor");
  useFrappeDocTypeEventListener("Restaurant Floor", (doc) => {
    mutate();
    console.log("doc", doc);
  });
  const [selectedFloor, setSelectedFloor] = useState<string>('')
  // console.log("selectedFloor", selectedFloor);


  const { updateDoc } = useFrappeUpdateDoc<RestaurantTable>();

  const updateTable = (table: RestaurantTable) => {
    if (table.name) {
      updateDoc("Restaurant Table", table.name, table)
    }
  }

  useEffect(() => {
    if (selectedFloor) {
      console.log("selectedFloor in useEffect", selectedFloor);
      setNewTableData(prev => ({
        ...prev,
        restaurant_floor: selectedFloor
      }))
    }
  }, [selectedFloor])

  const { createDoc, } = useFrappeCreateDoc<RestaurantTable>()

  const { data: tablesFromERP } = useFrappeGetDocList("Restaurant Table", {
    fields: ["*"],
    filters: [
      ["company", "=", company?.[0]?.name],
      ["restaurant_floor", "=", selectedFloor]
    ]
  })
  // useFrappeDocTypeEventListener("Restaurant Table", (doc) => {
  //   mutateTables();
  //   console.log("doc", doc);
  // });






  useEffect(() => {
    if (floors?.length) {
      if (!selectedFloor)
        setSelectedFloor(floors?.[0]?.name)
    }
    if (tablesFromERP) {
      const updatedTables = tablesFromERP.map((table) => ({
        ...table,
        length: +table.length,
        breadth: +table.breadth,
        position: JSON.parse(table.position)
      }))
      setTables(updatedTables)
    }
  }, [floors, selectedFloor, tablesFromERP])

  useEffect(() => {
    console.log("tablesFromERP", tablesFromERP);
    if (tablesFromERP) {
      // if the table is already in the state, then don't add it again
      const newTables = tablesFromERP.filter(table => !tables.some(t => t.name === table.name))
      setTables(prev => [...prev, ...newTables])
    }
  }, [])


  // console.log(floors);

  const dispatch = useDispatch();
  const rightModalOpen = useSelector(
    (state: RootState) => state.foodsModal.rightModalOpen
  );





  const initialNewTable: RestaurantTable =
  {
    id: new Date().toISOString(),
    table_no: "",
    type: "Rectangle",
    length: 180,
    breadth: 80,
    position: { x: 10, y: 55 },
    seat: "",
    company: company?.[0]?.name,
    restaurant_floor: '',
    rotation: '',
    bg_color: newTableShape == "Road" ? "#BFBFBF" : "#155e75",
  }


  const [newTableData, setNewTableData] = useState<RestaurantTable>(
    initialNewTable
  );



  // console.log({ tables });

  const headerRef = useRef<HTMLDivElement>(null); // Ref for the header

  // const bookedColor = "#880000";
  const navigate = useNavigate();
  const location = useLocation();

  const handleRightSideModal = (id: string) => {
    const params = new URLSearchParams(location.search);
    params.set("table", id);
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  }
  const handleCloseModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete("table");
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
    dispatch(closeRightModal());
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await fetch("/data.json");
  //     const data = await response.json();
  //     setTables(data);
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
  }, [tables]);




  const openCreateTableModal = () => {
    if (!floors?.length) return toast.error("Please create a floor first.");
    // console.log("initialNewTable", initialNewTable);
    console.log("selectedFloor", selectedFloor);
    setNewTableData(prev => {
      console.log("prev", prev);
      return {
        ...prev,
        restaurant_floor: selectedFloor
      }
    })
    setIsCreateModalOpen(true);
  };

  const createTable = () => {
    // console.log("newTableData in createTable", newTableData);

    if (!company?.[0]?.name) {
      toast.error("Please create a company first.");
      return;
    }

    if (!newTableData?.seat || !newTableData?.restaurant_floor || !newTableData?.type) {
      toast.error("Please fill in all the details before creating the table.");
      return;
    }

    const newTable = {
      ...newTableData,
      id: new Date().toISOString(),
    }

    createDoc(
      "Restaurant Table",
      newTable
    )

    setTables(prev => [...prev, newTable])

    // const newTable: RestaurantTable = {
    //   ...newTableData,
    // };

    // setTables((prev) => [...prev, newTable]);
    setIsCreateModalOpen(false);
    setNewTableData(initialNewTable);
  };

  const deleteTable = (idx: number) => {
    setTables((prev) => prev.filter((table) => table.idx !== idx));
  };

  const handleEdit = (name: string) => {
    const table = tables.find((t) => t.name === name);
    if (table) {
      setNewTableData({
        ...table,
      });
      setNewTableShape(table.type);
      setSelectedTable(table);
      setIsEditModalOpen(true);
    }
  };

  const saveEdit = () => {
    if (selectedTable) {
      setTables((prev) =>
        prev.map((table) =>
          table.idx === selectedTable.idx
            ? {
              ...table,
              seat: newTableData?.seat || table.seat,
              table_no: newTableData?.table_no || table.table_no,
              bg_color: newTableData?.bg_color || table.bg_color,
            }
            : table
        )
      );
      setIsEditModalOpen(false);
    }
  };

  const openFloorCreateModal = () => {
    setIsOpenFloorCreate(true);
  };

  const handleRotate = (e: React.MouseEvent | React.TouchEvent, name: string) => {
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
        "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const degrees = ((currentAngle - initialAngle) * 180) / Math.PI;

      setTables((prev) =>
        prev.map((t) =>
          t.name === name
            ? { ...t, rotation: (parseFloat(targetedTable.rotation || '0') + degrees).toString() }
            : t
        )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);

      // Update the table state after rotation ends
      const updatedTable = tables.find((table) => table.name === name);
      if (updatedTable) handleTableUpdate(updatedTable);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
  };

  // Custom Resize Functionality
  const handleResize = (e: React.MouseEvent | React.TouchEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    const targetTable = tables.find((table) => table.name === name);
    if (!targetTable) return;

    const initialLength = targetTable.length;
    const initialBreadth = targetTable.breadth;
    const initialClientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const initialClientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const newLength = Math.max(initialLength + clientX - initialClientX, 50);
      const newBreadth = Math.max(initialBreadth + clientY - initialClientY, 50);

      setTables((prev) =>
        prev.map((t) =>
          t.name === name
            ? {
              ...t,
              length: targetTable.type === "Circle" ? newLength : newLength,
              breadth: targetTable.type === "Circle" ? newLength : newBreadth,
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

      // Call handleTableUpdate with the updated table data after resizing ends
      const updatedTable = tables.find((table) => table.name === name);
      if (updatedTable) handleTableUpdate(updatedTable);
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
        "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY =
        "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

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

      // Update the table state after dragging ends
      const updatedTable = tables.find((table) => table.name === name);
      if (updatedTable) handleTableUpdate(updatedTable);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
  };



  // Debounced function to update the table data in the backend after a delay
  const debouncedSaveData = useCallback(
    debounce((data: RestaurantTable) => {
      updateTable(data); // Call the API to update the data after debounce delay
    }, 1000),
    [updateTable]
  );

  const handleTableUpdate = (updatedTable: RestaurantTable) => {
    setModifiedTable(updatedTable); // Update local state with the latest changes
    debouncedSaveData(updatedTable); // Debounce API call to reduce frequency
  };


  useEffect(() => {
    return () => {
      // Cancel the debounced function on unmount to avoid memory leaks
      debouncedSaveData.cancel();
    };
  }, [debouncedSaveData]);


  return (
    <div className="flex flex-col items-center bg-gray-200 h-[calc(100vh-48px)] w-full relative overflow-x-auto ">
      {/* Header with Ref */}
      <div
        ref={headerRef} // Set header ref
        className="w-full flex justify-between pb-2 pt-2 px-2 sticky top-0 left-0 bg-gray-200 border-b border-gray-300 z-10 header"
      >
        <div>
          <button
            onClick={() => openFloorCreateModal()}
            className="mr-2 main_btn bg-blue-500 hover:bg-blue-600"
          >
            Create Floor
          </button>
          <button
            onClick={() => openCreateTableModal()}
            className="main_btn"
          >
            Create Table
          </button>
        </div>
        {floors?.length && <div className="flex">
          <Select className="w-32 text-xs md:text-base" isHideSelect onChange={(e) => {
            setSelectedFloor(e.target.value)
            setNewTableData(prev => ({
              ...prev,
              restaurant_floor: e.target.value
            }))
          }}>
            {floors?.map((floor) => (
              <option value={floor?.name}>{floor?.name}</option>
            ))}
          </Select>
          {/* <button className="main_btn h-fit">Save</button> */}
        </div>}
      </div>

      <div className="w-full mt-8 absolute border-5">
        {tables.map((table) => (
          <div
            key={table.name}
            style={{
              width: table.type === "Circle" ? table.length : table.length,
              height: table.type === "Circle" ? table.length : table.breadth,
              left: `${table.position.x}px`,
              top: `${table.position.y}px`,
              borderRadius: table.type === "Circle" ? "50%" : "8px",
              // backgroundColor: table?.is_booked ? bookedColor : table.bg_color,
              backgroundColor: table.bg_color,
              transform: `rotate(${table.rotation || 0}deg)`,
            }}
            className="absolute cursor-move group"
            onMouseDown={(e) => handleDrag(e, table?.name as string)}
            onTouchStart={(e) => handleDrag(e, table?.name as string)}
          >
            <div className="relative h-full w-full justify-center items-center flex">
              {table?.seat && (
                <div className="absolute space-x-2 group-hover:visible visible z-30">
                  <button
                    onClick={() => handleEdit(table?.name as string)}
                    onTouchEnd={() => handleEdit(table?.name as string)}
                    className="bg-blue-500 bg-opacity-40 text-white px-2 py-1 rounded"
                  >
                    <BiSolidEdit />
                  </button>
                  <button
                    onClick={() => handleRightSideModal(table?.name as string)}
                    onTouchEnd={() => handleRightSideModal(table?.name as string)}
                    className="bg-green-500 bg-opacity-40 text-white px-2 py-1 rounded"
                  >
                    <IoMdEye />
                  </button>
                </div>
              )}

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
                              "w-3 h-10 bg-primaryColor rounded-e",
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
                              "w-3 h-10 bg-primaryColor rounded-s",
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
                onClick={() => deleteTable(table?.idx as number)}
                onTouchEnd={() => deleteTable(table?.idx as number)}
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

              <div
                onMouseDown={(e) => handleResize(e, table?.name as string)}
                onTouchStart={(e) => handleResize(e, table?.name as string)}
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
                      table.type === "Circle",
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
        <CreateFloor setIsOpenFloorCreate={setIsOpenFloorCreate} />
      )}

      {rightModalOpen && (
        <ModalRightToLeft
          rightModalOpen={true}
          handleCloseModal={handleCloseModal}
        >
          <Pos />
        </ModalRightToLeft>
      )}
    </div>
  );
};

export default DraggableTable;
