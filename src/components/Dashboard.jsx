import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBook, FaUsers, FaMoneyBillWave, FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = location.state?.user;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      {/* Welcome text */}
      {/* <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold mb-6 text-white"
      >
        Welcome, {user.name}!
      </motion.h1> */}

      {/* Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {/* Course Details */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/course", { state: { user } })}
            className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:bg-green-200 transition duration-300 min-w-[150px]"
          >
            <FaBook size={22} className="text-green-600" />
            <span className="text-base font-semibold">Course</span>
          </motion.button>

          {/* Batch Details */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/batch", { state: { user } })}
            className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-200 transition duration-300 min-w-[150px]"
          >
            <FaUsers size={22} className="text-blue-600" />
            <span className="text-base font-semibold">Batch</span>
          </motion.button>

          {/* Fees Details */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/feedetails", { state: { user } })}
            className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:bg-yellow-200 transition duration-300 min-w-[150px]"
          >
            <FaMoneyBillWave size={22} className="text-yellow-600" />
            <span className="text-base font-semibold">Fees</span>
          </motion.button>

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/profile", { state: { user } })}
            className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:bg-purple-200 transition duration-300 min-w-[150px]"
          >
            <FaUserCircle size={22} className="text-purple-600" />
            <span className="text-base font-semibold">Profile</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
