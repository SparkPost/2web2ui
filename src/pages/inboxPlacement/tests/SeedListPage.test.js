import { shallow } from 'enzyme';
import React from 'react';

import { SeedListPage } from '../SeedListPage';
import { InstructionsContent } from '../SeedListPage';

describe('Page: SeedList tests', () => {
  const defaults = {
    loading: false,
    seeds: [],
    getSeedList: jest.fn(),
    referenceSeed: 'ref1@seed.sparkpost.com',
  };
  const subject = props => {
    return shallow(<SeedListPage {...defaults} {...props} />);
  };

  it('renders instructions', () => {
    const wrapper = shallow(<InstructionsContent {...defaults} />);
    expect(wrapper).toHaveTextContent(defaults.referenceSeed);
  });

  it('renders loading', () => {
    const wrapper = subject({ pending: true });
    expect(wrapper.find('Loading')).toExist();
  });

  it('renders error message', () => {
    const wrapper = subject({ error: true });
    expect(wrapper.find('ApiErrorBanner')).toExist();
  });
});
