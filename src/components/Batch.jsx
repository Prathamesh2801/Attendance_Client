import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Attendance from "./Attendance";
import { BASE_URL } from "../../config";
import { motion } from "framer-motion";

export default function Batch() {
  const location = useLocation();
  const user = location.state?.user;

  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]); // Changed to state
  const [batches, setBatches] = useState({ 
    persuing: [], 
    completed: [], 
    pending: [],
    subjects: []
  });
  const [activeTab, setActiveTab] = useState("Persuing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Process courses on component mount
  useEffect(() => {
    if (user) {
      const processedCourses = processUserCourses(user.course);
      setCourses(processedCourses);
    }
  }, [user]);

  // Function to process courses from user data
  const processUserCourses = (courseData) => {
    if (!courseData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(courseData)) {
      return courseData.filter(course => course && course.trim() !== "");
    }
    
    // If it's a string, split by comma and clean up
    if (typeof courseData === 'string') {
      return courseData
        .split(',')
        .map(course => course.trim())
        .filter(course => course && course !== "");
    }
    
    return [];
  };

  if (!user) return <p className="text-white text-center p-6">User data missing. Please login again.</p>;

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchBatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/api/batch/details?id=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}`
        );
        if (!res.ok) throw new Error("Failed to fetch batches");
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "No batches found");
        
        console.log("Batch data received:", data.data);
        
        // Process data to organize by subjects
        const processedData = processBatchData(data.data);
        setBatches(processedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setBatches({ persuing: [], completed: [], pending: [], subjects: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [selectedCourse, user.name_contactid]);

  // Function to process batch data and organize by subjects
  const processBatchData = (data) => {
    // Get all unique subjects from persuing and completed batches
    const allSubjects = new Set();
    
    // Process persuing batches and collect subjects
    const persuingBySubject = {};
    data.persuing.forEach(batch => {
      const subject = batch.subject || "General";
      allSubjects.add(subject);
      
      if (!persuingBySubject[subject]) {
        persuingBySubject[subject] = [];
      }
      persuingBySubject[subject].push(batch);
    });

    // Process completed batches and collect subjects
    const completedBySubject = {};
    data.completed.forEach(batch => {
      const subject = batch.subject || "General";
      allSubjects.add(subject);
      
      if (!completedBySubject[subject]) {
        completedBySubject[subject] = [];
      }
      completedBySubject[subject].push(batch);
    });

    return {
      persuing: data.persuing || [],
      completed: data.completed || [],
      pending: data.pending || [],
      subjects: Array.from(allSubjects),
      persuingBySubject,
      completedBySubject
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    if (dateString.includes("-")) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return dateString;
  };

  // Helper function to get faculty name
  const getFacultyName = (batch) => {
    if (batch.faculty_display_name && batch.faculty_display_name.trim() !== "") return batch.faculty_display_name;
    if (batch.faculty_name && batch.faculty_name.trim() !== "") return batch.faculty_name;
    if (batch.facultyid) return batch.facultyid.split("@")[0];
    if (batch.faculty) return batch.faculty;
    return "N/A";
  };

  const fetchAttendance = async (batch) => {
    try {
      setSelectedBatch(batch);
      setAttendance([]);
      setShowAttendanceModal(true);

      const res = await fetch(
        `${BASE_URL}/api/attendance/details?name_contactid=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}&batch=${encodeURIComponent(batch.batchno || batch.batchname)}`
      );

      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "No attendance found");
      setAttendance(data.data);
    } catch (err) {
      console.error(err);
      setAttendance([]);
    }
  };

  // Updated renderBatchTable to show batches organized by subject
  const renderBatchTable = () => {
    const list = activeTab === "Persuing" ? batches.persuing : batches.completed;
    const bySubject = activeTab === "Persuing" ? batches.persuingBySubject : batches.completedBySubject;
    
    if (loading) return <p className="text-blue-200 text-center py-4">Loading batches...</p>;
    if (error) return <p className="text-red-400 text-center py-4">Error: {error}</p>;
    if (!list.length) return <p className="text-gray-300 text-center py-4">No {activeTab.toLowerCase()} batches found.</p>;

    return (
      <div className="space-y-6">
        {batches.subjects.map((subject) => {
          const subjectBatches = bySubject[subject] || [];
          if (subjectBatches.length === 0) return null;

          return (
            <motion.div
              key={subject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/30 rounded-lg p-4 border border-blue-600/30"
            >
              <h4 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-blue-600/30">
                {subject}
                <span className="ml-2 text-sm text-blue-300">
                  ({subjectBatches.length} {subjectBatches.length === 1 ? 'batch' : 'batches'})
                </span>
              </h4>
              
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full bg-blue-900/20 backdrop-blur-sm">
                  <thead className="bg-blue-800/50">
                    <tr>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">Attendance</th>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">Batch Name</th>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left hidden md:table-cell">Faculty</th>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left hidden lg:table-cell">Start Date</th>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left hidden lg:table-cell">End Date</th>
                      <th className="px-3 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">Batch Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-600/20">
                    {subjectBatches.map((batch, idx) => (
                      <tr key={idx} className="hover:bg-blue-800/30 transition duration-200">
                        <td className="px-3 py-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              fetchAttendance(batch);
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition duration-200"
                          >
                            View Attendance
                          </motion.button>
                        </td>
                        <td className="px-3 py-3 text-white text-sm">{batch.batchno || batch.batchname || "N/A"}</td>
                        <td className="px-3 py-3 text-blue-200 text-sm hidden md:table-cell">
                          {getFacultyName(batch)}
                        </td>
                        <td className="px-3 py-3 text-blue-200 text-sm hidden lg:table-cell">{formatDate(batch.startdate || batch.date)}</td>
                        <td className="px-3 py-3 text-blue-200 text-sm hidden lg:table-cell">{formatDate(batch.ExceptedEnddate || batch.endate)}</td>
                        <td className="px-3 py-3 text-blue-200 text-sm">{batch.batch_time || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPendingList = () => {
    if (loading) return <p className="text-blue-200 text-center py-4">Loading pending subjects...</p>;
    if (error) return <p className="text-red-400 text-center py-4">Error: {error}</p>;
    if (!batches.pending.length) return <p className="text-gray-300 text-center py-4">No pending subjects found. You have enrolled in all subjects for this course.</p>;

    return (
      <div className="overflow-x-auto rounded-lg border border-blue-600/30">
        <table className="min-w-full bg-blue-900/20 backdrop-blur-sm">
          <thead className="bg-blue-800/50">
            <tr>
              <th className="px-4 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">#</th>
              <th className="px-4 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">Subject Name</th>
              <th className="px-4 py-3 border-b border-blue-600/30 text-white text-sm font-semibold text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-600/20">
            {batches.pending.map((subject, idx) => (
              <tr key={idx} className="hover:bg-blue-800/30 transition duration-200">
                <td className="px-4 py-3 text-blue-200 text-center">{idx + 1}</td>
                <td className="px-4 py-3 text-white">{subject.subjectname || subject.subject || "N/A"}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-yellow-500/10 border-t border-yellow-500/20 px-4 py-3">
          <p className="text-yellow-300 text-sm text-center">
            {batches.pending.length} subject(s) remaining to complete your course
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Batch Details</h2>
          <p className="text-gray-300">Track your batch progress and attendance by subject</p>
        </motion.div>

        {/* Course Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="w-full md:w-2/3 lg:w-1/2">
            <label htmlFor="course" className="block text-white text-sm font-semibold mb-2 text-center">
              Select Your Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border border-blue-600 rounded-lg bg-blue-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="" className="bg-blue-900 text-white">-- Select a course --</option>
              {courses.map((course, idx) => (
                <option key={idx} value={course} className="bg-blue-900 text-white">{course}</option>
              ))}
            </select>
            {courses.length === 0 && (
              <p className="text-yellow-300 text-sm text-center mt-2">
                No courses found for this user.
              </p>
            )}
          </div>
        </motion.div>

        {/* Debug info - remove in production */}
        <div className="hidden">
          <p>User courses raw: {JSON.stringify(user.course)}</p>
          <p>Processed courses: {JSON.stringify(courses)}</p>
        </div>

        {/* Main Content */}
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-600/30"
          >
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
               <span className="text-blue-300">{selectedCourse}</span> Batch Details
              </h3>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <div className="bg-blue-700/30 px-4 py-2 rounded-lg border border-blue-600/30">
                  <p className="text-blue-200 text-sm">Persuing</p>
                  <p className="text-white font-bold">{batches.persuing.length}</p>
                </div>
                <div className="bg-green-700/30 px-4 py-2 rounded-lg border border-green-600/30">
                  <p className="text-green-200 text-sm">Completed</p>
                  <p className="text-white font-bold">{batches.completed.length}</p>
                </div>
                <div className="bg-yellow-700/30 px-4 py-2 rounded-lg border border-yellow-600/30">
                  <p className="text-yellow-200 text-sm">Pending</p>
                  <p className="text-white font-bold">{batches.pending.length}</p>
                </div>
                <div className="bg-purple-700/30 px-4 py-2 rounded-lg border border-purple-600/30">
                  <p className="text-purple-200 text-sm">Subjects</p>
                  <p className="text-white font-bold">{batches.subjects.length}</p>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 mb-6 justify-center"
            >
              {["Persuing", "Completed", "Pending"].map(tab => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 rounded-lg font-semibold border transition duration-200 min-w-[120px] ${
                    activeTab === tab 
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg" 
                      : "bg-blue-900/50 text-blue-200 border-blue-700 hover:bg-blue-800/70"
                  }`}
                >
                  {tab}
                  <span className="ml-2 text-xs opacity-80">
                    ({batches[tab.toLowerCase()]?.length || 0})
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {/* Batch Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {/* <h3 className="font-bold text-xl mb-4 text-center text-white">
                {activeTab} {activeTab === "Pending" ? "Subjects" : "Batches"}
                {activeTab !== "Pending" && batches.subjects.length > 0 && (
                  <span className="text-blue-300 text-sm block mt-1">
                    Organized by {batches.subjects.length} subject(s)
                  </span>
                )}
              </h3> */}
              <div className="min-h-[200px]">
                {activeTab === "Pending" ? renderPendingList() : renderBatchTable()}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50"
          >
            <div className="bg-blue-900 p-6 rounded-lg shadow-xl border border-blue-600">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full"
                />
                <span className="text-white">Loading batches...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && selectedBatch && (
          <Attendance
            attendance={attendance}
            selectedBatch={selectedBatch}
            formatDate={formatDate}
            onClose={() => setShowAttendanceModal(false)}
          />
        )}
      </motion.div>
    </div>
  );
}