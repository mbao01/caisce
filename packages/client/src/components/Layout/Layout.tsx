import { useEffect, useState } from "react";
import { Avatar, ThemeSwitch, Toaster } from "@mbao01/common";
import { SparklesIcon } from "lucide-react";
import type { LayoutProps } from "./types";
import { Login } from "../Login";
import { Logout } from "../Logout";

export const Layout = ({ children }: LayoutProps) => {
  // const user = { name: "John Doe", email: "john.doe@example.com", image: "" };
  const [user, setUser] = useState<{ name: string; email: string; image: string } | null>({
    name: "John Doe",
    email: "john.doe@example.com",
    image: "",
  });
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage?.local.onChanged.addListener(() => {
      chrome.storage?.local.get("accessToken", async ({ accessToken }) => {
        if (!accessToken) {
          console.error("Token not found in storage");
          setUser(null);
          return;
        }

        try {
          setLoading(true);
          const response = await fetch("http://localhost:3000/auth/profile", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const result = await response.json();
          if (result) {
            setUser({ ...result, name: "John Doe" });
          }
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      });
    });
  }, []);

  return (
    <div className="w-[400px] h-[600px] bg-background flex flex-col">
      <header className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <Avatar.Image src="/caisce.svg" className="size-6!" />
            <Avatar.Fallback className="text-primary">
              <SparklesIcon className="size-4 shrink-0" />
            </Avatar.Fallback>
          </Avatar>
          <h1 className="text-lg font-semibold text-center">caisce</h1>
        </div>

        <div className="flex items-center gap-1">
          {isLoading ? <p>Loading...</p> : user ? <Logout user={user} /> : <Login />}
          <ThemeSwitch />
        </div>
      </header>

      {children}

      <Toaster />
    </div>
  );
};
