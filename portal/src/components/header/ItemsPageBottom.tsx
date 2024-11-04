import BottomNav from "../common/BottomNav";

const ItemsPageBottom = () => {
  // Sample cart item count
  // const cartItemCount = 5; // Replace with your dynamic count

  return (
    <>
      <BottomNav className="h-14 w-full fixed bottom-0 border-t flex justify-between items-center bg-bgColor" />
      {/* <div className="h-12 w-full fixed bottom-0 border-t flex justify-between items-center bg-bgColor">
        <div className="">
          <div className="relative mt-[-40px] p-2 shadow-sm bg-bgColor rounded-full">
            <IoCartOutline
              size={30}
              className=" text-red-500 bg-gray-300 h-12 w-12 rounded-full p-2"
            />
            {cartItemCount > 0 && (
              <div className="absolute top-[10px] right-1 text-[white] bg-mainColor bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-xs">
                {cartItemCount}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center bg-mainColor h-full w-1/4">
          <p className="text-[white]">Check Out</p>
        </div>
      </div> */}
    </>
  );
};

export default ItemsPageBottom;
