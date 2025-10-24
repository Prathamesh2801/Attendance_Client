import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  Save,
  X,
  Edit3,
  Calendar,
  BookOpen,
  GraduationCap,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const [profileData, setProfileData] = useState({
    username: user.username || user.email?.split("@")[0] || "student",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePhoto: user.profilePhoto || null,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showActualPassword, setShowActualPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          profilePhoto: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileData((prev) => ({
      ...prev,
      profilePhoto: null,
    }));
  };

  const handleSaveChanges = () => {
    if (isEditing) {
      if (
        profileData.newPassword &&
        profileData.newPassword !== profileData.confirmPassword
      ) {
        setMessage("error:New passwords don't match!");
        return;
      }

      if (profileData.newPassword && !profileData.currentPassword) {
        setMessage("error:Please enter current password to change password");
        return;
      }

      setMessage("success:Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setMessage("");
        setProfileData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      }, 2000);
    } else {
      setProfileData((prev) => ({
        ...prev,
        currentPassword: user.password || "",
      }));
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: user.username || user.email?.split("@")[0] || "student",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      profilePhoto: user.profilePhoto || null,
    });
    setIsEditing(false);
    setMessage("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowActualPassword(false);
  };

  const messageType = message.split(":")[0];
  const messageText = message.split(":")[1];

  return (
    <div className="min-h-screen  py-8  sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl mb-6 p-6 border border-purple-100"
        >
          <div className="flex items-center justify-between">
            <button onClick={()=>navigate(-1)} className="p-2 hover:bg-purple-50 rounded-xl transition-colors duration-200">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Profile
            </h1>
            <div className="w-10" />
          </div>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-purple-100"
        >
          {/* Profile Header Section */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 sm:px-8 pt-8 pb-20">
            <div className="flex flex-col items-center">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-2xl">
                  {profileData.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/70" />
                  )}
                </div>

                {isEditing && (
                  <>
                    <motion.label
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      htmlFor="photo-upload"
                      className="absolute bottom-2 right-2 bg-white text-purple-600 p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Camera className="w-5 h-5" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </motion.label>
                    {profileData.profilePhoto && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemovePhoto}
                        className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-white mt-4"
              >
                {user.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-purple-100 mt-1"
              >
                {user.email}
              </motion.p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-4 sm:px-8 -mt-10">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2 text-purple-600" />
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none transition-all duration-200"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                    Admission Date
                  </label>
                  <input
                    type="text"
                    value={formatDate(user.date12)}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none transition-all duration-200"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                    Branch
                  </label>
                  <input
                    type="text"
                    value={user.branch}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none transition-all duration-200"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                    Course
                  </label>
                  <input
                    type="text"
                    value={user.course}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none transition-all duration-200"
                  />
                </motion.div>
              </div>

              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    isEditing
                      ? "border-purple-300 bg-white text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  } focus:outline-none`}
                />
              </motion.div>

              {/* Password Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="border-t-2 border-gray-100 pt-6 space-y-4"
              >
                <h3 className="flex items-center text-lg font-bold text-gray-800">
                  <Lock className="w-5 h-5 mr-2 text-purple-600" />
                  Password Settings
                </h3>

                {!isEditing ? (
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type={showActualPassword ? "text" : "password"}
                      value={
                        showActualPassword
                          ? user.password || "yourpassword"
                          : "••••••••"
                      }
                      disabled
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowActualPassword(!showActualPassword)}
                      className="absolute right-4 top-11 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    >
                      {showActualPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={profileData.currentPassword}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 pr-12 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-4 top-11 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={profileData.newPassword}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 pr-12 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-11 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={profileData.confirmPassword}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 pr-12 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-11 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${
                      messageType === "success"
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    {messageType === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        messageType === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {messageText}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveChanges}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </motion.button>
                  </>
                ) : (
                  // <motion.button
                  //   whileHover={{ scale: 1.02 }}
                  //   whileTap={{ scale: 0.98 }}
                  //   onClick={handleSaveChanges}
                  //   disabled
                  //   className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:bg-slate-600"
                  // >
                  //   <Edit3 className="w-5 h-5" />
                  //   Edit Profile
                  // </motion.button>
                  <button
                    onClick={handleSaveChanges}
                    disabled
                    className="px-4 py-2 bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed transition duration-300"
                    title="Edit profile is currently disabled"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Spacing */}
          <div className="h-6"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
