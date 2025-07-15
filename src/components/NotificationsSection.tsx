import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function NotificationsSection() {
  const [showAll, setShowAll] = useState(false);
  
  const notifications = useQuery(api.notifications.getUserNotifications, { 
    limit: showAll ? 50 : 10 
  });
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
      console.error(error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any });
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error(error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match":
        return "💫";
      case "message":
        return "💬";
      case "friend_request":
        return "👥";
      case "story_reaction":
        return "❤️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "match":
        return "from-purple-500 to-pink-500";
      case "message":
        return "from-blue-500 to-cyan-500";
      case "friend_request":
        return "from-green-500 to-emerald-500";
      case "story_reaction":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (!notifications) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-bold text-white mb-4">No notifications</h2>
          <p className="text-white/70">
            You're all caught up! New matches and messages will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            Mark All Read
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all ${
              !notification.isRead ? 'ring-2 ring-orange-400/50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Notification Icon */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-lg">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-white font-semibold">{notification.title}</h3>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    )}
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3">
                    {notification.message}
                  </p>

                  {/* Related User Profile */}
                  {notification.relatedUserProfile && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {notification.relatedUserProfile.profileImageUrl ? (
                          <img
                            src={notification.relatedUserProfile.profileImageUrl}
                            alt={notification.relatedUserProfile.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs">👤</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium">
                          {notification.relatedUserProfile.displayName}
                        </p>
                        <p className="text-white/60 text-xs">
                          {notification.relatedUserProfile.location}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-white/50 text-xs mt-3">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {!showAll && notifications.length >= 10 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
          >
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
} 