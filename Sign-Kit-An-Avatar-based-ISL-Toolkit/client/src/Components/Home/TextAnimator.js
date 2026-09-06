import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * WordReveal component splits a text string into words and animates them sequentially.
 * Replays every time element enters/re-enters the viewport (once: false).
 */
export const WordReveal = ({
  text,
  children,
  className = '',
  style = {},
  delay = 0,
  staggerDuration = 0.08,
  as = 'div'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const content = text || children;

  // Handle non-string content or reduced motion preference
  if (typeof content !== 'string' || shouldReduceMotion) {
    const Component = motion[as] || motion.div;
    return (
      <Component
        className={className}
        style={style}
        initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay }}
      >
        {content}
      </Component>
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
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic curve
      },
    },
  };

  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      style={{ display: 'inline-block', ...style }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          style={{
            display: 'inline-block',
            marginRight: '0.28em',
            willChange: 'transform, opacity, filter',
          }}
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
};

/**
 * FadeUpText component handles paragraph/description animations.
 * Replays every time element enters the viewport.
 */
export const FadeUpText = ({
  children,
  className = '',
  style = {},
  delay = 0.2,
  duration = 0.85,
  yOffset = 25,
  as = 'p'
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

  const Component = motion[as] || motion.p;

  return (
    <Component
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </Component>
  );
};

/**
 * StaggerContainer component wraps card grids to trigger staggered entrance animations.
 * Replays stagger every time container enters/re-enters the viewport (once: false).
 */
export const StaggerContainer = ({
  children,
  className = '',
  style = {},
  staggerDelay = 0.12,
  delayChildren = 0.1,
  as = 'div'
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

  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      variants={containerVariants}
    >
      {children}
    </Component>
  );
};

/**
 * StaggerItem component for individual cards inside StaggerContainer.
 * Guarantees card transitions to opacity: 1, y: 0 and remains 100% visible after entrance animation.
 */
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

  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      style={style}
      variants={itemVariants}
      {...restProps}
    >
      {children}
    </Component>
  );
};
