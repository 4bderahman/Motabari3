import { motion } from "framer-motion";
import CountUp from "react-countup";
import PropTypes from "prop-types";
import {
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const ImpactCounter = ({ total, progress }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#500000] rounded-xl p-8 text-white"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 mb-6"
      >
        <SparklesIcon className="h-6 w-6 text-white/80" />
        <h3 className="text-2xl font-bold">Your Impact</h3>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-white/80">
            Total Donations
          </span>
          <motion.span
            className="text-3xl font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            $<CountUp end={total} separator="," duration={2.5} />
          </motion.span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className="mt-2 text-right">
          <span className="text-sm font-medium text-white/80">
            {progress}% of monthly goal
          </span>
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <HeartIcon className="h-5 w-5 text-white/80" />
            <span className="text-white/80">Lives Impacted</span>
          </div>
          <motion.span
            className="font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <CountUp end={Math.floor(total / 100)} separator="," duration={2} />
            +
          </motion.span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-5 w-5 text-white/80" />
            <span className="text-white/80">Donors This Month</span>
          </div>
          <motion.span
            className="font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <CountUp end={Math.floor(total / 250)} separator="," duration={2} />
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};

ImpactCounter.propTypes = {
  total: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

export default ImpactCounter;
