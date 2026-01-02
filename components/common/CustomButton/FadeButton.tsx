import React, { useMemo, ButtonHTMLAttributes } from 'react';
import { motion, Variants } from 'framer-motion';

export type FadeButtonProps = {
  direction?: 'up' | 'down' | 'left' | 'right';
  framerProps?: Variants;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const FadeButton: React.FC<FadeButtonProps> = ({
  direction = 'up',
  framerProps = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { type: 'spring' } },
  },
  className,
  ...props
}) => {
  const directionOffset = useMemo(() => {
    const map = { up: 10, down: -10, left: -10, right: 10 };
    return map[direction];
  }, [direction]);

  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';

  const FADE_ANIMATION_VARIANTS = useMemo(() => {
    const { hidden, show, ...rest } = framerProps as {
      [name: string]: { [name: string]: number; opacity: number };
    };

    return {
      ...rest,
      hidden: {
        ...(hidden ?? {}),
        opacity: hidden?.opacity ?? 0,
        [axis]: hidden?.[axis] ?? directionOffset,
      },
      show: {
        ...(show ?? {}),
        opacity: show?.opacity ?? 1,
        [axis]: show?.[axis] ?? 0,
      },
    };
  }, [directionOffset, axis, framerProps]);

  return (
    <motion.div
      initial='hidden'
      animate='show'
      viewport={{ once: true }}
      variants={FADE_ANIMATION_VARIANTS}
    >
      {/*@ts-ignore*/}
      <motion.button className={className} {...props} />
    </motion.div>
  );
};

export default FadeButton;
