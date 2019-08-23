import React from 'react';
import { shallow } from 'enzyme';
import ListResultsCard from '../ListResultsCard';

describe('ListResultsCard', () => {
  const subject = (props) => shallow(<ListResultsCard {...props} />);

  it('renders with the the `<TableCollection/>` with a `title` prop of "Recent Validations"', () => {
    expect(subject().props().title).toEqual('Recent Validations');
  });

  it('Renders with the appropriate columns', () => {
    expect(subject().props().columns).toEqual([
      { label: 'File Name' },
      { label: 'Date Uploaded' },
      { label: 'Status' },
      { label: 'Total' },
      { label: 'Download' }
    ]);
  });

  it('renders correctly when not complete', () => {
    const wrapper = subject({
      results: {
        'list-id': {
          complete: false,
          uploaded: 1541092618
        }
      }
    });

    expect(wrapper.find('Tag').text()).toEqual('Processing');
    expect(wrapper.find('Cached')).toExist();
  });

  it('renders correctly when complete', () => {
    const wrapper = subject({
      results: {
        'list-id': {
          complete: true,
          uploaded: 1541092618,
          rejectedUrl: 'testfile.csv',
          status: 'success'
        }
      }
    });

    expect(wrapper.find('Tag').childAt(1).text()).toEqual('Completed');
    expect(wrapper.find('CheckCircle')).toExist();
  });

  it('renders correctly when file uploaded, but not triggered', () => {
    const wrapper = subject({
      results: {
        'list-id': {
          complete: false,
          uploaded: 1541092618,
          rejectedUrl: 'testfile.csv',
          status: 'queued_for_batch'
        }
      }
    });
    expect(wrapper.find('Tag').childAt(1).text()).toEqual('Ready to validate');
    expect(wrapper.find('CloudUpload')).toExist();
  });

  it('renders correctly when batch job fails', () => {
    const wrapper = subject({
      results: {
        'list-id': {
          complete: false,
          uploaded: 1541092618,
          rejectedUrl: 'testfile.csv',
          status: 'error'
        }
      }
    });
    expect(wrapper.find('Tag').childAt(1).text()).toEqual('Failed. Please try again.');
    expect(wrapper.find('Error')).toExist();
  });
});
