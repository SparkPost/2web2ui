import React from 'react';
import { shallow } from 'enzyme';
import { ReportOptionsClassComponent as ReportOptions } from '../ReportOptions';
import Typeahead from '../Typeahead';
import { Tag } from 'src/components/matchbox';
import * as reportHelpers from 'src/helpers/reports';
import styles from '../ReportOptions.module.scss';

jest.mock('src/helpers/date');
jest.mock('src/helpers/reports');

describe('Component: Report Options', () => {
  let wrapper;
  let testProps;
  let filters;
  let options;
  let testQuery;

  beforeEach(() => {
    const testDate = new Date('2018-02-15T12:00:00Z');
    options = {};
    filters = [];
    testQuery = {};
    reportHelpers.getReportSearchOptions = jest.fn(() => testQuery);
    reportHelpers.parseSearch = jest.fn(() => ({ options, filters }));
    testProps = {
      addFilters: jest.fn(),
      removeFilter: jest.fn(),
      typeaheadCache: [],
      reportOptions: {
        from: testDate,
        to: testDate,
        relativeRange: 'day',
        filters,
      },
      location: {
        search: '?some=test',
        pathname: 'my-pathname',
      },
      history: {
        replace: jest.fn(),
      },
      initTypeaheadCache: jest.fn(),
      refreshReportOptions: jest.fn(),
      refreshTypeaheadCache: jest.fn(),
      styles,
    };
    wrapper = shallow(<ReportOptions {...testProps} />);
  });

  it('should mount and render correctly', () => {
    expect(reportHelpers.parseSearch).toHaveBeenCalledWith(testProps.location.search);
    expect(testProps.addFilters).toHaveBeenCalledWith(filters);
    expect(testProps.refreshReportOptions).toHaveBeenCalledWith(options);
    expect(testProps.initTypeaheadCache).toHaveBeenCalledTimes(1);
    expect(wrapper).toMatchSnapshot();
  });

  describe('with active filters', () => {
    beforeEach(() => {
      wrapper.setProps({
        reportOptions: {
          ...testProps.reportOptions,
          filters: [
            { type: 'A', value: 'aaa' },
            { type: 'B', value: 'bbb' },
            { type: 'C', value: 'ccc' },
          ],
        },
      });
    });

    it('should render', () => {
      const tags = wrapper.find(Tag);
      expect(tags).toHaveLength(3);
      expect(wrapper).toMatchSnapshot();
    });

    it('should remove a filter by index', () => {
      const tags = wrapper.find(Tag);
      tags.first().simulate('remove');
      expect(testProps.removeFilter).toHaveBeenCalledWith(0);
    });
  });

  it('should select a typeahead item', () => {
    const typeahead = wrapper.find(Typeahead);
    const item = {};
    typeahead.simulate('select', item);
    expect(testProps.addFilters).toHaveBeenCalledWith([item]);
  });

  it('should render custom reports when the option is enabled', () => {
    wrapper.setProps({ customReportsEnabled: true });
    expect(wrapper.find('withRouter(Connect(CustomReports))')).toExist();
  });

  it('should mount and render Timezone and Precision Selectors', () => {
    expect(wrapper.find('TimezoneTypeahead')).toExist();
    expect(wrapper.find('PrecisionSelector')).toExist();
  });

  it('should mount and render metrics correctly with only the display selector', () => {
    wrapper.setState({ shownPrecision: 'hour' });
    wrapper.update();
    expect(wrapper.find('PrecisionSelector')).not.toExist();
    expect(wrapper.find('Select')).toExist();
    expect(wrapper.find('Select')).toHaveValue('hour');
  });

  it('should set the disabledAndUTCOnly prop when shownPrecision is day, month, or week', () => {
    wrapper.setState({ shownPrecision: 'day' });
    wrapper.update();

    expect(wrapper.find('TimezoneTypeahead')).toHaveProp('disabledAndUTCOnly', true);

    wrapper.setState({ shownPrecision: 'week' });
    wrapper.update();
    expect(wrapper.find('TimezoneTypeahead')).toHaveProp('disabledAndUTCOnly', true);

    wrapper.setState({ shownPrecision: 'month' });
    wrapper.update();
    expect(wrapper.find('TimezoneTypeahead')).toHaveProp('disabledAndUTCOnly', true);

    wrapper.setState({ shownPrecision: '' });
    wrapper.update();
    expect(wrapper.find('TimezoneTypeahead')).toHaveProp('disabledAndUTCOnly', false);
  });
});
