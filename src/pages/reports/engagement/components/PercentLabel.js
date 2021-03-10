import React from 'react';

const LABEL = { height: 24, width: 64 };

// NOTE: ReferenceArea was used because they could easily attach to two bars and provide the
// coordinates and dimmenions to reliable place this label
export default function PercentLabel({
  percentage,
  width, // area around each bar, these touch and sum up to the total width
  x,
  yAxis
}) {
  const offset = width - (LABEL.width / 2);
  const y = yAxis.y + (yAxis.height / yAxis.tickCount) * Math.round(yAxis.tickCount / 2);

  return (
    <g>
      <svg {...LABEL} x={x + offset} y={y - LABEL.height / 2 + 1}>
        <path
          d="M3 1h52c.7 0 1.3.3 1.6.8l6.4 9c.5.7.5 1.7-.1 2.4l-6.3 8c-.4.5-1 .8-1.6.8H3a2 2 0 0 1-2-2V3c0-1.1.9-2 2-2z"
          fill="white"
          stroke="#e1e1e6"
          strokeMiterlimit="10"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <text x={x + offset + 5} y={y + 6} fill="#55555a">{percentage}</text>
    </g>
  );
}
