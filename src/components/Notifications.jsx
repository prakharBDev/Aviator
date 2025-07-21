import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Notifications = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-3 rounded-lg shadow-lg max-w-sm ${
              notification.type === "error"
                ? "bg-red-600 border-red-500"
                : notification.type === "success"
                ? "bg-green-600 border-green-500"
                : "bg-blue-600 border-blue-500"
            } border`}
          >
            <p className="text-sm">{notification.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;