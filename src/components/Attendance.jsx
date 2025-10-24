import React from "react";
import { motion } from "framer-motion";

export default function Attendance({ attendance, selectedBatch, formatDate, onClose, loading = false }) {
  if (!selectedBatch) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-blue-600/30 shadow-2xl mx-2"
      >
        {/* Header - Same as before */}
        <div className="bg-blue-800/50 p-4 sm:p-6 border-b border-blue-600/30">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words"
              >
                {selectedBatch.faculty || selectedBatch.facultyid || "Faculty Not Available"}
              </motion.h2>
              
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-lg md:text-xl font-semibold text-blue-300 mb-2 break-words"
              >
                {formatDate(selectedBatch.startdate || selectedBatch.date)} - {formatDate(selectedBatch.ExceptedEnddate || selectedBatch.endate)}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3"
              >
                <div className="bg-blue-700/30 p-2 sm:p-3 rounded-lg border border-blue-600/30">
                  <p className="text-blue-200 text-xs sm:text-sm font-semibold">Subject</p>
                  <p className="text-white text-sm sm:text-base break-words">{selectedBatch.subject || "N/A"}</p>
                </div>
                <div className="bg-blue-700/30 p-2 sm:p-3 rounded-lg border border-blue-600/30">
                  <p className="text-blue-200 text-xs sm:text-sm font-semibold">Batch Name</p>
                  <p className="text-white text-sm sm:text-base break-words">{selectedBatch.batchno || selectedBatch.batchname || "N/A"}</p>
                </div>
              </motion.div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-300 hover:text-white text-xl sm:text-2xl font-bold transition duration-200 flex-shrink-0"
              onClick={onClose}
            >
              ✖
            </motion.button>
          </div>
        </div>

        {/* Content with Loading State */}
        <div className="p-3 sm:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
          {loading ? (
            // Loading State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-blue-300 border-t-transparent rounded-full mb-4"
              />
              <p className="text-blue-200 text-lg font-semibold">Loading attendance...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your records</p>
            </motion.div>
          ) : attendance.length ? (
            <>
              {/* Desktop Table - Same as before */}
              <div className="hidden sm:block overflow-x-auto rounded-lg border border-blue-600/30">
                <table className="min-w-full bg-blue-900/20 backdrop-blur-sm">
                  <thead className="bg-blue-800/50">
                    <tr>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 border-b border-blue-600/30 text-white text-xs sm:text-sm font-semibold text-left">
                        Date
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 border-b border-blue-600/30 text-white text-xs sm:text-sm font-semibold text-left">
                        Attendance
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 border-b border-blue-600/30 text-white text-xs sm:text-sm font-semibold text-left">
                        Topic
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-600/20">
                    {attendance.map((att, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-blue-800/30 transition duration-200"
                      >
                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-white text-xs sm:text-sm">
                          {formatDate(att.date)}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          <span
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${
                              att.attendence?.toLowerCase() === "present"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : att.attendence?.toLowerCase() === "absent"
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : att.attendence?.toLowerCase() === "no batch today"
                                ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            }`}
                          >
                            {att.attendence || "Unknown"}
                          </span>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-blue-200 text-xs sm:text-sm break-words">
                          {att.topic || "-"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Same as before */}
              <div className="sm:hidden space-y-3">
                {attendance.map((att, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-blue-800/30 rounded-lg border border-blue-600/30 p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-semibold text-sm">
                        {formatDate(att.date)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          att.attendence?.toLowerCase() === "present"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : att.attendence?.toLowerCase() === "absent"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : att.attendence?.toLowerCase() === "no batch today"
                            ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        }`}
                      >
                        {att.attendence || "Unknown"}
                      </span>
                    </div>
                    {att.topic && (
                      <div className="mt-2">
                        <p className="text-blue-200 text-xs font-semibold">Topic:</p>
                        <p className="text-white text-sm break-words">{att.topic}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            // No Records State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
              <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">No Attendance Records</h4>
              <p className="text-gray-300 text-sm sm:text-base">No attendance records found for this batch.</p>
            </motion.div>
          )}
        </div>

        {/* Footer - Only show when not loading and has records */}
        {!loading && attendance.length > 0 && (
          <div className="bg-blue-800/30 p-3 sm:p-4 border-t border-blue-600/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 text-sm">
              <span className="text-blue-200 text-center sm:text-left">
                Total Records: <span className="text-white font-semibold">{attendance.length}</span>
              </span>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-blue-200 text-xs sm:text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Present
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Absent
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  No Batch
                </span>
                {/* <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Other
                </span> */}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}