import IBCoursesIcon from '@BetterBac/app/icons/IBElementIcons/IBCourses.icon';
import React from 'react';
import OrbitingCircles from './Circles';

type CompiledCircleElemData = {
  icon: React.ReactNode;
  text: string;
  color: string;
  duration: number;
  delay: number;
  radius: number;
};

const CompiledCircleElem = (props: CompiledCircleElemData) => {
  return (
    <OrbitingCircles
      className={`size-[80px] flex items-center border-${props.color} bg-green-500/20`}
      duration={props.duration}
      delay={props.delay}
      radius={props.radius}
    >
      <div className='flex flex-col items-center justify-center gap-1'>
        {props.icon}
        <p className={`text-[10px] text-${props.color} font-semibold`}>
          {props.text}
        </p>
      </div>
    </OrbitingCircles>
  );
};

export default CompiledCircleElem;
