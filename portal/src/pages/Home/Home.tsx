import BottomNav from "../../components/common/BottomNav";
import Hero from "./components/Hero";

const Home = () => {
  return (
    <div>
      <Hero />
      <BottomNav className="h-14 w-full fixed bottom-0 border-t flex justify-between items-center bg-bgColor" />
    </div>
  );
};

export default Home;
