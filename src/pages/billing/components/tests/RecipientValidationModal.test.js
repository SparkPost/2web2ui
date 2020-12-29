import React from 'react';
import { shallow } from 'enzyme';
import { RecipientValidationModal } from '../RecipientValidationModal';

describe('Component: RecipientValidationModal', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      volumeUsed: 123123,
    };
    wrapper = shallow(<RecipientValidationModal {...props} />);
  });

  it('should render properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render the correct number of rows as bold', () => {
    //VolumeUsed Reaches 5th tier, so there should be 3 tiers that are empty
    expect(wrapper.find('Grid[className="PriceRow EmptyTier"]')).toHaveLength(3);
  });
});
