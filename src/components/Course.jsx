import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../../config";
import { motion } from "framer-motion";

export default function Course() {
  const location = useLocation();
  const user = location.state?.user;
  const [selectedCourse, setSelectedCourse] = useState("");
  const [subjects, setSubjects] = useState({
    persuingSubjects: [],
    completedSubjects: [],
    pendingSubjects: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  if (!user) {
    return <p className="text-white text-center p-6">User data missing. Please login again.</p>;
  }

  console.log("👤 User data:", user);

  // Convert user.course to array if single value and clean the data
  const courses = React.useMemo(() => {
    let courseData = user.course;
    
    if (!courseData) {
      console.log("❌ No course data in user object");
      return [];
    }
    
    if (typeof courseData === 'string') {
      // Handle comma-separated courses
      courseData = courseData.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
    
    if (Array.isArray(courseData)) {
      return courseData.filter(course => course && course.trim().length > 0);
    }
    
    return [courseData];
  }, [user.course]);

  console.log("📚 Available courses:", courses);

  // Fetch subjects for selected course
  useEffect(() => {
    if (!selectedCourse) {
      console.log("⏸️ No course selected");
      return;
    }

    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      try {
        console.log(`🔄 Fetching subjects for course: ${selectedCourse}`);
        
        const url = `${BASE_URL}/api/courses/details?name_contactid=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}`;
        console.log("📡 Request URL:", url);

        const res = await fetch(url);

        console.log("📥 Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Server response error:", errorText);
          throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("📦 Response data:", data);

        if (!data.success) {
          throw new Error(data.message || "Error fetching data");
        }

        setSubjects({
          persuingSubjects: data.data.persuingSubjects || [],
          completedSubjects: data.data.completedSubjects || [],
          pendingSubjects: data.data.pendingSubjects || [],
        });

        // Store debug info
        if (data.data.debug) {
          setDebugInfo(data.data.debug);
        }

        console.log("✅ Subjects loaded successfully");
        
      } catch (err) {
        console.error("💥 Fetch error:", err);
        setError(err.message);
        setSubjects({
          persuingSubjects: [],
          completedSubjects: [],
          pendingSubjects: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedCourse, user.name_contactid]);

  // Auto-select first course if only one exists
  useEffect(() => {
    if (courses.length === 1 && !selectedCourse) {
      console.log("🎯 Auto-selecting single course:", courses[0]);
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  // Combine all subjects with their status
  const getAllSubjectsWithStatus = () => {
    const allSubjects = [
      ...subjects.persuingSubjects.map(subject => ({
        ...subject,
        status: "Persuing",
        statusColor: "bg-blue-500",
        borderColor: "border-blue-400/30",
        bgColor: "bg-blue-800/30",
        isCombined: !!subject.originalCombinedSubject
      })),
      ...subjects.completedSubjects.map(subject => ({
        ...subject,
        status: "Completed",
        statusColor: "bg-green-500",
        borderColor: "border-green-400/30",
        bgColor: "bg-green-800/30",
        isCombined: !!subject.originalCombinedSubject
      })),
      ...subjects.pendingSubjects.map(subject => ({
        ...subject,
        status: "Pending",
        statusColor: "bg-yellow-500",
        borderColor: "border-yellow-400/30",
        bgColor: "bg-yellow-800/30",
        isCombined: !!subject.originalCombinedSubject
      }))
    ];

    return allSubjects;
  };

  const renderAllSubjects = () => {
    const allSubjects = getAllSubjectsWithStatus();

    if (loading) return <p className="text-blue-200 text-center">Loading subjects...</p>;
    if (error) return <p className="text-red-400 text-center">Error: {error}</p>;

    if (allSubjects.length === 0) {
      return (
        <div className="text-center text-gray-300 p-8">
          <p>No subjects found for this course.</p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Requested: {debugInfo.originalCourse}</p>
              <p>Used: {debugInfo.actualCourseUsed}</p>
              <p>Available: {debugInfo.availableCourses.join(', ')}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <motion.ul 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3 max-h-96 overflow-y-auto"
      >
        {allSubjects.map((subject, i) => (
          <motion.li
            key={`${subject.subject}-${i}-${subject.status}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${subject.bgColor} text-white p-4 rounded-lg border ${subject.borderColor} hover:opacity-90 transition duration-200 flex justify-between items-center group`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">{subject.subject || subject.subjectname}</span>
              {subject.isCombined && (
                <span 
                  className="text-xs bg-gray-600 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title={`Part of combined subject: ${subject.originalCombinedSubject}`}
                >
                  Combined
                </span>
              )}
            </div>
            <span className={`${subject.statusColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
              {subject.status}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    );
  };

  // Get counts for summary
  const getSubjectCounts = () => {
    const allSubjects = getAllSubjectsWithStatus();
    return {
      total: allSubjects.length,
      completed: subjects.completedSubjects.length,
      persuing: subjects.persuingSubjects.length,
      pending: subjects.pendingSubjects.length,
      combinedSubjects: allSubjects.filter(subject => subject.isCombined).length
    };
  };

  const counts = getSubjectCounts();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Course Details</h2>
          <p className="text-gray-300">Track your course progress and subjects</p>
        </motion.div>

        {/* Debug Info */}
        {/* {debugInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600 text-sm"
          >
            <p className="text-gray-300"><strong>Debug:</strong> Requested: "{debugInfo.originalCourse}" | Used: "{debugInfo.actualCourseUsed}"</p>
          </motion.div>
        )} */}

        {/* Course Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="w-full md:w-2/3 lg:w-1/2">
            <label htmlFor="course-select" className="block text-white text-sm font-semibold mb-2 text-center">
              Select Your Course
            </label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border border-blue-600 rounded-lg bg-blue-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="" className="bg-blue-900 text-white">-- Select a course --</option>
              {courses.map((course, index) => (
                <option key={index} value={course} className="bg-blue-900 text-white">
                  {course}
                </option>
              ))}
            </select>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {courses.length} course(s) available
            </p>
          </div>
        </motion.div>

        {/* Course Content */}
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
                <span className="text-blue-300">{selectedCourse}</span> Course Details
              </h3>
              
              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center gap-4 mt-4"
              >
                <div className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-600/30">
                  <div className="text-2xl font-bold text-white">{counts.total}</div>
                  <div className="text-blue-200 text-sm">Total Subjects</div>
                </div>
                <div className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-600/30">
                  <div className="text-2xl font-bold text-white">{counts.persuing}</div>
                  <div className="text-blue-200 text-sm">Persuing</div>
                </div>
                <div className="bg-green-900/50 px-4 py-2 rounded-lg border border-green-600/30">
                  <div className="text-2xl font-bold text-white">{counts.completed}</div>
                  <div className="text-green-200 text-sm">Completed</div>
                </div>
                <div className="bg-yellow-900/50 px-4 py-2 rounded-lg border border-yellow-600/30">
                  <div className="text-2xl font-bold text-white">{counts.pending}</div>
                  <div className="text-yellow-200 text-sm">Pending</div>
                </div>
              </motion.div>
            </motion.div>

            {/* All Subjects List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-3xl mx-auto"
            >
              <h3 className="font-bold text-xl mb-4 text-center text-white">
                All Subjects ({counts.total})
              </h3>
              <div className="min-h-[300px]">
                {renderAllSubjects()}
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
                <span className="text-white">Loading subjects...</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}