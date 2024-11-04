
import { IoArrowBackOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

function Error() {
    return (
        <div className="flex items-center justify-center  h-screen bg-slate-800 overflow-hidden">
            <div className="text-center">
                <h1 className="text-[150px] font-bold text-red-600">404</h1>
                <p className="text-2xl text-gray-50  mb-5">Oops! Page not found.</p>
                <p className="text-gray-100">
                    The page you are looking for might be under construction or does not
                    exist.
                </p>
                <div className="flex justify-center">
                    <Link
                        to="/"
                        className="mt-8 rounded-md !bg-primary text-white text-xs 2xl:text-sm px-3 py-2 flex gap-2 items-center w-fit"
                    >
                        <IoArrowBackOutline size={14} /> Go back
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Error;
