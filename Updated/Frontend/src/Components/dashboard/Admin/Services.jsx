import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2 for alerts

const Services = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [editingService, setEditingService] = useState(null); // For tracking which service is being edited
  const [currentImage, setCurrentImage] = useState(""); // For displaying the current image

  // Fetch services data when the component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/common/services/"
        );
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an error fetching the services!",
          width: "300px",
          padding: "1rem",
        });
      }
    };

    fetchServices();
  }, []);

  // Handle input change for text fields and file input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission for adding or updating
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingService) {
        // Update existing service
        const response = await axios.put(
          `http://localhost:8000/common/services/${editingService.id}/update/`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update service in the state after a successful update
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === editingService.id ? response.data : service
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Service updated successfully!",
          width: "300px",
          padding: "1rem",
        });
      } else {
        // Add new service
        const response = await axios.post(
          "http://localhost:8000/common/services/",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setServices((prevServices) => [...prevServices, response.data]);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Service added successfully!",
          width: "300px",
          padding: "1rem",
        });
      }

      // Reset form fields and editing state
      setFormData({
        title: "",
        description: "",
        image: null,
      });
      setEditingService(null);
      setCurrentImage("");
    } catch (error) {
      console.error("There was an error processing the request!", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error processing the request!",
        width: "300px",
        padding: "1rem",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      image: null, // Reset the image to allow the user to choose a new one if desired
    });

    // Check if the service has an image and set the current image URL for display
    if (service.image) {
      setCurrentImage(`http://localhost:8000${service.image}`);
    } else {
      setCurrentImage(""); // No image available
    }
  };

  // Handle delete button click with updated endpoint
  const handleDelete = async (id) => {
    try {
      // Send DELETE request to the specific endpoint
      await axios.delete(`http://localhost:8000/common/services/${id}/delete/`);
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== id)
      );
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Service deleted successfully!",
        width: "300px",
        padding: "1rem",
      });
    } catch (error) {
      console.error("There was an error deleting the service!", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error deleting the service!",
        width: "300px",
        padding: "1rem",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">مدیریت خدمات</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="عنوان"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          placeholder="توضیحات"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        ></textarea>
        <div>
          {currentImage && (
            <div className="mb-2">
              <img
                src={currentImage}
                alt="Current Image"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingService ? "ویرایش" : "افزودن"}
        </button>
      </form>

      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">شناسه</th>
            <th className="border px-4 py-2">عنوان</th>
            <th className="border px-4 py-2">توضیحات</th>
            <th className="border px-4 py-2">تصویر</th>
            <th className="border px-4 py-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="border px-4 py-2">{service.id}</td>
              <td className="border px-4 py-2">{service.title}</td>
              <td className="border px-4 py-2">{service.description}</td>
              <td className="border px-4 py-2">
                {service.image && (
                  <img src={service.image} alt={service.title} width={50} />
                )}
              </td>
              <td className="border px-4 py-2 flex justify-center space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Services;
