import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import { getCurrentJalaliMonth, PERSIAN_MONTHS } from "../../../utils/jalali";
import StudentSearchBox from "./searchbox/StudentSearchBox";

const roles = [
  { id: 0, name: "سایر" },
  { id: 1, name: "دکتر" },
  { id: 2, name: "پذیرش" },
  { id: 3, name: "آشپز" },
  { id: 4, name: "نگهبان" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [teacherLevels, setTeacherLevels] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /* ================= فرم ================= */
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    identity_card: "",
    role: 0,
    salary: "",
    contract_duration: "",
    contract_type: "fix",
    teacher_level: "",
    jalali_month: getCurrentJalaliMonth(),
  });

  /* ================= دریافت داده‌ها ================= */
  const fetchUsers = async (month = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/employee/employees/", {
        params: month ? { jalali_month: month } : {},
      });
      setUsers(res.data || []);
      setCurrentPage(1);
    } catch {
      showErrorToast("خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherLevels = async () => {
    try {
      const res = await axiosInstance.get("/employee/teacher-levels/");
      setTeacherLevels(res.data || []);
    } catch {
      showErrorToast("خطا در دریافت سطح‌های کارکنان");
    }
  };

  useEffect(() => {
    fetchUsers(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    fetchTeacherLevels();
  }, []);

  /* ================= کنترل‌ها ================= */
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      identity_card: "",
      role: 0,
      salary: "",
      contract_duration: "",
      contract_type: "fix",
      teacher_level: "",
      jalali_month: selectedMonth,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      identity_card: user.identity_card || "",
      role: user.role ?? 0,
      salary: user.salary ?? "",
      contract_duration: user.contract_duration || "",
      contract_type: user.contract_type || "fix",
      teacher_level: user.teacher_level || "",
      jalali_month: user.jalali_month || selectedMonth,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `آیا از حذف کاربر ${user.first_name} ${user.last_name} مطمئن هستید؟`,
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/employee/employees/${user.id}/`);
      showSuccessToast("کاربر با موفقیت حذف شد");
      fetchUsers(selectedMonth);
    } catch (err) {
      showErrorToast(err.response?.data?.detail || "خطا در حذف کاربر");
    }
  };

  /* ===== اگر نقش معلم نباشد خودکار ریست شود ===== */
  useEffect(() => {
    if (Number(formData.role) !== 1) {
      setFormData((p) => ({
        ...p,
        contract_type: "fix",
        teacher_level: "",
      }));
    }
  }, [formData.role]);

  /* ================= ثبت فرم ================= */
  const handleSubmit = async () => {
    const { first_name, email, contract_type } = formData;

    if (!first_name || !email) {
      return showErrorToast("نام و ایمیل الزامی است");
    }

    if (
      Number(formData.role) === 1 &&
      contract_type === "percentage" &&
      !formData.teacher_level
    ) {
      return showErrorToast("سطح کارکنان برای قرارداد درصدی الزامی است");
    }

    if (
      contract_type === "fix" &&
      (!formData.salary || Number(formData.salary) <= 0)
    ) {
      return showErrorToast("حقوق برای قرارداد ثابت الزامی است");
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        role: Number(formData.role),
        teacher_level:
          Number(formData.role) === 1 && formData.contract_type === "percentage"
            ? Number(formData.teacher_level)
            : null,
        salary: contract_type === "fix" ? Number(formData.salary) : null,
      };

      if (editingUser) {
        await axiosInstance.put(
          `/employee/employees/${editingUser.id}/`,
          payload,
        );
        showSuccessToast("کاربر با موفقیت ویرایش شد");
      } else {
        await axiosInstance.post("/employee/employees/", payload);
        showSuccessToast("کاربر با موفقیت اضافه شد");
      }

      setShowModal(false);
      fetchUsers(selectedMonth);
    } catch (err) {
      showErrorToast(err.response?.data?.detail || "ثبت با خطا مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  /* ================= فیلتر و صفحه‌بندی ================= */
  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ================= رندر ================= */
  return (
    <div className="p-6 space-y-4" dir="rtl">
      <div className="flex justify-between flex-wrap gap-2">
        <button
          onClick={openAddModal}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + افزودن کاربر
        </button>

        <div className="flex flex-wrap gap-2">
          {PERSIAN_MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1 rounded-full border ${
                selectedMonth === m ? "bg-green text-white" : "bg-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <StudentSearchBox
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="جستجوی کاربر..."
      />

      {/* جدول */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">نام</th>
              <th className="p-2 border">ایمیل</th>
              <th className="p-2 border">نقش</th>
              <th className="p-2 border">حقوق</th>
              <th className="p-2 border">نوع قرارداد</th>
              <th className="p-2 border">مدت قرارداد</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  کاربری یافت نشد
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id} className="text-center">
                  <td className="border p-2">
                    {u.first_name} {u.last_name}
                  </td>

                  <td className="border p-2">{u.email}</td>

                  <td className="border p-2">
                    {roles.find((r) => r.id === u.role)?.name}
                  </td>

                  <td className="border p-2">{u.salary ?? "-"}</td>

                  <td className="border p-2">
                    {u.contract_type === "fix" ? "ثابت" : "درصدی"}
                  </td>

                  <td className="border p-2">{u.contract_duration || "-"}</td>

                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1 bg-green text-white rounded"
                      >
                        ویرایش
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white w-[520px] rounded p-6 space-y-3">
            <h3 className="text-lg font-bold">
              {editingUser ? "ویرایش کاربر" : "افزودن کاربر"}
            </h3>

            {/* نام و نام خانوادگی */}
            <div className="grid grid-cols-2 gap-2">
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="border p-2 w-full"
                placeholder="نام"
              />

              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="border p-2 w-full"
                placeholder="نام خانوادگی"
              />
            </div>

            {/* ایمیل */}
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 w-full"
              placeholder="ایمیل"
            />

            {/* کارت ملی و مدت قرارداد */}
            <div className="grid grid-cols-2 gap-2">
              <input
                name="identity_card"
                value={formData.identity_card}
                onChange={handleChange}
                className="border p-2 w-full"
                placeholder="کارت ملی"
              />

              <input
                name="contract_duration"
                value={formData.contract_duration}
                onChange={handleChange}
                className="border p-2 w-full"
                placeholder="مدت قرارداد"
              />
            </div>

            {/* نقش */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* سطح معلم (در صورت نیاز) */}
            {Number(formData.role) === 1 &&
              formData.contract_type === "percentage" && (
                <select
                  name="teacher_level"
                  value={formData.teacher_level}
                  onChange={handleChange}
                  className="border p-2 w-full"
                >
                  <option value="">انتخاب سطح کارکنان</option>
                  {teacherLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              )}

            {/* حقوق ثابت */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.contract_type === "fix"}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    contract_type: e.target.checked ? "fix" : "percentage",
                    salary: e.target.checked ? p.salary : "",
                  }))
                }
              />
              <label>حقوق ثابت</label>
            </div>

            {/* حقوق */}
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              disabled={formData.contract_type === "percentage"}
              className="border p-2 w-full"
              placeholder="حقوق"
            />

            {/* دکمه‌ها */}
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowModal(false)}>انصراف</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-green text-white px-4 py-1 rounded"
              >
                {saving ? "در حال ذخیره..." : "ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
