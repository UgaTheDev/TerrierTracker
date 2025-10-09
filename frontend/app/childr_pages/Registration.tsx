"use client";
import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, UserPlus, Shield, Clock } from "lucide-react";
import RegistrationForm from "../components/RegistrationForm";

interface RegistrationProps {
  onRegistrationSuccess: (userData: { id: number; email: string }) => void;
  onBackToLogin: () => void;
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

export default function Registration({
  onRegistrationSuccess,
  onBackToLogin,
}: RegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      googleButtonRef.current
    ) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignUp,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, []);

  const triggerGoogleSignUp = () => {
    const googleButton = googleButtonRef.current?.querySelector(
      'div[role="button"]'
    ) as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };

  const handleGoogleSignUp = async (response: GoogleCredentialResponse) => {
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
        console.log("Google sign-up successful:", data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        onRegistrationSuccess(data.user);
      } else {
        setError(data.error || "Google sign-up failed");
      }
    } catch (err: any) {
      console.error("Google sign-up error:", err);
      setError("An error occurred during Google sign-up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true);
    setError(null);

    console.log("=== REGISTRATION FUNCTION CALLED ===");
    console.log("Data:", { email, password, firstName, lastName });

    try {
      console.log("=== ABOUT TO CALL API ===");
      console.log("URL:", `${API_BASE_URL}/register`);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      console.log("=== API RESPONSE ===");
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        console.log("Registration successful:", data);
        onRegistrationSuccess({ id: data.user_id, email: email });
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background p-4">
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white relative overflow-hidden rounded-3xl mr-4">
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
              <h1 className="text-3xl font-bold">Join Terrier Tracker</h1>
              <p className="text-white/80">Start your academic journey</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Dashboard
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Get a customized view of your academic progress with
                  personalized recommendations and insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-white/80 leading-relaxed">
                  Your academic data is protected with enterprise-grade security
                  and privacy measures.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                <p className="text-white/80 leading-relaxed">
                  Streamline your course planning and never miss important
                  deadlines or requirements again.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">26</div>
                <div className="text-sm text-white/70">Hub Requirements</div>
              </div>
              <div>
                <div className="text-2xl font-bold">6000</div>
                <div className="text-sm text-white/70">Courses</div>
              </div>
              <div>
                <div className="text-2xl font-bold">13</div>
                <div className="text-sm text-white/70">Colleges</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-content1 rounded-3xl shadow-small">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-3xl">
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
              Create Account
            </h2>
            <p className="text-default-600">
              Join thousands of students managing their academic journey with
              Terrier Tracker
            </p>
          </div>

          <div className="bg-content2 py-8 px-6 shadow-medium rounded-3xl">
            {error && (
              <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div ref={googleButtonRef} style={{ display: "none" }}></div>
              <button
                onClick={triggerGoogleSignUp}
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
                  Or register with email
                </span>
              </div>
            </div>

            <RegistrationForm
              onRegister={handleRegistration}
              isLoading={isLoading}
              error={null}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-default-600">
              Already have an account?{" "}
              <button
                onClick={onBackToLogin}
                className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
