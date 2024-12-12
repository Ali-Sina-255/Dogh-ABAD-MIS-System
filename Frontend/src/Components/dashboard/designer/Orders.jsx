import React, { useEffect, useState } from "react";

const OrderTable = () => {
  // Initial state for orders and categories
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("You are not logged in.");
        }

        // Fetch orders with token in headers
        const ordersResponse = await fetch(
          "http://localhost:8000/reception/receptions/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders");
        }
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
        console.log("Fetched Orders:", ordersData); // Log orders data to check its structure

        // Fetch categories with token in headers
        const categoriesResponse = await fetch(
          "http://localhost:8000/reception/categories/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        console.log("Fetched Categories:", categoriesData); // Log categories data to check its structure
      } catch (error) {
        setError(error.message); // Handle error
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Map category ID to category name for easy lookup
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name; // Map category id to name
    return acc;
  }, {});

  console.log("Category Map:", categoryMap); // Log category map to ensure it’s populated correctly

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">جدول سفارشات</h2>
      {/* Loading state */}
      {loading && <p>در حال بارگذاری...</p>} {/* "Loading..." in Persian */}
      {/* Error state */}
      {error && (
        <p className="text-red-500">{`You are not logged in: ${error}`}</p>
      )}{" "}
      {/* Error message in Persian */}
      {/* Orders table */}
      {!loading && !error && (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border px-4">نام مشتری</th>
              <th className="py-2 border px-4">نام سفارش</th>
              <th className="py-2 border px-4">توضیحات</th>
              <th className="py-2 border px-4">دسته‌بندی</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 border px-4">{order.customer_name}</td>
                <td className="py-2 border px-4">{order.order_name}</td>
                <td className="py-2 border px-4">{order.description}</td>
                {/* Access category name from categoryMap using category_id */}
                <td className="py-2 border px-4">
                  {categoryMap[order.category_id] || "دسته‌بندی نامشخص"}{" "}
                  {/* Display "Unknown Category" if not found */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderTable;
