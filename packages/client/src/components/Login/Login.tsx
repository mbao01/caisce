import { Button } from "@mbao01/common";

export const Login = () => {
  const handleGoogleSignIn = () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: `http://localhost:3000/auth/google?redirectUrl=https://${chrome.runtime.id}.chromiumapp.org/`,
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("Login <<failed>>", JSON.stringify(chrome.runtime.lastError));
          return;
        }

        // Parse the token from the redirect URL
        const url = new URL(redirectUrl);
        const accessToken = url.searchParams.get("access_token");

        if (accessToken) {
          chrome.storage?.local.set({ accessToken });
        }
      }
    );
  };

  return (
    <Button variant="link" onClick={handleGoogleSignIn} className="font-normal px-1 h-fit">
      <svg
        className="w-3 h-3"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      Login
    </Button>
  );
};
