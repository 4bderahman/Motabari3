import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const trustBadges = [
  { id: 1, text: "256-bit SSL Encryption", icon: LockClosedIcon },
  { id: 2, text: "PCI DSS Compliant", icon: ShieldCheckIcon },
  { id: 3, text: "Secure Payment Processing", icon: CreditCardIcon },
  { id: 4, text: "Data Protection", icon: DocumentTextIcon },
  { id: 5, text: "Verified by Stripe", icon: CheckBadgeIcon },
  { id: 6, text: "Bank-Level Security", icon: BuildingLibraryIcon },
];

const TrustBadges = () => {
  return (
    <div className="w-full py-8 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          className="flex gap-6"
          animate={{ x: ["-50%", "0%"] }} // Reverse direction
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {/* Double the badges for seamless loop */}
          {[...trustBadges, ...trustBadges].map((badge, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-gray-100/10 flex items-center gap-2"
            >
              <badge.icon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-gray-600 whitespace-nowrap">
                {badge.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TrustBadges;
