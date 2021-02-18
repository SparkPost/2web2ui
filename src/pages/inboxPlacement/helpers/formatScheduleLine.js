import React from 'react';
import moment from 'moment';
import { STATUS } from '../constants/test';
import { FORMATS } from 'src/constants';
import { InlineItems } from 'src/components/structure';
import { Bold } from 'src/components/text';

const formatDateTime = start_time => moment(start_time).format(FORMATS.MOMENT.LONG_DATETIME_ALT);

export default function formatScheduleLine(status, start_time, end_time) {
  const formatted_start_time = formatDateTime(start_time);

  switch (status) {
    case STATUS.RUNNING: {
      return (
        <>
          <Bold>Sent</Bold> {formatted_start_time}
        </>
      );
    }
    case STATUS.STOPPED: {
      return (
        <InlineItems compact>
          <span>
            <Bold>Sent</Bold> {formatted_start_time}
          </span>
          <span>
            <Bold>Stopped</Bold> {formatDateTime(end_time)}
          </span>
        </InlineItems>
      );
    }
    case STATUS.COMPLETED: {
      return (
        <InlineItems compact>
          <span>
            <Bold>Sent</Bold> {formatted_start_time}
          </span>
          <span>
            <Bold>Completed</Bold> {formatDateTime(end_time)}
          </span>
        </InlineItems>
      );
    }
    default: {
      return (
        <>
          <Bold>Sent</Bold> {formatted_start_time} and test status unknown
        </>
      );
    }
  }
}
