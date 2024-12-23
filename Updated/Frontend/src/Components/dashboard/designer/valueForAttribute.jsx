import axios from "axios";
import React, { useState, useEffect } from "react";

const ValueForAttributes = () => {
  const BASE_URL = "http://localhost:8000";

  const [categories, setCategories] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]); // Store all attributes fetched
  const [filteredAttributes, setFilteredAttributes] = useState([]); // Attributes filtered by category
  const [values, setValues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attributeTypes, setAttributeTypes] = useState("");


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
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/group/categories/`);
      setCategories(response.data);
    } catch (error) {
      setMessage("خطا در دریافت اطلاعات کتگوری‌ها.");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttributes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/group/attribute-types/`);
      setAllAttributes(response.data);
      console.log(response);
    } catch (error) {
      setMessage("خطا در دریافت مشخصه‌ها.");
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchAllAttributes();
    fetchAttributeTypes()
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Filter attributes based on selected category ID
      const filtered = allAttributes.filter(
        (attribute) => attribute.category === parseInt(selectedCategory)
      );
      setFilteredAttributes(filtered);
    } else {
      setFilteredAttributes([]);
    }
  }, [selectedCategory, allAttributes]);

  const handleAddValue = async () => {
    if (!newValue || !newType) {
      setMessage("لطفاً تمامی مقادیر را وارد کنید.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/group/attribute-values/`, {
        value: newValue,
        type: newType,
        attributeId: selectedAttribute,
      });

      setValues([...values, response.data]);
      setNewValue("");
      setNewType("");
      setMessage("مقدار با موفقیت اضافه شد.");
    } catch (error) {
      setMessage("خطا در افزودن مقدار جدید.");
      console.error("Error adding value:", error);
    }
  };

  const handleDeleteValue = async (valueId) => {
    try {
      await axios.delete(`${BASE_URL}/group/attribute-values/${valueId}/`);
      setValues(values.filter((value) => value.id !== valueId));
      setMessage("مقدار با موفقیت حذف شد.");
    } catch (error) {
      setMessage("خطا در حذف مقدار.");
      console.error("Error deleting value:", error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">
        مدیریت مقدار مشخصه‌ها
      </h2>

      {message && <p className="mb-4 text-red-600">{message}</p>}

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2 text-gray-700">
          انتخاب کتگوری
        </label>
        <select
          className="p-3 border rounded w-full bg-white focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedAttribute("");
          }}
          disabled={loading}
        >
          <option value="" disabled>
            {loading ? "در حال بارگذاری..." : "کتگوری را انتخاب کنید"}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attribute Selection */}
      {selectedCategory && (
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-gray-700">
            انتخاب مشخصه
          </label>
          <select
            className="p-3 border rounded w-full bg-white focus:ring-2 focus:ring-blue-500"
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
          >
            <option value="" disabled>
              مشخصه را انتخاب کنید
            </option>
            {filteredAttributes.map((attribute) => (
              <option key={attribute.id} value={attribute.id}>
                {attribute.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Value and Type Inputs */}
      {selectedAttribute && (
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2 text-gray-700">
              مقدار مشخصه
            </label>
            <input
              type="text"
              className="p-3 border rounded w-full bg-white focus:ring-2 focus:ring-blue-500"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="مقدار را وارد کنید"
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
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
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
          <button
            onClick={handleAddValue}
            disabled={!newValue || !newType}
            className={`w-full py-3 px-6 ${
              newValue && newType
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300"
            } text-white font-semibold rounded shadow transition duration-200`}
          >
            افزودن مقدار
          </button>
        </div>
      )}

      {/* Values List */}
      <ul className="space-y-4">
        {values.map((value) => (
          <li
            key={value.id}
            className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
          >
            <span className="font-medium">
              {value.value} - {value.type}
            </span>
            <button
              className="text-red-500 hover:text-red-600"
              onClick={() => handleDeleteValue(value.id)}
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValueForAttributes;
