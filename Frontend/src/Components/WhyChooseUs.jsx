import { FaRegThumbsUp, FaClock, FaDollarSign } from "react-icons/fa";
import { Award, Gauge, DollarSign, Lightbulb, Cpu } from "lucide-react";
function WhyChooseUs() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-Ray_black font-bold text-center text-gray-800 dark:text-white mb-8">
          امتیازات ما
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Quality Assurance */}
          <div className="p-4 bg-gray-200 dark:bg-primary shadow-md rounded-lg text-center">
            <Award className=" text-green mx-auto mb-4" size={50} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              کیفیت بالا
            </h3>
            <p className="text-gray-800 dark:text-gray-300">
              استفاده از مواد اولیه درجه یک و ماشین‌آلات مطلوب برای ارائه بهترین
              کیفیت چاپ.
            </p>
          </div>

          {/* Fast Turnaround */}
          <div className="p-4 bg-gray-200 dark:bg-primary shadow-md rounded-md text-center">
            <Gauge className=" text-green  mx-auto mb-4" size={50} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              سرعت عمل
            </h3>
            <p className="text-gray-800 dark:text-gray-300">
              توانایی تحویل سریع سفارشات و درخواست‌های فوری.
            </p>
          </div>

          {/* Affordable Pricing */}
          <div className="p-4 bg-gray-200 dark:bg-primary shadow-md rounded-md text-center">
            <DollarSign className=" text-green mx-auto mb-4" size={50} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              قیمت‌های رقابتی
            </h3>
            <p className="text-gray-800 dark:text-gray-300">
              ارائه خدمات با کیفیت بالا با قیمت‌هایی مناسب و رقابتی.
            </p>
          </div>
          {/* Affordable Pricing */}
          <div className="p-4 bg-gray-200 dark:bg-primary shadow-md rounded-md text-center">
            <Cpu
              className=" text-green mx-auto mb-4"
              strokeWidth={2}
              size={50}
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              نوآوری و فناوری
            </h3>
            <p className="text-gray-800 dark:text-gray-300">
              به‌روزرسانی مداوم تجهیزات و فرآیندها برای بهره‌برداری از
              مطلوب‌ترین فناوری‌ها در صنعت چاپ.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
