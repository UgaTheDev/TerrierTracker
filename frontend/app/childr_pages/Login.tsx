"use client";
import React, { useState } from "react";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import LoginForm from "../components/LoginForm";

interface LoginProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

export default function Login({ onLoginSuccess, onGoToRegister }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Login successful for:", data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background p-4">
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 text-white relative overflow-hidden rounded-3xl mr-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-40 right-16 w-24 h-24 rounded-full bg-white/20"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-white/20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terrier Tracker</h1>
              <p className="text-white/80">Boston University Course Planner</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Track Your Progress
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Monitor your hub requirements and academic progress in
                  real-time with our intuitive dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
                <p className="text-white/80 leading-relaxed">
                  Get personalized course recommendations and plan your academic
                  journey with confidence.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Hub Requirements</h3>
                <p className="text-white/80 leading-relaxed">
                  Never miss a requirement again with our comprehensive hub
                  tracking system.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
            <blockquote className="text-lg italic mb-2">
              "Education is the passport to the future, for tomorrow belongs to
              those who prepare for it today."
            </blockquote>
            <cite className="text-white/70 text-sm">— Malcolm X</cite>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-content1 rounded-3xl border border-default-200 dark:border-default-700 shadow-small">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-red-600 p-3 rounded-3xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Terrier Tracker
              </h1>
              <p className="text-default-600">Course Planner</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-default-600">
              Sign in to your account to continue tracking your academic
              progress
            </p>
          </div>

          <div className="bg-content2 py-8 px-6 shadow-medium rounded-3xl border border-default-200 dark:border-default-700">
            <LoginForm
              onLogin={handleLogin}
              isLoading={isLoading}
              error={error}
              onGoToRegister={onGoToRegister}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-default-500">
              Need help?{" "}
              <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline transition-colors">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
