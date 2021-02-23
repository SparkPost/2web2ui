import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'src/components/matchbox';
import DownloadLink from '../DownloadLink';

describe('DownloadLink', () => {
  const subject = props =>
    shallow(
      <DownloadLink href="/download/data.csv" {...props}>
        Download Me!
      </DownloadLink>,
    );

  it('renders a link', () => {
    const wrapper = subject();
    expect(wrapper).toHaveDisplayName('UnstyledLink');
    expect(wrapper).toHaveProp('to', '/download/data.csv');
    expect(wrapper).toHaveTextContent('Download Me!');
  });

  it('sets download props', () => {
    const wrapper = subject();
    expect(wrapper).toHaveProp('download', true);
    expect(wrapper).toHaveProp('referrerPolicy');
  });

  it('renders as a button', () => {
    const wrapper = subject({ as: Button });
    expect(wrapper).toHaveDisplayName('Button');
    expect(wrapper).toHaveTextContent('Download Me!');
  });

  it('sets custom filename', () => {
    const wrapper = subject({ download: 'myData.csv' });
    expect(wrapper).toHaveProp('download', 'myData.csv');
  });
});
