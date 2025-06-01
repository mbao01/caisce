// Function to extract page content
const extractPageContent = () => {
  const content = document.body.innerText;
  return content;
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_CONTENT") {
    console.log("[Content:onMessage] Sender: ", sender);
    const content = extractPageContent();
    sendResponse({ content });
  }
  return true;
});
