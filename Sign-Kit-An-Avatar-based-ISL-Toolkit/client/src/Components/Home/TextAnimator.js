import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** WordReveal component */
export const WordReveal = ({
  text,
  children,
  className = '',
  style = {},
  delay = 0,
  staggerDuration = 0.08,
  as = 'div',
  forceVisible = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const content = text || children;

  // Non-string or reduced motion: simple fade
  if (typeof content !== 'string' || shouldReduceMotion) {
    const Tag = motion[as] || motion.div;
    return (
      <Tag
        className={className}
        style={style}
        initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
        {...(forceVisible
          ? { animate: { opacity: 1 }, transition: { duration: shouldReduceMotion ? 0.01 : 0.6, delay } }
          : {
              whileInView: { opacity: 1 },
              viewport: { once: false, amount: 0.2 },
              transition: { duration: shouldReduceMotion ? 0.01 : 0.6, delay },
            })}
      >
        {content}
      </Tag>
    );
  }

  const words = content.split(' ');
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDuration,
      },
    },
  };
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 22,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      style={{ display: 'inline-block', ...style }}
      variants={containerVariants}
      initial="hidden"
      {...(forceVisible ? { animate: "visible" } : { whileInView: "visible", viewport: { once: false, amount: 0.2 } })}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.28em', willChange: 'transform, opacity, filter' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

/** FadeUpText component */
export const FadeUpText = ({
  children,
  className = '',
  style = {},
  delay = 0.2,
  duration = 0.85,
  yOffset = 25,
  as = 'p',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : yOffset,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(5px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };
  const Tag = motion[as] || motion.p || motion.div;
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </Tag>
  );
};

/** StaggerContainer component */
export const StaggerContainer = ({
  children,
  className = '',
  style = {},
  staggerDelay = 0.12,
  delayChildren = 0.1,
  as = 'div',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      variants={containerVariants}
    >
      {children}
    </Tag>
  );
};

/** StaggerItem component */
export const StaggerItem = ({
  children,
  className = '',
  style = {},
  yOffset = 30,
  as = 'div',
  ...restProps
}) => {
  const shouldReduceMotion = useReducedMotion();
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : yOffset,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.7,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };
  const Tag = motion[as] || motion.div;
  return (
    <Tag className={className} style={style} variants={itemVariants} {...restProps}>
      {children}
    </Tag>
  );
};

export default WordReveal;

