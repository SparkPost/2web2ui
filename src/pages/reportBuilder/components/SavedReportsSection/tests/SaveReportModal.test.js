import React from 'react';
import { shallow } from 'enzyme';
import { SaveReportModal } from '../SaveReportModal';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ search: '?metrics=sent_count' }),
}));
jest.mock('src/context/HibanaContext', () => ({
  useHibana: jest.fn().mockReturnValue([{ isHibanaEnabled: true }]),
}));

jest.mock('src/pages/reportBuilder/context/ReportBuilderContext', () => ({
  useReportBuilderContext: jest.fn(() => ({
    state: { foo: 'bar', filters: [], comparisons: [] },
    selectors: { selectSummaryChartSearchOptions: { filters: [] } },
  })),
}));

const mockOnCancel = jest.fn();
const mockCreateReport = jest.fn(() => Promise.resolve({ id: 1 }));
const mockGetReports = jest.fn(() => Promise.resolve([{ id: 1 }]));
const mockShowAlert = jest.fn();
const mockSetReport = jest.fn();

describe('SaveNewReportModal', () => {
  const subject = props => {
    const defaults = {
      open: true,
      onCancel: mockOnCancel,
      createReport: mockCreateReport,
      getReports: mockGetReports,
      showAlert: mockShowAlert,
      loading: false,
      create: true,
      setReport: mockSetReport,
    };

    return shallow(<SaveReportModal {...defaults} {...props} />);
  };

  it('renders page correctly', () => {
    const wrapper = subject();
    expect(wrapper).toHaveTextContent('Name');
    expect(wrapper).toHaveTextContent('Description');
    expect(wrapper).toHaveTextContent('Editable');
    expect(wrapper).toHaveTextContent('Save Report');
    expect(wrapper).toHaveTextContent('Cancel');
  });

  it('calls onCancel when clicking cancel button', () => {
    const wrapper = subject();
    wrapper.find('Button[variant="secondary"]').simulate('click');
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls createReport when clicking submit button and closes and shows alert on success', async () => {
    const wrapper = subject();
    await wrapper.find('Form').simulate('submit');
    expect(mockCreateReport).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockGetReports).toHaveBeenCalled();
  });
});

describe('UpdateReportModal', () => {
  const defaults = {
    open: true,
    onCancel: jest.fn(),
    updateReport: jest.fn(() => Promise.resolve()),
    getReports: jest.fn(() => Promise.resolve([{ id: 1 }])),
    showAlert: jest.fn(),
    loading: false,
    isOwner: true,
    report: { id: 1 },
    setReport: jest.fn(),
    getSubscription: jest.fn(),
  };
  const subject = props => {
    return shallow(<SaveReportModal {...defaults} {...props} />);
  };

  it('renders page correctly', () => {
    const wrapper = subject();
    expect(wrapper).toHaveTextContent('Name');
    expect(wrapper).toHaveTextContent('Description');
    expect(wrapper).toHaveTextContent('Editable');
    expect(wrapper).toHaveTextContent('Save Report');
    expect(wrapper).toHaveTextContent('Cancel');
  });

  it('calls onCancel when clicking cancel button', () => {
    const wrapper = subject();
    wrapper.find('Button[variant="secondary"]').simulate('click');
    expect(defaults.onCancel).toHaveBeenCalled();
  });

  it('calls createReport when clicking submit button and closes and shows alert on success', async () => {
    const wrapper = subject();
    await wrapper.find('Form').simulate('submit');
    expect(defaults.updateReport).toHaveBeenCalled();
    expect(defaults.showAlert).toHaveBeenCalled();
    expect(defaults.onCancel).toHaveBeenCalled();
    expect(defaults.getReports).toHaveBeenCalled();
  });
});
