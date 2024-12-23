import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Slider = () => {
  const [sliders, setSliders] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Set up Axios default headers with token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    } else {
      console.warn("No token found in localStorage. Ensure you're logged in.");
    }
  }, []);
  const fetchSliders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/common/upload-image/"
      );
      if (response.status === 200) {
        setSliders(response.data);
        console.log("Fetched sliders:", response.data);
      } else {
        setError("Failed to load data. Please try again later.");
      }
    } catch (error) {
      setError("An error occurred while loading the data.");
    }
  };
  // Fetch existing images
  useEffect(() => {
    fetchSliders();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    const form = new FormData();

    // Ensure an image is selected
    if (formData.image) {
      form.append("image", formData.image);
    } else {
      setError("Please select an image to upload.");
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (selectedImageId) {
        // Update existing image
        response = await axios.put(
          `http://localhost:8000/common/upload-image/${selectedImageId}/`,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Token ${token}`,
            },
          }
        );
        if (response.status === 200) {
          Swal.fire("Updated!", "The image has been updated.", "success");

          // Update the slider in the state with the new image URL
          setSliders((prevSliders) =>
            prevSliders.map((slider) =>
              slider.id === selectedImageId
                ? { ...slider, images: response.data.images } // Ensure this is the full URL
                : slider
            )
          );
          setSelectedImageId(null);
        } else {
          Swal.fire("Error", "Failed to update the image.", "error");
        }
      } else {
        // Create new image
        response = await axios.post(
          "http://localhost:8000/common/upload-image/",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Token ${token}`,
            },
          }
        );
        if (response.status === 201) {
          Swal.fire("Added!", "The image has been added.", "success");

          setSliders((prevSliders) => [...prevSliders, response.data]);
          fetchSliders();
        } else {
          Swal.fire("Error", "Failed to add the image.", "error");
        }
      }
    } catch (error) {
      console.error("Error submitting image:", error);
      if (error.response) {
        setError(
          `An error occurred: ${
            error.response.data.detail || "Failed to submit the image."
          }`
        );
      } else {
        setError("An error occurred while submitting the image.");
      }
    } finally {
      setIsSubmitting(false);
      setFormData({ id: "", image: null });
    }
  };

  // Handle editing an image
  const handleEdit = (image) => {
    setFormData({ id: image.id, image: null });
    setSelectedImageId(image.id);
  };

  // Handle deleting an image
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8000/common/upload-image/${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 204) {
        Swal.fire("Deleted!", "The image has been deleted.", "success");
        setSliders(sliders.filter((slider) => slider.id !== id));
      } else {
        Swal.fire("Error", "Failed to delete the image.", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        `An error occurred: ${
          error.response
            ? error.response.data.detail
            : "Failed to delete the image."
        }`,
        "error"
      );
    }
  };

  const BASE_URL = "http://localhost:8000";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">مدیریت اسلایدر</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          name="image"
          placeholder="آدرس تصویر"
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "در حال ارسال..."
            : selectedImageId
            ? "ویرایش"
            : "افزودن"}
        </button>
      </form>

      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">شناسه</th>
            <th className="border px-4 py-2">تصویر</th>
            <th className="border px-4 py-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {sliders.map((slider) => (
            <tr key={slider.id}>
              <td className="border px-4 py-2">{slider.id}</td>
              <td className="border px-4 py-2">
                {slider.images ? (
                  <img
                    src={`${BASE_URL}${slider.images}`} // Ensure the path is correct for displaying images
                    alt={`Slider ${slider.id}`}
                    width={100}
                    className="object-cover"
                  />
                ) : (
                  <span>No image available</span>
                )}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(slider)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(slider.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded ml-2"
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

export default Slider;