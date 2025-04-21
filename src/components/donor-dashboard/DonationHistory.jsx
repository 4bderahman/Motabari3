import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Droplet, Calendar as CalendarIcon, Clock } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function DonationHistory({ history, appointments }) {
  const hasHistory = history && history.length > 0;
  const hasAppointments = appointments && appointments.length > 0;

  if (!hasHistory && !hasAppointments) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 bg-gradient-to-r from-dark_red to-red">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Donation History
          </h2>
        </div>
        <div className="p-8 flex flex-col items-center justify-center h-[300px] text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <Droplet className="w-8 h-8 text-dark_red" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Donations Yet
          </h3>
          <p className="text-gray-500 max-w-sm">
            Start your journey of saving lives today. Every donation can help up
            to three people in need.
          </p>
        </div>
      </motion.div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "donated":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "not_yet":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Create a map to track unique donations by date and status
  const uniqueDonationsMap = new Map();

  // Process history items
  history.forEach((item) => {
    const key = `${item.date}-${
      item.status || item.donated ? "donated" : "not_yet"
    }`;
    if (!uniqueDonationsMap.has(key)) {
      uniqueDonationsMap.set(key, {
        ...item,
        status: item.donated ? "donated" : "not_yet",
      });
    }
  });

  // Process appointments only if they don't overlap with history
  appointments.forEach((item) => {
    const key = `${item.date}-${item.status}`;
    if (!uniqueDonationsMap.has(key)) {
      uniqueDonationsMap.set(key, item);
    }
  });

  // Convert map to array and sort by date
  const sortedItems = Array.from(uniqueDonationsMap.values()).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 bg-gradient-to-r from-dark_red to-red">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Donation History & Appointments
        </h2>
      </div>
      <div className="p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="h-[300px] overflow-y-auto custom-scrollbar pr-2"
        >
          <table className="min-w-full">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Units
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item, index) => (
                <motion.tr
                  key={`${item.id || item.date}-${index}`}
                  variants={itemVariants}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-dark_red">
                      {item.units} ml
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status === "not_yet" ? "Scheduled" : "Donated"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </motion.div>
  );
}

DonationHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      units: PropTypes.number.isRequired,
      status: PropTypes.oneOf(["not_yet", "donated"]),
      donated: PropTypes.bool,
    })
  ),
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      units: PropTypes.number.isRequired,
      status: PropTypes.oneOf(["not_yet", "donated"]).isRequired,
    })
  ),
};

export default DonationHistory;
