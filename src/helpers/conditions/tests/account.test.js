import {
  onPlan,
  onZuoraPlan,
  onPlanWithStatus,
  onServiceLevel,
  isEnterprise,
  isSuspendedForBilling,
  hasStatus,
  hasStatusReasonCategory,
  isCustomBilling,
  isSelfServeBilling,
  hasProductOnSubscription,
  isAccountUiOptionSet,
  hasAccountOptionEnabled,
  getAccountUiOptionValue,
  hasProductOnBillingSubscription,
} from '../account';

import cases from 'jest-in-case';

test('Condition: onPlan', () => {
  const condition = onPlan('p1');
  expect(condition({ accountPlan: { code: 'p1' } })).toEqual(true);
  expect(condition({ accountPlan: { code: 'p2' } })).toEqual(false);
});

test('Condition: onZuoraPlan', () => {
  expect(onZuoraPlan({ accountPlan: { billingId: 'uuuiiiiid' } })).toEqual(true);
  expect(onZuoraPlan({ accountPlan: {} })).toEqual(false);
});

test('Condition: onPlanWithStatus', () => {
  const condition = onPlanWithStatus('deprecated');
  expect(condition({ accountPlan: { status: 'deprecated' } })).toEqual(true);
  expect(condition({ accountPlan: { status: 'bananas' } })).toEqual(false);
});

test('Condition: onServiceLevel', () => {
  const condition = onServiceLevel('other');
  expect(condition({ account: { service_level: 'other' } })).toEqual(true);
  expect(condition({ account: { service_level: 'standard' } })).toEqual(false);
});

describe('Condition: isEnterprise', () => {
  let condition;
  let state;
  beforeEach(() => {
    state = {
      accountPlan: {},
      plans: [],
      account: {
        subscription: {
          code: 'abc1',
        },
        service_level: 'whatev',
      },
    };
    condition = isEnterprise;
  });

  it('should return a function that returns true if on ent1 plan', () => {
    state.accountPlan.code = 'ent1';
    expect(condition(state)).toEqual(true);
  });

  it('should return a function that returns true if on enterprise service level', () => {
    state.account.service_level = 'enterprise';
    expect(condition(state)).toEqual(true);
  });

  it('should return a function that returns false if not on ent1 plan OR enterprise service level', () => {
    expect(condition(state)).toEqual(false);
  });
});

describe('Condition: isSuspendedForBilling', () => {
  it('should return true if account is suspended and category is 100.01', () => {
    const account = { status: 'suspended', status_reason_category: '100.01' };
    expect(isSuspendedForBilling({ account })).toEqual(true);
  });

  it('should return false if account is NOT suspended', () => {
    const account = { status: 'active', status_reason_category: '100.01' };
    expect(isSuspendedForBilling({ account })).toEqual(false);
  });

  it('should return false if account does NOT have the right status reason category', () => {
    const account = { status: 'suspended', status_reason_category: '200.01' };
    expect(isSuspendedForBilling({ account })).toEqual(false);
  });
});

describe('Condition: hasStatus', () => {
  it('should return a function that returns whether the account has the given status', () => {
    const account = { status: 'active' };
    expect(hasStatus('active')({ account })).toEqual(true);
    expect(hasStatus('suspended')({ account })).toEqual(false);
  });
});

describe('Conditon: hasStatusReasonCategory', () => {
  it('should return a function that returns whether the account has the given status reason category', () => {
    const account = { status_reason_category: '100.01' };
    expect(hasStatusReasonCategory('100.01')({ account })).toEqual(true);
    expect(hasStatusReasonCategory('200.01')({ account })).toEqual(false);
  });

  it('should return false if status reason category is undefined or empty', () => {
    const account = {};
    expect(hasStatusReasonCategory('100.01')({ account })).toEqual(false);
    account.status_reason_category = null;
    expect(hasStatusReasonCategory('100.01')({ account })).toEqual(false);
  });
});

describe('Condition: isSelfServeBilling', () => {
  it('should return false with undefined subscription', () => {
    const account = {};
    expect(isSelfServeBilling({ account })).toEqual(false);
  });

  it('should return false with empty subscription', () => {
    const account = {
      subscription: {},
    };

    expect(isSelfServeBilling({ account })).toEqual(false);
  });

  it('should return false with manual subscription', () => {
    const account = {
      subscription: {
        self_serve: false,
      },
    };

    expect(isSelfServeBilling({ account })).toEqual(false);
  });

  it('should return true with self serve subscription', () => {
    const account = {
      subscription: {
        self_serve: true,
      },
    };

    expect(isSelfServeBilling({ account })).toEqual(true);
  });
});

describe('Condition: hasProductOnSubscription', () => {
  it('should return true for if a certain product is on subscription', () => {
    const state = {
      accountPlan: {
        products: [
          {
            plan: 'online-support',
            product: 'online_support',
            price: 0,
          },
        ],
      },
    };

    expect(hasProductOnSubscription('online_support')(state)).toEqual(true);
  });

  it('should return false for if a certain product is not on subscription', () => {
    const state = {
      accountPlan: {
        products: [
          {
            plan: 'online-support',
            product: 'online_support',
            price: 0,
          },
        ],
      },
    };
    expect(hasProductOnSubscription('phone_support')(state)).toEqual(false);
  });
});

cases(
  'isAccountUiOptionSet',
  opts => {
    const state = { account: { options: { ui: opts.options } } };
    expect(isAccountUiOptionSet('option', opts.defaultVal)(state)).toEqual(opts.result);
  },
  {
    // Account option takes precedence
    'Account option precedence: false/false=false': {
      options: { option: false },
      defaultVal: false,
      result: false,
    },
    'Account option precedence: true/false=true': {
      options: { option: true },
      defaultVal: false,
      result: true,
    },
    'Account option precedence: false/true=false': {
      options: { option: false },
      defaultVal: true,
      result: false,
    },
    'Account option precedence: true/true=true': {
      options: { option: true },
      defaultVal: true,
      result: true,
    },
    // Default used iff option is missing
    'Default: true=true': { options: {}, defaultVal: true, result: true },
    'Default: false=false': { options: {}, defaultVal: false, result: false },
  },
);

describe('Condition: isCustomBilling', () => {
  it('should return false', () => {
    const state = {
      account: {
        subscription: {
          custom: false,
        },
      },
    };

    expect(isCustomBilling(state)).toEqual(false);
  });

  it('should return true', () => {
    const state = {
      account: {
        subscription: {
          custom: true,
        },
      },
    };

    expect(isCustomBilling(state)).toEqual(true);
  });
});

describe('Condition: hasAccountOptionEnabled', () => {
  let state;

  beforeEach(() => {
    state = {
      account: {
        options: {
          auto_verify_domains: true,
          auto_verify_tracking_domains: false,
        },
      },
    };
  });

  it('should return false when option is not present', () => {
    expect(hasAccountOptionEnabled('auto_verify_cats')(state)).toEqual(false);
  });

  it('should return false when option is disabled', () => {
    expect(hasAccountOptionEnabled('auto_verify_tracking_domains')(state)).toEqual(false);
  });

  it('should return true when option is enabled', () => {
    expect(hasAccountOptionEnabled('auto_verify_domains')(state)).toEqual(true);
  });

  it('should return default value (false) if parent prop does not exist', () => {
    state.account.options = null;
    expect(hasAccountOptionEnabled('auto_verify_domains')(state)).toEqual(false);
  });
});

describe('Condition: hasProductOnbBillingSubscription', () => {
  it('should return if any item in the subscription has matching product', () => {
    const state = {
      billing: {
        subscription: {
          products: [{ product: 'cool-thing' }, { product: 'cool-thing-2' }],
        },
      },
    };
    expect(hasProductOnBillingSubscription('cool-thing')(state)).toEqual(true);
    expect(hasProductOnBillingSubscription('cool-thing-2')(state)).toEqual(true);
    expect(hasProductOnBillingSubscription('not-cool')(state)).toEqual(false);
  });
});

describe('Condition: getAccountUiOptionValue', () => {
  let state;

  beforeEach(() => {
    state = {
      account: {
        options: {
          ui: {
            stepName: 'Sending',
          },
        },
      },
    };
  });
  it('should return the value of the ui option', () => {
    expect(getAccountUiOptionValue('stepName')(state)).toEqual('Sending');
  });
});
