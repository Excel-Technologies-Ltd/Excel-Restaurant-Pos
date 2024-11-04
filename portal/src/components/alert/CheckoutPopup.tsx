type Props = { handleClosePopup: () => void };

const CheckoutPopup = ({ handleClosePopup }: Props) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4"
      style={{ zIndex: 999 }}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full relative">
        <h2 className="text-lg font-semibold text-center">
          Checkout Successful!
        </h2>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Your order has been placed successfully.
        </p>
        <div className="text-center">
          <button
            onClick={handleClosePopup}
            className="bg-primaryColor text-white p-2 px-4 mt-4 rounded-md"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPopup;
