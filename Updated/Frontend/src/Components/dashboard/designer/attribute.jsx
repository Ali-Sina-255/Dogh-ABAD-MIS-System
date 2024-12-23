import React, { useState, useEffect } from "react";
import axios from "axios";

const Attribute = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attribute, setAttribute] = useState("");
  const [type, setType] = useState("");

  const [responseMessage, setResponseMessage] = useState("");

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/group/categories/"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch attribute types from the API
  const fetchAttributeTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/group/attribute-choices/"
      );
      setAttributeTypes(response.data);
    } catch (error) {
      console.error("Error fetching attribute types:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAttributeTypes();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data
    const data = {
      name: attribute,
      attribute_type: type, // Send the ID of the selected attribute type
      category: selectedCategory, // Send the ID of the selected category
    };

    try {
      // Send the data to the API
      console.log(data);

      const response = await axios.post(
        "http://localhost:8000/group/attribute-types/",
        data
      );

      if (response.status === 201) {
        setResponseMessage("اطلاعات با موفقیت ثبت شد.");
      } else {
        setResponseMessage("مشکلی در ارسال اطلاعات وجود دارد.");
      }

      // Clear the form
      setSelectedCategory("");
      setAttribute("");
      setType("");
    } catch (error) {
      console.error("Error sending data:", error);
      setResponseMessage("ارسال اطلاعات با خطا مواجه شد.");
    }

    // Clear the response message after 3 seconds
    setTimeout(() => {
      setResponseMessage("");
    }, 3000);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-4">انتخاب کتگوری و ویژگی‌ها</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            کتگوری را انتخاب کنید
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- لطفاً انتخاب کنید --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Attribute Input */}
        <div>
          <label
            htmlFor="attribute"
            className="block text-sm font-medium text-gray-700"
          >
            ویژگی
          </label>
          <input
            type="text"
            id="attribute"
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            placeholder="ویژگی را وارد کنید"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Type Dropdown */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            نوع
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- لطفاً انتخاب کنید --</option>
            {attributeTypes.map((attributeType) => (
              <option key={attributeType.id} value={attributeType.id}>
                {attributeType.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ارسال
        </button>
      </form>

    </div>
  );
};

export default Attribute;
