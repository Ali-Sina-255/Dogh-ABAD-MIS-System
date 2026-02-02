import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2 for alerts
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { IoTrashSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import SubcategoryForm from "./subproduct";
import Pagination from "../../../Utilities/Pagination";
const Services = () => {
  const fileInputRef = useRef(null);
  const [services, setServices] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [editingService, setEditingService] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/common/categories/`);
        setServices(response.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطا",
          text: "در دریافت خدمات مشکلی پیش آمده است!",
          width: "300px",
          padding: "1rem",
        });
      }
    };

    fetchServices();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });

      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage(imageUrl);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission (Add or Update)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    // ✅ Log FormData before sending
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      let response;
      if (editingService) {
        setEditing(true);
        console.log(data);

        response = await axios.put(
          `${BASE_URL}/common/categories/${editingService.id}/`,
          data, // ✅ Changed formData to data
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === editingService.id ? response.data : service
          )
        );

        Swal.fire({
          icon: "success",
          title: "ویرایش شد",
          text: "خدمت با موفقیت ویرایش شد!",
          width: "300px",
        });
        setEditingService(null);
      } else {
        setAdding(true);

        response = await axios.post(
          `${BASE_URL}/common/categories/`,
          data, // ✅ Changed formData to data
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setServices((prevServices) => [...prevServices, response.data]);

        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "خدمت جدید اضافه شد!",
          width: "300px",
        });
      }

      setFormData({ name: "", description: "", image: null });
      setCurrentImage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error response:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "خطا",
        text:
          error.response?.data?.message ||
          "مشکلی در ارسال درخواست پیش آمده است!",
        width: "300px",
      });
    } finally {
      setEditing(false);
      setAdding(false);
    }
  };

  // Handle edit
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      image: null,
    });

    setCurrentImage(service.image ? `${service.image}` : "");
  };

  // Handle delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "لغو",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${BASE_URL}/common/categories/${id}/`
          );
          if (response.status === 204) {
            setServices((prevServices) =>
              prevServices.filter((service) => service.id !== id)
            );
            Swal.fire("حذف شد!", "خدمت با موفقیت حذف گردید.", "success");
          }
        } catch (error) {
          console.error("Error deleting service:", error);
          Swal.fire(
            "خطا!",
            "حذف خدمت ناکام بود. لطفاً بعداً دوباره تلاش کنید.",
            "error"
          );
        }
      }
    });
  };

  //  pagination section
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;

  // Calculate pagination
  const totalPages = Math.ceil(services.length / postsPerPage);
  const paginatedOrders = [...services] // Create a copy to avoid mutation
    .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="bg-gray-200 w-full py-10 ">
      <div className="max-w-3xl mx-auto p-2 shadow-lg bg-white rounded-md">
        <h2 className="md:text-xl text-base text-center font-bold mb-4">
          افزودن محصول جدید
        </h2>
        <form
          onSubmit={handleSubmit}
          className=" border-t m-1  p-2 flex flex-col justify-center items-center space-y-4"
        >
          <div className="relative w-full">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="اسم محصول"
              value={formData.name}
              onChange={handleChange}
              className="peer w-full border-b border-gray-600 bg-transparent py-1.5 px-1 text-base focus:outline-none focus:border-blue-600"
            />

            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-green transition-all peer-focus:w-full"></span>
          </div>

          <textarea
            name="description"
            placeholder=" جزییات درباره محصول"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="border p-2 w-full focus:outline-1 outline-green"
          ></textarea>
          <div className="w-full">
            {currentImage && (
              <div className="mb-2 flex w-full justify-start">
                <img
                  src={`${currentImage}`}
                  alt="Current Image"
                  className="w-[50px] h-[50px] object-cover"
                />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              name="image"
              onChange={handleChange}
              className="border p-1.5 hover:bg-white w-full rounded-sm"
            />
          </div>
          <button
            disabled={adding || editing}
            type="submit"
            className={`secondry-btn ${
              adding || editing ? "cursor-not-allowed" : ""
            }`}
          >
            {editingService ? "ویرایش" : "افزودن"}
          </button>
        </form>
      </div>
      <div className="p-5 mt-3">
        <p className="text-xl font-Ray_black font-bold text-center">
          {" "}
          لیست محصولات
        </p>
      </div>
      <div className="w-[300px] md:w-[700px] lg:w-[90%] mx-auto overflow-x-scroll lg:overflow-hidden">
        <table className="w-full  rounded-lg border  border-gray-300 shadow-md">
          <thead>
            <tr className="bg-green text-gray-100 text-center">
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                شناسه
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                نام
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                توضیحات
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                تصویر
              </th>
              <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? (
              paginatedOrders.map((service) => (
                <tr
                  key={service.id}
                  className="text-center border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                >
                  <td className=" border-gray-300 px-6 py-2 text-gray-700">
                    {service.id}
                  </td>
                  <td className=" border-gray-300 text-center px-6 py-2 text-gray-700">
                    {service.name}
                  </td>
                  <td className=" border-gray-300 px-6 py-2 text-gray-600">
                    {service.description.length > 30
                      ? `${service.description.substring(0, 30)}...`
                      : service.description}
                  </td>
                  <td className=" border-gray-300 text-center px-6 py-2">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-14 h-10 object-cover rounded-lg border  border-gray-300 shadow-sm"
                      />
                    )}
                  </td>
                  <td className=" px-6 py-2 flex justify-center gap-x-5">
                    <button
                      onClick={() => handleEdit(service)}
                      className=" text-green px-1 py-1 rounded-md transition-all"
                    >
                      <FaRegEdit size={24} />
                    </button>
                    <button
                      disabled={deleting}
                      onClick={() => handleDelete(service.id)}
                      className=" text-red-500 px-1 py-1 rounded-md transition-all disabled:opacity-50"
                    >
                      <IoTrashSharp size={24} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="border px-6 py-3 text-center text-gray-500"
                >
                  خدماتی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Component */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <SubcategoryForm />
    </div>
  );
};

export default Services;
