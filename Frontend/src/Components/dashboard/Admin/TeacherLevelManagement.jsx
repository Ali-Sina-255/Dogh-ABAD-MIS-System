import React, { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";

const TeacherLevelManagement = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  const [levelForm, setLevelForm] = useState({ name: "", description: "" });
  const [ruleForm, setRuleForm] = useState({
    min_students: "",
    max_students: "",
    salary_amount: "",
  });
  const [editingRuleId, setEditingRuleId] = useState(null);

  /* ================= دریافت سطح‌ها ================= */
  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("employee/teacher-levels/");
      setLevels(res.data || []);
    } catch {
      showErrorToast("بارگذاری سطح‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  /* ================= مودال سطح ================= */
  const openAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({ name: "", description: "" });
    resetRuleForm();
    setShowModal(true);
  };

  const openEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({ name: level.name, description: level.description || "" });
    resetRuleForm();
    setShowModal(true);
  };

  const saveLevel = async () => {
    if (!levelForm.name.trim()) return showErrorToast("نام سطح الزامی است");

    setSaving(true);
    try {
      if (editingLevel) {
        await axiosInstance.put(
          `employee/teacher-levels/${editingLevel.id}/`,
          levelForm,
        );
        showSuccessToast("سطح با موفقیت ویرایش شد");
      } else {
        await axiosInstance.post("employee/teacher-levels/", levelForm);
        showSuccessToast("سطح با موفقیت ایجاد شد");
      }
      setShowModal(false);
      fetchLevels();
    } catch {
      showErrorToast("ذخیره سطح ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const deleteLevel = async (level) => {
    if (
      !window.confirm(
        `آیا مطمئن هستید که می‌خواهید سطح "${level.name}" را حذف کنید؟\nتمام قوانین حقوق نیز حذف خواهند شد.`,
      )
    )
      return;

    try {
      await axiosInstance.delete(`employee/teacher-levels/${level.id}/`);
      showSuccessToast("سطح با موفقیت حذف شد");
      fetchLevels();
    } catch (err) {
      showErrorToast(
        err.response?.data?.detail ||
          "حذف سطح ناموفق بود (ممکن است در حال استفاده باشد)",
      );
    }
  };

  /* ================= مودال قوانین ================= */
  const resetRuleForm = () => {
    setRuleForm({ min_students: "", max_students: "", salary_amount: "" });
    setEditingRuleId(null);
  };

  const editRule = (rule, level) => {
    setEditingLevel(level);
    setRuleForm({
      min_students: rule.min_students,
      max_students: rule.max_students,
      salary_amount: rule.salary_amount,
    });
    setEditingRuleId(rule.id);
    setShowModal(true);
  };

  const addOrUpdateRule = async () => {
    const { min_students, max_students, salary_amount } = ruleForm;

    if (!min_students || !max_students || !salary_amount)
      return showErrorToast("تمام فیلدهای قانون را پر کنید");

    if (
      Number(min_students) <= 0 ||
      Number(max_students) <= 0 ||
      Number(salary_amount) <= 0
    )
      return showErrorToast("مقادیر باید عددی و مثبت باشند");

    if (Number(min_students) > Number(max_students))
      return showErrorToast(
        "حداقل تعداد دانش‌آموزان نمی‌تواند بیشتر از حداکثر باشد",
      );

    if (!editingLevel) return showErrorToast("سطح انتخاب نشده است");

    setSaving(true);
    try {
      if (editingRuleId) {
        await axiosInstance.put(
          `employee/teacher-salary-rules/${editingRuleId}/`,
          { ...ruleForm, teacher_level: editingLevel.id },
        );
        showSuccessToast("قانون حقوق با موفقیت ویرایش شد");
      } else {
        await axiosInstance.post("employee/teacher-salary-rules/", {
          ...ruleForm,
          teacher_level: editingLevel.id,
        });
        showSuccessToast("قانون حقوق با موفقیت اضافه شد");
      }

      resetRuleForm();
      fetchLevels();
    } catch (err) {
      showErrorToast(
        err.response?.data?.non_field_errors?.[0] ||
          "ذخیره قانون حقوق ناموفق بود",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (ruleId) => {
    if (!window.confirm("آیا این قانون حذف شود؟")) return;
    try {
      await axiosInstance.delete(`employee/teacher-salary-rules/${ruleId}/`);
      showSuccessToast("قانون حذف شد");
      fetchLevels();
    } catch {
      showErrorToast("حذف قانون ناموفق بود");
    }
  };

  /* ================= رندر ================= */
  return (
    <div className="p-6 space-y-4">
      <button
        onClick={openAddLevel}
        className="px-4 py-1 bg-green text-white rounded"
      >
        + افزودن سطح
      </button>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">سطح</th>
              <th className="p-2 border">توضیحات</th>
              <th className="p-2 border">قوانین حقوق</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : levels.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  سطحی یافت نشد
                </td>
              </tr>
            ) : (
              levels.map((lvl) => (
                <tr key={lvl.id} className="text-center">
                  <td className="border p-2 font-semibold">{lvl.name}</td>
                  <td className="border p-2">{lvl.description}</td>
                  <td className="border p-2 text-left">
                    {lvl.salary_rules.map((r) => (
                      <div
                        key={r.id}
                        className="flex justify-between items-center border-b py-1"
                      >
                        <span>
                          {r.min_students}–{r.max_students} →{" "}
                          <b>{r.salary_amount}</b>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editRule(r, lvl)}
                            className="text-green text-sm"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => deleteRule(r.id)}
                            className="text-red-600 text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditLevel(lvl)}
                        className="px-3 py-1 bg-green text-white rounded"
                      >
                        مدیریت
                      </button>
                      <button
                        onClick={() => deleteLevel(lvl)}
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[420px]">
            <h3 className="font-bold mb-3">
              {editingLevel ? "ویرایش سطح" : "ایجاد سطح جدید"}
            </h3>

            <input
              placeholder="نام سطح"
              value={levelForm.name}
              onChange={(e) =>
                setLevelForm({ ...levelForm, name: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <textarea
              placeholder="توضیحات"
              value={levelForm.description}
              onChange={(e) =>
                setLevelForm({ ...levelForm, description: e.target.value })
              }
              className="border p-2 w-full mb-3"
            />

            {editingLevel && (
              <>
                <h4 className="font-semibold mb-2">قوانین حقوق</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    placeholder="حداقل"
                    type="number"
                    value={ruleForm.min_students}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, min_students: e.target.value })
                    }
                    className="border p-1 w-1/3"
                  />
                  <input
                    placeholder="حداکثر"
                    type="number"
                    value={ruleForm.max_students}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, max_students: e.target.value })
                    }
                    className="border p-1 w-1/3"
                  />
                  <input
                    placeholder="مبلغ حقوق"
                    type="number"
                    value={ruleForm.salary_amount}
                    onChange={(e) =>
                      setRuleForm({
                        ...ruleForm,
                        salary_amount: e.target.value,
                      })
                    }
                    className="border p-1 w-1/3"
                  />
                </div>
                <button
                  onClick={addOrUpdateRule}
                  disabled={saving}
                  className="px-3 py-1 bg-green text-white rounded mb-3"
                >
                  {editingRuleId ? "ویرایش قانون" : "افزودن قانون"}
                </button>
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                لغو
              </button>
              <button
                onClick={saveLevel}
                disabled={saving}
                className="px-4 py-1 bg-green text-white rounded"
              >
                {editingLevel ? "ویرایش سطح" : "ذخیره سطح"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLevelManagement;
