import React from 'react';
import { mount } from 'enzyme';
import { SegmentPage } from '../SegmentPage';
import getConfig from 'src/helpers/getConfig';
import { SEGMENT_TRAITS } from 'src/helpers/segment';
import * as helpers from 'src/helpers/segment';

jest.mock('src/helpers/getConfig');
jest.mock('src/helpers/segment');

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: {
      pathname: '/',
    },
    listen: () => jest.fn(),
  }),
}));

describe('Segment', () => {
  const getSubject = props => mount(<SegmentPage {...props} />);

  beforeEach(() => {
    helpers.segmentPage = jest.fn();
  });

  it('calls segmentPage on load', () => {
    getConfig.mockReturnValue('test-tenant');
    const traits = {
      [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
      [SEGMENT_TRAITS.USER_ID]: 'username',
      [SEGMENT_TRAITS.TENANT]: 'test-tenant',
    };
    getSubject(traits);
    expect(helpers.segmentPage).toBeCalledTimes(1);
  });

  it('does not call segmentPage on trait change', () => {
    getConfig.mockReturnValue('test-tenant');
    const traits = {
      [SEGMENT_TRAITS.EMAIL]: 'email@abc.com',
      [SEGMENT_TRAITS.USER_ID]: 'username',
      [SEGMENT_TRAITS.TENANT]: 'test-tenant',
    };
    const subject = getSubject(traits);
    expect(helpers.segmentPage).toBeCalledTimes(1);
    subject.setProps({ [helpers.SEGMENT_TRAITS.TENANT]: 'new-tenant' });
    expect(helpers.segmentPage).toBeCalledTimes(1);
  });
});
