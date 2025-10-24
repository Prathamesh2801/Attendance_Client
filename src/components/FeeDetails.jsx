import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRupeeSign, FaReceipt } from "react-icons/fa";
import { motion } from "framer-motion";
import { BASE_URL } from "../../config";

export default function FeeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [paymentData, setPaymentData] = useState([]);
  const [processedPaymentData, setProcessedPaymentData] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPaymentDetails();
  }, [user, navigate]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (user.name_contactid) params.append("name", user.name_contactid);
      if (user.contact) params.append("contactId", user.contact);

      const response = await fetch(`${BASE_URL}/api/feedetails?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        const payments = result.data.payments || [];
        const processedPayments = calculateRunningBalance(payments);
        const sortedProcessedPayments = [...processedPayments].sort(
          (a, b) => new Date(a.Dates) - new Date(b.Dates)
        );

        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.Paid || 0), 0);
        const courseFees = payments[0]?.courseFees || 0;
        const totalAmount = courseFees;
        const totalDue = Math.max(totalAmount - totalPaid, 0);

        setPaymentData(payments);
        setProcessedPaymentData(sortedProcessedPayments);
        setSummary({
          totalAmount,
          totalPaid,
          totalDue,
          totalPayments: payments.length,
        });
      } else {
        setError(result.message || "Failed to fetch payment details");
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError("Network error: Unable to fetch payment details");
    } finally {
      setLoading(false);
    }
  };

  const calculateRunningBalance = (payments) => {
    if (!payments.length) return [];
    const sortedPayments = [...payments].sort(
      (a, b) => new Date(a.Dates) - new Date(b.Dates)
    );
    const totalAmount = parseFloat(sortedPayments[0]?.courseFees || 0);
    let runningBalance = totalAmount;

    return sortedPayments.map((payment) => {
      const paidAmount = parseFloat(payment.Paid || 0);
      runningBalance = runningBalance - paidAmount;
      return {
        ...payment,
        calculatedBalance: Math.max(runningBalance, 0),
      };
    });
  };

  if (!user) return null;

  const formatCurrency = (amt) =>
    parseFloat(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "N/A";

  const getStatusText = (p) => {
    const balance = p.calculatedBalance || parseFloat(p.Balance || 0);
    const paid = parseFloat(p.Paid || 0);
    const totalAmount = parseFloat(p.courseFees || 0);
    if (balance === 0 && paid > 0) return "Paid";
    if (paid === 0 && balance === totalAmount) return "Pending";
    if (paid > 0 && balance > 0) return "Partial";
    return "Unknown";
  };

  const getStatusColor = (p) => {
    const balance = p.calculatedBalance || parseFloat(p.Balance || 0);
    const paid = parseFloat(p.Paid || 0);
    const totalAmount = parseFloat(p.courseFees || 0);
    if (balance === 0 && paid > 0) return "bg-green-500/30 text-green-300";
    if (paid === 0 && balance === totalAmount) return "bg-red-500/30 text-red-300";
    if (paid > 0 && balance > 0) return "bg-yellow-500/30 text-yellow-300";
    return "bg-gray-500/30 text-gray-300";
  };

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
            >
              <FaArrowLeft className="text-xs" /> Back
            </button>
            <h1 className="text-xl font-bold text-white">Fees Details</h1>
          </div>
        </motion.div>

        {/* Summary Cards - Side by side with no spaces */}
        {!loading && processedPaymentData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-row justify-center items-stretch mt-6 gap-0 max-w-2xl mx-auto"
          >
            {/* Course Fees Card */}
            <div className="bg-blue-700/30 p-4 border border-blue-500/40 text-white text-center flex-1 min-w-0 rounded-l-lg">
              <h3 className="text-sm font-semibold text-blue-300 mb-1">
                Course Fees
              </h3>
              <p className="text-lg font-bold flex justify-center items-center text-blue-200">
                <FaRupeeSign className="mr-1 text-xs" />
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            
            {/* Fees Paid Card */}
            <div className="bg-green-700/30 p-4 border border-green-500/40 text-white text-center flex-1 min-w-0 border-l-0 border-r-0">
              <h3 className="text-sm font-semibold text-green-300 mb-1">
                Fees Paid
              </h3>
              <p className="text-lg font-bold flex justify-center items-center text-green-200">
                <FaRupeeSign className="mr-1 text-xs" />
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            
            {/* Balance Card */}
            <div className="bg-red-700/30 p-4 border border-red-500/40 text-white text-center flex-1 min-w-0 rounded-r-lg">
              <h3 className="text-sm font-semibold text-red-300 mb-1">
                Balance
              </h3>
              <p className="text-lg font-bold flex justify-center items-center text-red-200">
                <FaRupeeSign className="mr-1 text-xs" />
                {formatCurrency(summary.totalDue)}
              </p>
              {processedPaymentData.length > 0 && (
                <p className="text-xs text-gray-300 mt-1">
                  Last Payment {formatDate(processedPaymentData[processedPaymentData.length - 1]?.Dates)}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-800/40 border border-red-600/40 text-red-200 px-3 py-2 rounded mb-4 text-center text-sm max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Payment Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-800/20 border border-blue-600/30 backdrop-blur-sm rounded-lg overflow-hidden mt-6"
        >
          <div className="px-4 py-3 border-b border-blue-600/30">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaReceipt className="mr-2 text-blue-300 text-sm" />
              Payment History
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-300">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-sm">Loading payment details...</p>
            </div>
          ) : processedPaymentData.length === 0 ? (
            <div className="p-6 text-center text-gray-300 text-sm">
              No payment records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-white">
                <thead className="bg-blue-900/40">
                  <tr>
                    {[
                      "Date",
                      "Paid",
                      "Balance",
                      "Course Fees",
                      "Receipt No",
                      "Course",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-blue-300 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedPaymentData.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-blue-600/20 hover:bg-blue-700/30 transition"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span>{formatDate(p.Dates)}</span>
                          {i === processedPaymentData.length - 1 && (
                            <span className="text-xs text-green-400 font-medium">
                              (Last)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-green-300">
                        ₹{formatCurrency(p.Paid)}
                      </td>
                      <td className="px-3 py-2 text-red-300">
                        ₹{formatCurrency(p.calculatedBalance)}
                      </td>
                      <td className="px-3 py-2 text-blue-300">
                        ₹{formatCurrency(p.courseFees)}
                      </td>
                      <td className="px-3 py-2">{p.Receipt || "N/A"}</td>
                      <td className="px-3 py-2">{p.course || "N/A"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            p
                          )}`}
                        >
                          {getStatusText(p)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}