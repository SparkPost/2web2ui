import React from 'react';
import { shallow } from 'enzyme';
import TestDetails from '../TestDetails';
import { PLACEMENT_FILTER_TYPES } from '../../constants/types';

jest.mock('lodash/debounce', () => jest.fn(fn => fn));
jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('Jul 8th 2019 11:49am'),
  parseISO: jest.fn(),
}));
jest.mock('src/hooks/useHibanaOverride', () => styles => styles);

describe('Component: TestDetails', () => {
  const samplePlacement = {
    inbox_pct: 0,
    spam_pct: 0,
    missing_pct: 1,
  };
  const subject = props => {
    const defaults = {
      details: {
        start_time: '2019-07-08T15:49:56.954Z',
        end_time: null,
        subject: 'Fooo',
        test_name: 'Baz',
      },
      placementsByProvider: [],
    };
    return shallow(<TestDetails {...defaults} {...props} />);
  };

  const searchFieldSelector = '[data-id="text-field-placement-search"]';
  const placementTypeSelectSelector = '[data-id="select-placement-type"]';
  const placementBreakdownSelector = '[data-id="placement-breakdown-table"]';

  it('renders correctly', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders test name as None when it does not exist', () => {
    const detailsWithoutName = {
      start_time: '2019-07-08T15:49:56.954Z',
      end_time: null,
      subject: 'Fooo',
    };
    const wrapper = subject({ details: detailsWithoutName });
    expect(wrapper).toHaveTextContent('None');
  });

  it('renders providers breakdown correctly', () => {
    const placementsByProvider = [
      {
        mailbox_provider: 'dogmail.com',
        placement: samplePlacement,
      },
    ];

    expect(
      subject({ placementsByProvider })
        .find(placementBreakdownSelector)
        .prop('data'),
    ).toEqual(placementsByProvider);
  });

  it('changes placement data when changing select', () => {
    const placementsByProvider = [
      {
        mailbox_provider: 'dogmail.com',
        placement: samplePlacement,
      },
    ];
    const placementsByRegion = [
      {
        placement: samplePlacement,
        region: 'north america',
      },
    ];
    const placementsBySendingIp = [
      {
        placement: samplePlacement,
        sending_ip: '101.101',
      },
    ];
    const wrapper = subject({ placementsByProvider, placementsByRegion, placementsBySendingIp });
    // Default data
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual(placementsByProvider);

    // Change to Region Filter
    wrapper
      .find(placementTypeSelectSelector)
      .simulate('change', { target: { value: PLACEMENT_FILTER_TYPES.REGION } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual(placementsByRegion);

    // Change to Sending Ip Filter
    wrapper
      .find(placementTypeSelectSelector)
      .simulate('change', { target: { value: PLACEMENT_FILTER_TYPES.SENDING_IP } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual(placementsBySendingIp);

    // Change back to Mailbox Provider filter
    wrapper
      .find(placementTypeSelectSelector)
      .simulate('change', { target: { value: PLACEMENT_FILTER_TYPES.MAILBOX_PROVIDER } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual(placementsByProvider);
  });

  it('changes placement data when using search bar on providers list', () => {
    const dogmail = {
      mailbox_provider: 'dogmail.net',
      region: 'north america',
      sending_ip: '101.101',
      placement: samplePlacement,
    };
    const gmail = {
      mailbox_provider: 'gmail.com',
      region: 'europe',
      sending_ip: '101.102',
      placement: samplePlacement,
    };
    const hotmail = {
      mailbox_provider: 'hotmail.com',
      region: 'global',
      sending_ip: '101.103',
      placement: samplePlacement,
    };
    const placementsByProvider = [dogmail, gmail, hotmail];

    const wrapper = subject({ placementsByProvider });

    // Match one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: 'net' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([dogmail]);

    // Match more than one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: 'gmail' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([dogmail, gmail]);

    // No results
    wrapper
      .find(searchFieldSelector)
      .simulate('change', { target: { value: 'this wont match anything' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([]);

    // Search by case insensitive region match
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: 'america' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([dogmail]);
  });

  it('changes placement data when using search bar on regions list', () => {
    const northAmerica = {
      region: 'north america',
      placement: samplePlacement,
    };
    const southAmerica = {
      region: 'south america',
      placement: samplePlacement,
    };
    const europe = {
      region: 'europe',
      placement: samplePlacement,
    };
    const placementsByRegion = [northAmerica, southAmerica, europe];

    const wrapper = subject({ placementsByRegion });

    // Change to Region list
    wrapper
      .find(placementTypeSelectSelector)
      .simulate('change', { target: { value: PLACEMENT_FILTER_TYPES.REGION } });

    // Match one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: 'north' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([northAmerica]);

    // Match more than one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: 'america' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([
      northAmerica,
      southAmerica,
    ]);

    // No results
    wrapper
      .find(searchFieldSelector)
      .simulate('change', { target: { value: 'this wont match anything' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([]);
  });

  it('changes placement data when using search bar on sending ip list', () => {
    const ip1 = {
      sending_ip: '101.101',
      placement: samplePlacement,
    };
    const ip2 = {
      sending_ip: '101.102',
      placement: samplePlacement,
    };
    const ip3 = {
      sending_ip: '103.104',
      placement: samplePlacement,
    };
    const placementsBySendingIp = [ip1, ip2, ip3];

    const wrapper = subject({ placementsBySendingIp });

    // Change to Region list
    wrapper
      .find(placementTypeSelectSelector)
      .simulate('change', { target: { value: PLACEMENT_FILTER_TYPES.SENDING_IP } });

    // Match one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: '102' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([ip2]);

    // Match more than one result
    wrapper.find(searchFieldSelector).simulate('change', { target: { value: '101' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([ip1, ip2]);

    // No results
    wrapper
      .find(searchFieldSelector)
      .simulate('change', { target: { value: 'this wont match anything' } });
    expect(wrapper.find(placementBreakdownSelector).prop('data')).toEqual([]);
  });
});
