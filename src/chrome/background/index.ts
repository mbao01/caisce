// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_CONTENT") {
    // TODO: Implement page content extraction logic
    sendResponse({ content: "Page content placeholder" });
  }
  return true;
});
