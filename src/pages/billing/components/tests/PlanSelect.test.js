import React from 'react';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import TestApp from 'src/__testHelpers__/TestApp';
import styles from '../PlanSelect.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import PlanSelect, { SelectedPlan } from '../PlanSelect';

jest.mock('src/hooks/useHibanaOverride');
useHibanaOverride.mockReturnValue(styles);
describe('Plan Select:', () => {
  const defaultProps = {
    onSelect: jest.fn(),
    currentPlan: {
      code: '2',
    },
    bundles: [
      {
        bundle: '2',
        tier: 'test',
        messaging: {
          code: '2',
          includesIp: false,
          price: 0,
          name: 'Two',
          overage: 0.2,
          volume: 2,
          isFree: true,
        },
      },
      {
        bundle: '3',
        tier: 'starter',
        messaging: {
          code: '3',
          price: 300,
          name: 'Three',
          overage: 0.3,
          volume: 3,
        },
      },
      {
        bundle: '4',
        tier: 'premier',
        messaging: {
          code: '4',
          includesIp: true,
          price: 400,
          name: 'Four',
          overage: 0.4,
          volume: 4,
        },
      },
    ],
  };

  const subject = props => shallow(<PlanSelect {...defaultProps} {...props} />);

  it('should render correctly', () => {
    expect(subject()).toMatchSnapshot();
  });
});

describe('Selected Plan:', () => {
  const defaultProps = {
    onChange: jest.fn(),
    bundle: {
      tier: 'test',
      messaging: {
        code: '2',
        includesIp: false,
        price: 0,
        name: 'Two',
        overage: 0.2,
        volume: 2,
        isFree: true,
      },
    },
    promoCodeObj: {
      selectedPromo: {},
      promoPending: false,
      promoError: false,
    },
    handlePromoCode: {
      applyPromoCode: jest.fn(),
      clearPromoCode: jest.fn(),
    },
  };

  const subject = props =>
    render(
      <TestApp>
        <SelectedPlan {...defaultProps} {...props} />
      </TestApp>,
    );

  it('should render promo code if price is not 0', () => {
    const { queryByText } = subject({
      bundle: {
        ...defaultProps.bundle,
        messaging: {
          ...defaultProps.bundle.messaging,
          price: 3,
        },
      },
    });
    expect(queryByText('Promo Code')).toBeInTheDocument();
  });
});
