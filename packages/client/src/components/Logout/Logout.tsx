import { Avatar, Button } from "@mbao01/common";
import type { LogoutProps } from "./types";
import { Tooltip } from "../Tooltip";

export const Logout = ({ user }: LogoutProps) => {
  const handleLogout = async () => {
    chrome.storage?.local.get("accessToken", async ({ accessToken }) => {
      if (!accessToken) {
        console.warn("No token found to logout");
        return;
      }

      try {
        // Step 1: Make logout request (if needed)
        const res = await fetch("http://localhost:3000/auth/logout", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn("Logout request failed:", res.status);
        }

        // Step 2: Clear token from storage
        chrome.storage?.local.remove("accessToken", () => {
          console.log("Token removed, user logged out");
        });

        // Step 3: Optional - update UI or redirect
        // For example, you might clear user state or reload the extension popup
        // window.location.reload();
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  };

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const initials =
    `${user.firstName.charAt(0) ?? ""}${user.lastName.charAt(0) ?? ""}`.toUpperCase();

  return (
    <Tooltip
      side="left"
      sideOffset={4}
      triggerProps={{ asChild: true }}
      trigger={
        <Button variant="link" onClick={handleLogout} className="font-normal px-1 h-fit">
          <Avatar className="size-6">
            <Avatar.Image
              ring
              alt={fullName}
              src={user.picture}
              shape="circle"
              variant="primary"
              className="!ring-1"
            />
            <Avatar.Fallback variant="primary" shape="circle">
              {initials}
            </Avatar.Fallback>
          </Avatar>
          Logout
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <Avatar.Image
            ring
            alt={fullName}
            src={user.picture}
            shape="circle"
            variant="primary"
            className="!ring-1"
          />
          <Avatar.Fallback variant="primary" shape="circle">
            {initials}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <span>{fullName}</span>
          <span>{user.email}</span>
        </div>
      </div>
    </Tooltip>
  );
};
