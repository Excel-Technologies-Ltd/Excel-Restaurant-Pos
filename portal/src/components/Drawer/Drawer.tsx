import { DrawerProps } from "../CartModal/AllCarts";


const Drawer = ({ children, isOpen, isLargeDevice }: DrawerProps) => {
    if (isLargeDevice) {
        return (
            <div
                style={{ zIndex: 999 }}
                className={`fixed inset-0 z-50 flex items-center justify-center p-4  ${isOpen ? "bg-black bg-opacity-50" : "hidden"
                    }`}
            >
                <div
                    className={`bg-white rounded-lg shadow-lg transition-transform duration-500 ease-in-out ${isOpen ? "scale-100" : "scale-0"
                        } md:max-w-lg w-full h-auto`}
                >
                    {children}
                </div>
            </div>
        );
    } else {
        return (
            <div className="h-[100vh] w-full" style={{ zIndex: 999 }}>
                <div
                    style={{ zIndex: 999 }}
                    className={`drawer-bottom bg-white shadow-lg transition-transform duration-500 ease-in-out z-50 ${isOpen ? "translate-y-0" : "translate-y-full"
                        } fixed bottom-0 left-0 w-full min-h-full `} //min-h-[100%]
                >
                    {children}
                </div>
            </div>
        );
    }
};


export default Drawer;