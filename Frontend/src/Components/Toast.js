import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-right",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

export const showSuccessToast = (message) => {
  Toast.fire({
    icon: "success",
    title: message,
  });
};

// ✅ Show error toast
export const showErrorToast = (message) => {
  Toast.fire({
    icon: "error",
    title: message,
  });
};

// ✅ Show warning toast (optional)
export const showWarningToast = (message) => {
  Toast.fire({
    icon: "warning",
    title: message,
  });
};
