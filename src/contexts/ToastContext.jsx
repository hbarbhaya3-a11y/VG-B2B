import React, { createContext, useContext, useCallback } from "react";
import { notifications } from "@mantine/notifications";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useCallback((message, color = "blue", title = "") => {
    notifications.show({ title, message, color, withCloseButton: true });
  }, []);

  return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default ToastContext;
