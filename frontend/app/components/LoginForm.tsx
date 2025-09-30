"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onGoToRegister: () => void;
}

export default function LoginForm({
  onLogin,
  isLoading = false,
  error = null,
  onGoToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
      await onLogin(email.trim(), password);
    } catch (error) {}
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) {
                  setFormErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`w-full px-4 py-3 pl-11 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                formErrors.email
                  ? "border-danger bg-danger-50 dark:bg-danger/10"
                  : "border-default-200 hover:border-default-300"
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) {
                  setFormErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className={`w-full px-4 py-3 pl-11 pr-11  rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-background text-foreground placeholder-default-400 ${
                formErrors.password
                  ? "border-danger bg-danger-50 dark:bg-danger/10"
                  : "border-default-200 hover:border-default-300 dark:hover:border-default-600"
              }`}
              placeholder="Enter your password"
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

        {error && (
          <div className="bg-danger-50 dark:bg-danger/10 border-danger-200 dark:border-danger/30 rounded-lg p-4">
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
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center space-y-2">
          <div className="text-sm text-default-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
