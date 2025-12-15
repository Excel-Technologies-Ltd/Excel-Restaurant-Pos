

function Error() {
    const handleRefresh = () => {
        window.location.reload();
      };
      
    return (
        <div className="flex items-center justify-center  h-screen bg-slate-200 overflow-hidden">
            <div className="text-center">
                <h1 className="text-[150px] font-bold text-red-600">500</h1>
                <p className="text-2xl text-gray-800  mb-5">Sorry, something went wrong.</p>
                <p className="text-gray-700 mb-5">
                Please try refreshing the page or come back later.
                </p>
                <div className="flex justify-center">
                <button
          onClick={handleRefresh}
          className="text-white bg-primaryColor px-4 py-2 rounded-full hover:bg-darkPrimary focus:outline-none focus:ring focus:border-blue-300"
        >
          Refresh
        </button>
                </div>
            </div>
        </div>
    );
}

export default Error;