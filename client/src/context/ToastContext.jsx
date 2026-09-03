/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import "../styles/Toast.css";

const ToastContext = createContext({ showToast: () => {}, dismissToast: () => {} });

const toastIcons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(message, type = "info", duration = 4500) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
  }

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type] ?? FiInfo;
          return (
            <div className={`toast toast--${toast.type}`} key={toast.id} role="status">
              <Icon aria-hidden="true" />
              <span>{toast.message}</span>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}>
                <FiX aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context;
}