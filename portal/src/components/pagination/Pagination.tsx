import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
  
  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalDataCount: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
  }
  
  const Pagination = ({
    currentPage,
    totalPages,
    totalDataCount,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
  }: PaginationProps) => {
    // Function to generate page numbers
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage === 1) {
          pages.push(currentPage, currentPage + 1, currentPage + 2);
        } else if (currentPage === totalPages) {
          pages.push(currentPage - 2, currentPage - 1, currentPage);
        } else {
          pages.push(currentPage - 1, currentPage, currentPage + 1);
        }
      }
      return pages;
    };
  
    const pageNumbers = getPageNumbers();
  
    // Calculate the data range for the current page
    const startDataIndex = (currentPage - 1) * itemsPerPage + 1;
    const endDataIndex =
      currentPage * itemsPerPage > totalDataCount
        ? totalDataCount
        : currentPage * itemsPerPage;

    if(totalDataCount === 0 || totalDataCount === undefined) {
      return null;
    }
  
    return (
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4 mt-6">
        {/* Showing data information */}
        <div className="text-gray-600 text-[13px] sm:text-sm">
          Showing{" "}
          <span className="font-semibold">
            {startDataIndex}-{endDataIndex}{" "}
          </span>
          from <span className="font-semibold">{totalDataCount} </span> data
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
        <select
            className="border border-gray-300 text-gray-600 h-8 rounded px-3 py-1 text-[13px] sm:text-sm focus:outline-none focus:ring focus:ring-primary focus:border-primary bg-white"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
  
        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          <button
            className={`h-8 w-8 rounded-md text-[13px] sm:text-sm flex justify-center items-center ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "border border-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardDoubleArrowLeft className="h-4 w-4" />
          </button>
  
          {/* Previous Button */}
          <button
            className={`h-8 w-8 rounded-md text-[13px] sm:text-sm hidden sm:flex justify-center items-center ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "border border-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft className="h-4 w-4" />
          </button>
  
          {/* Dynamic Page Numbers */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`h-8 w-8 rounded-md text-[13px] sm:text-sm flex justify-center items-center ${
                page === currentPage
                  ? "bg-primaryColor text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
  
          {/* Next Button */}
          <button
            className={`h-8 w-8 rounded-md text-[13px] sm:text-sm hidden sm:flex justify-center items-center ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "border border-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight className="h-4 w-4" />
          </button>
  
          {/* Last Page Button */}
          <button
            className={`h-8 w-8 rounded-md text-[13px] sm:text-sm flex justify-center items-center ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "border border-gray-200 text-gray-700"
            }`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardDoubleArrowRight className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
    );
  };
  
  export default Pagination;
  