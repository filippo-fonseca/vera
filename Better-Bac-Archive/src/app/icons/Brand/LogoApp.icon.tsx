import React from 'react';
import { IconProps } from '..';

const LogoAppIcon = (props: IconProps) => {
  return (
    <svg
      width='145'
      height='144'
      viewBox='0 0 145 144'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g filter='url(#filter0_d_1_9)'>
        <rect
          x='25'
          y='21'
          width='94.0649'
          height='94.0001'
          rx='12'
          fill='white'
          shape-rendering='crispEdges'
        />
        <rect
          x='25.5'
          y='21.5'
          width='93.0649'
          height='93.0001'
          rx='11.5'
          stroke='#CFCFD6'
          shape-rendering='crispEdges'
        />
        <path
          d='M70.3544 95.0001C69.6172 94.9975 68.8895 94.8347 68.2214 94.5231C67.1302 94.0372 66.2538 93.1697 65.7567 92.0835C65.2595 90.9974 65.1759 89.7671 65.5214 88.6236L69.0336 77.0001H60.7581C59.7038 77.0014 58.6638 76.7557 57.7216 76.2826C56.7793 75.8096 55.9609 75.1224 55.3321 74.2761C54.7032 73.4298 54.2814 72.448 54.1003 71.4093C53.9192 70.3707 53.984 69.304 54.2894 68.2949L61.0934 45.7949C61.5081 44.4032 62.363 43.1836 63.5298 42.319C64.6966 41.4545 66.1123 40.9917 67.5644 41.0001H75.8736C76.8181 41.0009 77.7483 41.2303 78.5848 41.6688C79.4213 42.1073 80.1392 42.7418 80.6771 43.5181C81.215 44.2944 81.557 45.1894 81.6738 46.1265C81.7906 47.0637 81.6788 48.0153 81.3479 48.8999L77.5611 59.0001H83.3144C84.5408 59 85.744 59.334 86.7948 59.9663C87.8457 60.5985 88.7044 61.5051 89.2788 62.5887C89.8532 63.6722 90.1215 64.8917 90.055 66.1163C89.9884 67.3409 89.5895 68.5242 88.9011 69.5391L74.5011 92.7141C74.056 93.4113 73.4432 93.9858 72.7188 94.3851C71.9945 94.7844 71.1815 94.9959 70.3544 95.0001Z'
          fill='#EC4899'
        />
      </g>
      <defs>
        <filter
          id='filter0_d_1_9'
          x='0'
          y='0'
          width='144.065'
          height='144'
          filterUnits='userSpaceOnUse'
          color-interpolation-filters='sRGB'
        >
          <feFlood flood-opacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4' />
          <feGaussianBlur stdDeviation='12.5' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0.537255 0 0 0 0 0.592157 0 0 0 0 0.686275 0 0 0 0.5 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_1_9'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1_9'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

export default LogoAppIcon;
