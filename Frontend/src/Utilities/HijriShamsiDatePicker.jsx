import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toJalaali, toGregorian } from "jalaali-js";

const HijriShamsiDatePicker = ({ value, onChange }) => {
  const [startDate, setStartDate] = useState(value ? new Date(value) : null);

  const handleDateChange = (date) => {
    setStartDate(date);
    const gregorianDate = toGregorian(
      toJalaali(date).jy,
      toJalaali(date).jm,
      toJalaali(date).jd
    );
    const formattedDate = new Date(
      gregorianDate.gy,
      gregorianDate.gm - 1,
      gregorianDate.gd
    );
    onChange(formattedDate);
  };

  return (
    <DatePicker
      selected={startDate}
      onChange={handleDateChange}
      dateFormat="yyyy/MM/dd"
      className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
      placeholderText="تاریخ تحویل را انتخاب کنید"
    />
  );
};

export default HijriShamsiDatePicker;
