import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Making a difference has never been easier. This platform helped me contribute to saving lives.",
    author: "Sarah M.",
    role: "Regular Donor",
  },
  {
    quote:
      "The impact of every donation is truly visible. Proud to be part of this community.",
    author: "Ahmed K.",
    role: "Monthly Supporter",
  },
  {
    quote:
      "A seamless experience that makes giving back meaningful and rewarding.",
    author: "Fatima R.",
    role: "Blood Donor",
  },
  {
    quote: "Together, we're making a real difference in people's lives.",
    author: "Omar H.",
    role: "Community Member",
  },
];




const TestimonialCarousel = () => {
  return (
    <div className="w-full py-12 overflow-hidden " >
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 15,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {/* Double the testimonials for seamless loop */}
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100/10"
            >
              <p className="text-sm text-gray-600 italic mb-3">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
