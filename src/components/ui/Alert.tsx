"use client";

import { HTMLAttributes, forwardRef } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  icon?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant, title, icon = true, className = "", children, ...props },
    ref,
  ) => {
    // Use the getAlertStyles utility function to get appropriate color classes
    const success = useThemeColor("Main", "Success");
    const destructive = useThemeColor("Main", "Destructive");
    const warning = useThemeColor("Main", "Warning");
    const info = useThemeColor("Main", "Info");

    const alertStyles = {
      success: success,
      error: destructive,
      warning: warning,
      info: info,
    };

    const iconMap = {
      success: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      error: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      warning: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      info: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return (
      <div
        ref={ref}
        className={`p-4 rounded-md ${alertStyles[variant]} ${className}`}
        {...props}
      >
        <div className="flex">
          {icon && <div className="flex-shrink-0 mr-3">{iconMap[variant]}</div>}
          <div>
            {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
            <div className={title ? "text-sm" : ""}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
