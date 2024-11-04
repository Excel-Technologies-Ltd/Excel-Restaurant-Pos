import React, { useEffect, useRef, useState } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

// Define the type for each item in the carousel
export interface CarouselItem {
  id: string;
  image: string;
  order: number;
  heading: string;
  description: string;
  orderLink: string;
}

// Define the props for the Carousel component
interface CarouselProps {
  data: CarouselItem[];
}

const Carousel: React.FC<CarouselProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Autoplay carousel every 0.7 seconds
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === data?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data?.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Wrapper */}
      <div
        ref={carouselRef}
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {data?.map((item) => (
          <div
            key={item?.id}
            className="relative min-w-full w-full flex items-center justify-center bg-gray-100"
          >
            {/* Slide Image */}
            <img
              src={item?.image}
              alt={item?.heading}
              className="w-full h-auto object-cover"
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-black bg-opacity-0 flex flex-col justify-center items-center text-center p-4">
              {/* <div className="bg-[#095468] bg-opacity-80 p-8 rounded-full shadow-lg border border-primaryColor"> */}
              {item?.heading && (
                <h2 className="text-4xl font-bold text-white hidden sm:block">
                  {item?.heading}
                </h2>
              )}
              {item?.description && (
                <p className="text-lg text-gray-200 mt-4 hidden sm:block">
                  {item?.description}
                </p>
              )}
              {item?.orderLink && (
                <a
                  href={item?.orderLink}
                  className="mt-6 inline-block bg-blue-500 text-white text-[9px] sm:text-[12px] py-1 sm:py-2 px-2 sm:px-4 rounded hover:bg-blue-700 transition"
                >
                  Order Now
                </a>
              )}
              {/* </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 h-7 w-7 sm:h-10 sm:w-10 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full shadow-lg flex justify-center items-center text-white"
        onClick={prevSlide}
      >
        <MdOutlineKeyboardArrowLeft className="text-xl sm:text-3xl" />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 h-7 w-7 sm:h-10 sm:w-10 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full shadow-lg flex justify-center items-center text-white"
        onClick={nextSlide}
      >
        <MdOutlineKeyboardArrowRight className="text-xl sm:text-3xl" />
      </button>
    </div>
  );
};

export default Carousel;
