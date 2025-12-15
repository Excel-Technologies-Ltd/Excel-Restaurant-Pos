import { Link } from "react-router-dom";
import { URLDashboard } from "../../routes/routes-link";

const NotFoundPage = () => {
  return (
    <main 
      className="flex items-center justify-center h-screen bg-slate-200 overflow-hidden"
      role="main"
      aria-labelledby="error-title"
    >
      <div className="text-center">
        <h1 
          id="error-title"
          className="text-[150px] font-bold text-red-600"
          aria-label="404 Error"
        >
          404
        </h1>
        <p className="text-2xl text-gray-700 mb-5">
          Oops! Page not found.
        </p>
        <Link
          to={URLDashboard()}
          className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;