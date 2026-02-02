import React from "react";
import { motion } from "framer-motion";

const MarqueeItem = ({ images = [] }) => {
  // Duplicate images to create an infinite loop effect
  const duplicatedImages = [...images, ...images];

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          ease: "linear",
          duration: 15, // Adjust speed
          repeat: Infinity,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <img key={index} className="h-40 w-56 mr-10" src={image} alt="Customer" />
        ))}
      </motion.div>
    </div>
  );
};

export default MarqueeItem;
