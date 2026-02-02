const [selectedClass, setSelectedClass] = useState(null);

const fetchClassDetails = async (id) => {
  try {
    const res = await axiosInstance.get(
      `/courses/student-classes/${id}/details/`,
    );
    setSelectedClass(res.data);
  } catch {
    showErrorToast("Failed to load class details");
  }
};

<td
  className="p-2 border text-blue-600 cursor-pointer"
  onClick={() => fetchClassDetails(cls.id)}
>
  {cls.name}
</td>;
