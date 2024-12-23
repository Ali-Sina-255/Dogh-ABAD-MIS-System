import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2"; 

const AddOrder = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    order_name: "",
    description: "",
    category_id: "", // Change from category to category_id
    designer: "",
  });

  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Fetch categories from the backend when the component mounts
  useEffect(() => {
    const storedDesigner = localStorage.getItem("designerName");
    if (storedDesigner) {
      setFormData((prevState) => ({ ...prevState, designer: storedDesigner }));
    }

    // Fetch categories from the API
    fetchCategories();
  }, []);

  const getAuthHeaders = async () => {
    let token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You are not logged in. Please log in first.");
      return {};
    }

    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      token = await refreshAuthToken();
      if (!token) {
        return {};
      }
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/users/user/token/refresh/",
        { refresh: refreshToken }
      );
      const newAuthToken = response.data.access;
      const newRefreshToken = response.data.refresh;
      localStorage.setItem("auth_token", newAuthToken);
      localStorage.setItem("refresh_token", newRefreshToken);
      return newAuthToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert("Session expired. Please log in again.");
      localStorage.clear();
      return null;
    }
  };

  const fetchCategories = async () => {
    const headers = await getAuthHeaders();
    axios
      .get("http://localhost:8000/reception/categories/", { headers })
      .then((response) => {
        setCategories(response.data);
        console.log(response);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories!", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    if (name === "category_id" && value === "addNew") {
      setIsAddingCategory(true);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory) {
      try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
          "http://localhost:8000/reception/categories/",
          { name: newCategory },
          { headers }
        );
        const createdCategory = response.data;
        setCategories((prevCategories) => [...prevCategories, createdCategory]);
        setFormData((prevState) => ({
          ...prevState,
          category_id: createdCategory.id,
        }));
        setNewCategory("");
        setIsAddingCategory(false);
      } catch (error) {
        console.error("Error creating new category:", error);
        alert("Failed to create new category. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Order details:", formData);

    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        "http://localhost:8000/reception/receptions/",
        formData,
        { headers }
      );
      console.log("Order created successfully", response.data);

      // Show success message using Swal (SweetAlert2)
      Swal.fire({
        title: "Success!",
        text: "Order created successfully.",
        icon: "success", // Icon for success
        confirmButtonText: "OK",
        timer: 5000, // Auto close after 5 seconds
      });

      // Reset form after successful submission
      setFormData({
        customer_name: "",
        order_name: "",
        description: "",
        category_id: "",
        designer: "",
      });
    } catch (error) {
      console.error("There was an error creating the order!", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create order. Please try again.",
        icon: "error", // Icon for error
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">افزودن سفارش</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">نام مشتری:</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            placeholder="نام مشتری را وارد کنید"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium">نام سفارش:</label>
          <input
            type="text"
            name="order_name"
            value={formData.order_name}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            placeholder="نام سفارش را وارد کنید"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium">توضیحات:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            placeholder="توضیحات سفارش را وارد کنید"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium">دسته‌بندی:</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
          >
            <option value="" disabled>
              انتخاب دسته‌بندی
            </option>
            {categories.map((category, index) => (
              <option key={index} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value="addNew">+ افزودن دسته‌بندی جدید</option>
          </select>

          {isAddingCategory && (
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border rounded p-2 mr-2 w-full"
                placeholder="دسته‌بندی جدید را وارد کنید"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                افزودن
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        >
          ثبت سفارش
        </button>
      </form>
    </div>
  );
};

export default AddOrder;
