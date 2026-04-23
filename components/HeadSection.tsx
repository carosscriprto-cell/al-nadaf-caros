'use client';

import { motion } from "framer-motion";

interface HeadSectionProps {
  title: string;
  description: string;
  divider?: boolean;
}

export default function HeadSection({ title, description, divider }: HeadSectionProps) {
  return (
    <div className="mb-16 text-center">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold tracking-tight"
      >
        <span className="
          bg-gradient-to-r 
          from-foreground/90
          via-foreground/70 
          to-accent
          bg-clip-text 
          text-transparent
        ">
          {title}
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="mt-3 max-w-2xl mx-auto text-muted-foreground text-base md:text-lg"
      >
        {description}
      </motion.p>

      {/* Divider */}
      {divider && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-4 flex justify-center"
        >
          <div className="
            h-[3px] w-30 rounded-full 
            bg-gradient-to-r 
            from-transparent 
            via-accent 
            to-transparent
          " />
        </motion.div>
      )}
    </div>
  );
}
