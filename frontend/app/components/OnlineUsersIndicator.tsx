"use client";
import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";

const API_BASE_URL = "https://terriertracker-production.up.railway.app/api";

export default function OnlineUsersIndicator() {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const getUserId = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          return userData.id;
        }
      } catch (error) {
        console.error("Error getting user from localStorage:", error);
      }
      return null;
    };

    const userId = getUserId();

    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/online`);
        const data = await response.json();
        setOnlineCount(data.online_users);
      } catch (error) {
        console.error("Failed to fetch online users:", error);
      }
    };

    fetchOnlineCount();

    let heartbeatInterval: NodeJS.Timeout | null = null;

    if (userId) {
      heartbeatInterval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/heartbeat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });
          const data = await response.json();
          if (data.success) {
            setOnlineCount(data.online_users);
          }
        } catch (error) {
          console.error("Heartbeat failed:", error);
        }
      }, 60000);
    }

    const refreshInterval = setInterval(fetchOnlineCount, 30000);

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 dark:bg-default-50/10">
      <div className="relative">
        <Users size={16} className="text-success" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
      </div>
      <span className="text-sm font-medium text-foreground">
        {onlineCount} {onlineCount === 1 ? "user" : "users"} online
      </span>
    </div>
  );
}
