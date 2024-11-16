import { motion } from "framer-motion";
import { Cpu, Zap } from "lucide-react";

export function Logo() {
  return (
    <motion.div
      className="flex items-center gap-3 group"
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative">
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          whileHover={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Main logo icon */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Cpu className="w-8 h-8 text-blue-500 relative z-10" />

          {/* Lightning effect */}
          <motion.div
            className="absolute -right-1 -top-1 z-20"
            initial={{ opacity: 0, rotate: -45 }}
            whileHover={{
              opacity: [0, 1, 0],
              x: [0, 2, 0],
              y: [0, -2, 0],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>

      <motion.h1
        className="text-2xl font-bold relative"
        whileHover={{ scale: 1.05 }}
      >
        {/* Text with gradient */}
        <span
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent
                       bg-[size:200%] animate-gradient"
        >
          SoliCode
        </span>

        {/* Glowing line underneath */}
        <motion.div
          className="absolute -bottom-1 left-0 h-[2px] bg-blue-500"
          initial={{ width: "0%" }}
          whileHover={{
            width: "100%",
            transition: { duration: 0.3 },
          }}
        />
      </motion.h1>
    </motion.div>
  );
}
