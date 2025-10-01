"use client";
import React, { useState } from "react";
import { GraduationCap, UserPlus, Shield, Clock } from "lucide-react";
import RegistrationForm from "../components/RegistrationForm";

interface RegistrationProps {
  onRegistrationSuccess: (userData: { id: number; email: string }) => void;
  onBackToLogin: () => void;
}

export default function Registration({
  onRegistrationSuccess,
  onBackToLogin,
}: RegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log(
        "URL:",
        "https://terriertracker-production.up.railway.app/api/register"
      );

      const response = await fetch(
        "https://terriertracker-production.up.railway.app/api/register",
        {
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
        }
      );

      console.log("=== API RESPONSE ===");
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        console.log("Registration successful:", data);
        // Pass user data to callback
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
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/70">Active Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-white/70">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm text-white/70">User Rating</div>
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
            <RegistrationForm
              onRegister={handleRegistration}
              isLoading={isLoading}
              error={error}
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
