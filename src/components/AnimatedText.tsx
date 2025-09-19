import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedTextProps {
  text: string;
  el?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  animationType?: 'letter' | 'word';
  delay?: number;
  stagger?: number;
  duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  el: Wrapper = 'p',
  className,
  style,
  animationType = 'letter',
  delay = 0,
  stagger = 0.125,
  duration = 0.75,
}) => {
  const lines = text.split(/<br \/>/g);

  // Calculate the delay for each line based on the number of words in previous lines.
  const lineDelays = lines.reduce<number[]>((acc, line, i) => {
    if (i === 0) {
      acc.push(delay);
      return acc;
    }
    const previousLineWordCount = lines[i - 1].split(' ').filter(Boolean).length;
    const previousDelay = acc[i - 1];

    if (previousLineWordCount === 0) {
        // For an empty line, it's animated instantly, so no extra delay.
        acc.push(previousDelay);
        return acc;
    }

    // The delay for the current line is the delay of the previous line
    // plus the animation duration of the previous line, minus 300ms for overlap.
    acc.push(previousDelay + (previousLineWordCount * stagger) + duration - 0.3);
    return acc;
  }, []);

  const container = (lineDelay: number) => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: lineDelay },
    },
  });

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 0,
      transition: {
        type: 'tween',
        duration: duration,
      },
    },
  };

  if (animationType === 'word') {
    return (
      <Wrapper className={className} style={style}>
        {lines.map((line, lineIndex) => (
          <motion.span
            key={lineIndex}
            variants={container(lineDelays[lineIndex])}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexWrap: 'wrap' }}
          >
            {line.split(' ').map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                variants={child}
                style={{ marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
            {lineIndex < lines.length - 1 && <br />}
          </motion.span>
        ))}
      </Wrapper>
    );
  } else {
    const letters = Array.from(text);
    return (
      <Wrapper className={className} style={style}>
        <motion.span
          variants={container(delay)}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexWrap: 'wrap' }}
        >
          {letters.map((letter, index) => (
            <motion.span key={index} variants={child}>
              {letter === ' ' ? ' ' : letter}
            </motion.span>
          ))}
        </motion.span>
      </Wrapper>
    );
  }
};

export default AnimatedText; 