import React from "react";
import { RxArrowLeft } from "react-icons/rx";

const Button = ({ text = "Read More", onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex h-12 w-12 items-center gap-x-1 justify-center overflow-hidden rounded-full bg-[#02DB81] px-1 font-medium text-neutral-200 transition-all duration-300 hover:w-32 ${className}`}
    >
     
      <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:-translate-x-0 group-hover:opacity-100">
        {text}
      </div>
      <div className="absolute Left-0">
        <RxArrowLeft size={24} />
      </div>
    </button>
  );
};

export default Button;
