import React from 'react';
import { differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import TimeAgo from 'react-timeago';

const DisplayDate = ({ timestamp, formattedDate, diffTime = 23, diffScale }) => {
  let diffCheck;

  switch (diffScale) {
    case 'seconds':
      diffCheck = differenceInSeconds;
      break;
    case 'minutes':
      diffCheck = differenceInMinutes;
      break;
    case 'hours':
    default:
      diffCheck = differenceInHours;
  }

  if (diffCheck(Date.now(), new Date(timestamp)) > diffTime) {
    return formattedDate;
  }
  return <TimeAgo date={timestamp} />;
};

export default DisplayDate;
