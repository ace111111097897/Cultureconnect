import { useState } from "react";

export function NotificationsSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex justify-center items-center h-96">
      <div className="text-white/80 text-lg">Notifications are currently unavailable.</div>
    </div>
  );
} 