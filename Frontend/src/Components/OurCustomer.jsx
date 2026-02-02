import React, { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const OurCustomer = () => {
  const [customersLogo, setCustomersLogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomersLogo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/common/customer-images/`);
        setCustomersLogo(response.data);
      } catch (err) {
        setError("خطایی رخ داده است.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomersLogo();
  }, []);

  return (
    <div className="px-4 py-10 relative">
      <h1 className="text-2xl text-center font-Ray_black  font-bold text-gray-800 dark:text-gray-100 mb-8">
        مشتریان ما
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-center">در حال بارگذاری...</p>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 7 },
          }}
          loop={true}
          autoplay={{
            delay: 1000,
            disableOnInteraction: false,
          }}
          className="mySwiper"
        >
          {[...customersLogo, ...customersLogo].map((customer, index) => (
            <SwiperSlide
              key={index}
              onMouseEnter={(e) =>
                e.target.closest(".swiper")?.swiper.autoplay.stop()
              }
              onMouseLeave={(e) =>
                e.target.closest(".swiper")?.swiper.autoplay.start()
              }
            >
              <div className="h-40 w-[200px] flex-shrink-0 inline-block">
                <div className="w-full h-full flex items-center  flex-col">
                  <img
                    src={customer.image}
                    alt={`Customer ${customer.id}`}
                    className="w-full h-28 rounded-lg object-contain"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {/* Navigation Buttons */}
      <div
        onMouseDown={(e) => e.preventDefault()}
        className="custom-prev cursor-pointer hidden md:flex w-[30px] h-[30px] items-center justify-center rounded-full absolute top-1/2 -translate-y-1/2 -left-4 z-20 bg-green/50 shadow-md"
      >
        <MdArrowBackIos />
      </div>
      <div
        onMouseDown={(e) => e.preventDefault()}
        className="custom-next hidden cursor-pointer md:flex w-[30px] h-[30px] items-center justify-center rounded-full absolute top-1/2 -translate-y-1/2 -right-4 z-20 bg-green/50 shadow-md"
      >
        <MdArrowForwardIos />
      </div>
    </div>
  );
};

export default OurCustomer;
