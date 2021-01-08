import React from 'react';
import { shallow } from 'enzyme';
import { SavedReportsSection } from '../SavedReportsSection';
jest.mock('src/pages/reportBuilder/context/ReportBuilderContext', () => ({
  useReportBuilderContext: jest
    .fn()
    .mockReturnValue({ actions: { refreshReportOptions: jest.fn() } }),
}));

describe('Saved Reports Section', () => {
  const getReportsMock = jest.fn();

  const subject = props => {
    const defaults = {
      selectedReport: { id: 123, name: 'my report' },
      currentUser: {},
      reports: [],
      status: 'idle',
      isDeletePending: false,
      getReports: getReportsMock,
      deleteReport: jest.fn(),
      showAlert: jest.fn(),
    };

    return shallow(<SavedReportsSection {...defaults} {...props} />);
  };

  it('renders page correctly', () => {
    const wrapper = subject();
    expect(wrapper).toHaveTextContent('Edit Details');
    expect(wrapper).toHaveTextContent('Save Changes');
    expect(wrapper).toHaveTextContent('Schedule Report');
    expect(wrapper).toHaveTextContent('View All Reports');
  });

  it('does not show schedule report button nor modal when a report is not selected', () => {
    const wrapper = subject({ selectedReport: {} });
    expect(wrapper).toHaveTextContent('Edit Details');
    expect(wrapper).toHaveTextContent('Save Changes');
    expect(wrapper).not.toHaveTextContent('Schedule Report');
    expect(wrapper).toHaveTextContent('View All Reports');
    expect(wrapper.find('ScheduledReportsModal')).not.toExist();
  });
});
