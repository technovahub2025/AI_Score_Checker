export const easeOutQuint = [0.22, 1, 0.36, 1];

export const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: easeOutQuint }
};

export const sectionReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOutQuint
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easeOutQuint
    }
  }
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.18, ease: easeOutQuint } },
  whileTap: { scale: 0.99 }
};

export const pressScale = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: easeOutQuint } },
  whileTap: { scale: 0.985 }
};

export const glowFade = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutQuint }
  }
};
