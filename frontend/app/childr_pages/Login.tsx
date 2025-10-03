"use client";
import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import LoginForm from "../components/LoginForm";

interface LoginProps {
  onLoginSuccess: (userData: { id: number; email: string }) => void;
  onGoToRegister: () => void;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const API_BASE_URL = "https://terriertracker-production.up.railway.app/api";

export default function Login({ onLoginSuccess, onGoToRegister }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Google Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    if (
      typeof window !== "undefined" &&
      window.google &&
      googleButtonRef.current
    ) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, []);

  const triggerGoogleSignIn = () => {
    const googleButton = googleButtonRef.current?.querySelector(
      'div[role="button"]'
    ) as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };

  const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Google login successful:", data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Google sign-in failed");
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError("An error occurred during Google sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
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
        onLoginSuccess(data.user);
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
              "Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Veritatis, earum."
            </blockquote>
            <cite className="text-white/70 text-sm">— Lorem, ipsum.</cite>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-content1 rounded-3xl shadow-small">
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

          <div className="bg-content2 py-8 px-6 shadow-medium rounded-3xl">
            {error && (
              <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              {/* Hidden Google button */}
              <div ref={googleButtonRef} style={{ display: "none" }}></div>

              {/* Custom styled button */}
              <button
                onClick={triggerGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-default-300 hover:border-default-400 dark:border-default-700 dark:hover:border-default-600 bg-content1 dark:bg-content2 hover:bg-content2 dark:hover:bg-content3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-foreground font-medium">
                  Continue with Google
                </span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-content2 text-default-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <LoginForm
              onLogin={handleLogin}
              isLoading={isLoading}
              error={null}
              onGoToRegister={onGoToRegister}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
