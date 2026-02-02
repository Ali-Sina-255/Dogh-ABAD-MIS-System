import React from "react";
import { BiBed, BiBookAdd, BiGroup, BiHome } from "react-icons/bi";
import { FaAmbulance, FaChevronDown, FaHeartbeat } from "react-icons/fa";
import { FaClipboardUser } from "react-icons/fa6";
import { GiCoins } from "react-icons/gi";
const AdminMainPage = () => {
  const overviewdata = [
    {
      title: "Expert Teams ",
      number: 354,
      icon: <BiGroup size={24} className="text-blue-500" />,
    },

    {
      title: "Earn Certificates ",
      number: "2345234",
      icon: <GiCoins size={24} className="text-yellow-500" />,
    },
    {
      title: "Enrollments",
      number: 845745245,
      icon: <GiCoins size={24} className="text-yellow-500" />,
    },
    {
      title: "All Students ",
      number: 234523523,
      icon: <GiCoins size={24} className="text-yellow-500" />,
    },
  ];
  return (
    <div className="">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-x-5">
        {overviewdata.map((item, index) => (
          <div
            key={index}
            className="h-[100px] xl:h-[120px] bg-white shadow-md rounded-lg px-10 py-4 flex justify-between items-center"
          >
            <div className="flex items-center justify-center gap-x-7">
              <span className="p-3 rounded-full border">{item.icon}</span>
              <div>
                <span className="text-xl font-bold">{item.number}</span>
                <p className="font-semibold text-gray-700">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMainPage;
