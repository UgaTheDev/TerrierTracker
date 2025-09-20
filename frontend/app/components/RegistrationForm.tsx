"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface RegistrationFormProps {
  onRegister: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function RegistrationForm({
  onRegister,
  isLoading = false,
  error = null,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, lowercase letter, and number";
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onRegister(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );
    } catch (error) {}
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-foreground"
            >
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                  formErrors.firstName
                    ? "border-danger bg-danger-50 dark:bg-danger/10"
                    : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600"
                }`}
                placeholder="First name"
                disabled={isLoading}
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-default-400" />
            </div>
            {formErrors.firstName && (
              <div className="flex items-center gap-1 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                <span>{formErrors.firstName}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-foreground"
            >
              Last Name
            </label>
            <div className="relative">
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                  formErrors.lastName
                    ? "border-danger bg-danger-50 dark:bg-danger/10"
                    : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600"
                }`}
                placeholder="Last name"
                disabled={isLoading}
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-default-400" />
            </div>
            {formErrors.lastName && (
              <div className="flex items-center gap-1 text-sm text-danger">
                <AlertCircle className="h-4 w-4" />
                <span>{formErrors.lastName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                formErrors.email
                  ? "border-danger bg-danger-50 dark:bg-danger/10"
                  : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600"
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-default-400" />
          </div>
          {formErrors.email && (
            <div className="flex items-center gap-1 text-sm text-danger">
              <AlertCircle className="h-4 w-4" />
              <span>{formErrors.email}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                formErrors.password
                  ? "border-danger bg-danger-50 dark:bg-danger/10"
                  : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600"
              }`}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-default-400" />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3.5 h-5 w-5 text-default-400 hover:text-default-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {formErrors.password && (
            <div className="flex items-center gap-1 text-sm text-danger">
              <AlertCircle className="h-4 w-4" />
              <span>{formErrors.password}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                formErrors.confirmPassword
                  ? "border-danger bg-danger-50 dark:bg-danger/10"
                  : "border-default-200 dark:border-default-700 hover:border-default-300 dark:hover:border-default-600"
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-default-400" />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-3.5 h-5 w-5 text-default-400 hover:text-default-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <div className="flex items-center gap-1 text-sm text-danger">
              <AlertCircle className="h-4 w-4" />
              <span>{formErrors.confirmPassword}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-danger-50 dark:bg-danger/10 border border-danger-200 dark:border-danger/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
            isLoading
              ? "bg-default-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-background shadow-small hover:shadow-medium"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-default-500">
            By creating an account, you agree to our{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
