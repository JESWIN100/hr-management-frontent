import React, { useEffect,useState, useRef } from 'react';
import { meet } from '@googleworkspace/meet-addons/meet.addons';
export default function MeetingPage() {
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    async function init() {
      try {
        // Initialize Meet Add-on
        await meet.initialize();

        setStatus("Connected to Google Meet!");

        // Get current side panel client
        const sidePanelClient = await meet.sidePanelClient;

        // Example: get meeting information
        const meetingInfo = await sidePanelClient.getMeetingInfo();

        console.log("Meeting Info:", meetingInfo);
      } catch (err) {
        console.error(err);
        setStatus("Not running inside Google Meet.");
      }
    }

    init();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <iframe
  src="https://meet.google.com/abc-defg-hij"
  width="100%"
  height="600"
  title="Google Meet"
/>
    </div>
  );
}