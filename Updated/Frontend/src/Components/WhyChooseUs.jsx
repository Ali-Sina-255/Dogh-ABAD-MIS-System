
import { FaRegThumbsUp, FaClock, FaDollarSign } from "react-icons/fa";

function WhyChooseUs() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          چرا ما را انتخاب کنید؟
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Quality Assurance */}
          <div className="p-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg text-center">
            <FaRegThumbsUp className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              تضمین کیفیت
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              ما از بهترین مواد و تکنیک‌های چاپ برای تضمین کیفیت محصولات شما
              استفاده می‌کنیم.
            </p>
          </div>

          {/* Fast Turnaround */}
          <div className="p-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg text-center">
            <FaClock className="text-5xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              تحویل سریع
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              سفارشات شما را با سرعت و دقت بالا به شما تحویل می‌دهیم تا در کسب و
              کارتان تاخیر نداشته باشید.
            </p>
          </div>

          {/* Affordable Pricing */}
          <div className="p-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg text-center">
            <FaDollarSign className="text-5xl text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              قیمت‌های مناسب
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              ما خدمات با کیفیت را با قیمت‌های مقرون به صرفه ارائه می‌کنیم تا در
              هزینه‌های خود صرفه‌جویی کنید.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
