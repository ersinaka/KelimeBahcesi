import { motion } from 'framer-motion';

const PETALS = ['🍃', '⭐', '🌿', '✨', '🌱'];

/** Doğru cevapta yumuşak yaprak/yıldız — konfeti değil. */
export function SoftPetals({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="soft-petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <motion.span
          key={`${p}-${i}`}
          className="soft-petals__item"
          initial={{ opacity: 0, y: 12, x: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 0],
            y: -70 - i * 8,
            x: (i - 2) * 28,
            scale: 1,
          }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.04 }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
}
