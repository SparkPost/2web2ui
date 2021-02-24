import * as validations from '../validation';

/*
 * cases and memoizedCases each include a key per function under test with
 * good and bad inputs.
 *
 * Each good input is passed to the function and the result is expected toBeUndefined().
 *
 * Each bad input is passed to the function and the result is expected toBeDefined().
 *
 */
const cases = {
  required: {
    good: ['101', 1, {}, []],
    bad: [null, undefined],
  },
  email: {
    good: ['roberto@baggio.example.com', 'x@example.com'],
    bad: ['', 'bugblatter', 'not.an.email.example.com'],
  },
  emails: {
    good: [
      'test@example.com',
      'test@example.com, test@example.com',
      'test@example.com\n test@example.com',
    ],
    bad: ['', 'invalid', 'test@example.com, invalid'],
  },
  emailLocal: {
    good: ['roberto.baggio', '101'],
    bad: ['@', 'you@example.com'],
  },
  recipientEmail: {
    good: ['roberto@baggio.example.com', 'marká@example.com'],
    bad: ['bugblatter'],
  },
  domain: {
    good: ['example.com', 'xo.co'],
    bad: ['101', 'no_capes'],
  },
  nonEmptyFile: {
    good: [{ size: 1 }, null],
    bad: [{ size: 0 }],
  },
  integer: {
    good: ['-10', '-1', '0', '1', '109352', -10, -1, 0, 1, 109352],
    bad: [-498.2, 0.1, 39.2, 'bob', '', '-498.2', '0.1', '39.2'],
  },
  startTimeBeforeEndTime: {
    good: [{ from: '2000-08-20T19:50:00.000Z', to: '2040-08-20T19:50:00.000Z' }],
    bad: [{ from: '2040-08-20T19:50:00.000Z', to: '2000-08-20T19:50:00.000Z' }],
  },
  slug: {
    good: ['id', 'test-id', 'test_1', '1'],
    bad: ['test.id', 'NOT_!@#$%^&*()_VALID', 'test id', ':doge:'],
  },
  eventsQuery: {
    good: [
      [{ key: 'reason', value: 'fo*o' }],
      [{ key: 'campaigns', value: 'foo, bar' }],
      [{ key: 'reason' }],
    ],
    bad: [[{ value: 'foo' }]],
    multiArg: true,
  },
  abTestDefaultTemplate: {
    good: [
      [
        { id: 'foobar' },
        { subaccount: true },
        { templates: [{ id: 'foo' }, { id: 'bar' }, { id: 'foobar' }] },
      ],
    ],
    bad: [
      [{ id: 'foobar' }, { subaccount: true }, { templates: [{ id: 'foo' }, { id: 'bar' }] }],
      [{ id: 'foobar' }, { subaccount: false }, { templates: [{ id: 'foo' }, { id: 'bar' }] }],
    ],
    multiArg: true,
  },
  abTestDuration: {
    good: [
      [
        { from: '2018-08-20T19:50:00.000Z', to: '2018-08-21T19:50:00.000Z' },
        { engagement_timeout: 24 },
      ],
      [
        { from: '2018-08-20T19:50:00.000Z', to: '2018-08-21T19:50:00.000Z' },
        { engagement_timeout: '24' },
      ],
    ],
    bad: [
      [
        { from: '2018-08-20T19:50:00.000Z', to: '2019-08-21T19:50:00.000Z' },
        { engagement_timeout: 24 },
      ],
      [
        { from: '2018-08-20T19:50:00.000Z', to: '2018-08-21T19:50:00.000Z' },
        { engagement_timeout: 2400 },
      ],
    ],
    multiArg: true,
  },
  abTestDistribution: {
    good: [
      [null, { audience_selection: 'sample_size' }],
      [null, { audience_selection: 'percent', default_template: {}, variants: [] }],
      [
        null,
        {
          audience_selection: 'percent',
          default_template: { percent: 50 },
          variants: [{ percent: 50 }],
        },
      ],
      [
        null,
        {
          audience_selection: 'percent',
          default_template: { percent: 50 },
          variants: [{ percent: 50 }, undefined],
        },
      ],
    ],
    bad: [
      [
        null,
        {
          audience_selection: 'percent',
          default_template: { percent: 75 },
          variants: [{ percent: 75 }],
        },
      ],
    ],
    multiArg: true,
  },
  json: {
    good: ['{}', '{ "test": "example" }'],
    bad: [undefined, '', '{', '{ a: b }'],
  },
};

const memoizedCases = {
  fileExtension: {
    good: [
      ['csv', { name: 'test.csv' }],
      ['csv', null],
    ],
    bad: [['csv', { name: 'test.txt' }]],
  },
  maxLength: {
    good: [
      [1, '1'],
      [2, '12'],
      [1, ' 1 '],
    ],
    bad: [[1, '123']],
  },
  minLength: {
    good: [
      [1, '12'],
      [5, '1234567'],
    ],
    bad: [
      [2, '1'],
      [1, ''],
      [2, ' 1 '],
    ],
  },
  minNumber: {
    good: [
      [1, 1],
      [-10, -9],
      [0, 2],
    ],
    bad: [
      [1, 0],
      [-1, -2],
      [0, -10],
    ],
  },
  maxNumber: {
    good: [
      [1, 1],
      [-10, -11],
      [0, -1],
    ],
    bad: [
      [1, 2],
      [-10, -9],
      [0, 1],
    ],
  },
  maxFileSize: {
    // The null case below is for the redux-form validation that sometimes occurs before underlying fields are available
    good: [
      [1024, { size: 1000 }],
      [1, null],
    ],
    bad: [[1024, { size: 1025 }]],
  },
  minDays: {
    good: [
      [7, { from: '2018-01-07T05:00:00.000Z', to: '2017-01-01T01:00:00.000Z' }],
      [7, { from: '2018-01-01T05:00:00.000Z', to: '2018-01-07T24:00:00.000Z' }],
    ],
    bad: [[7, { from: '2018-01-01', to: '2017-12-31' }]],
  },
};
const generate = count => [...Array(count).keys()].join(',');

describe('Validation helpers', () => {
  Object.keys(cases).forEach(caseName => {
    const goodInput = cases[caseName].good;
    const badInput = cases[caseName].bad;
    const multiArg = !!cases[caseName].multiArg;
    goodInput.forEach(input =>
      it(`${caseName} should accept ${input}`, () =>
        expect(validations[caseName](...(multiArg ? input : [input]))).toBeUndefined()),
    );

    badInput.forEach(input =>
      it(`${caseName} should not accept ${input}`, () =>
        expect(validations[caseName](...(multiArg ? input : [input]))).toBeDefined()),
    );
  });
});

describe('Memoized validation helpers', () => {
  Object.keys(memoizedCases).forEach(caseName => {
    const goodInput = memoizedCases[caseName].good;
    const badInput = memoizedCases[caseName].bad;
    goodInput.forEach(input => {
      const configVars = input[0];
      const arg = input[1];
      const ctor = validations[caseName];
      const instance = ctor(configVars);
      it(`${caseName}(${configVars}) should accept ${typeof arg}:'${arg}'`, () => {
        expect(instance).toBeInstanceOf(Function);
        expect(instance(arg)).toBeUndefined();
      });
    });

    badInput.forEach(input => {
      const configVars = input[0];
      const arg = input[1];
      const ctor = validations[caseName];
      const instance = ctor(configVars);
      it(`${caseName}(${configVars}) should not accept ${typeof arg}:'${arg}'`, () => {
        expect(instance).toBeInstanceOf(Function);
        expect(instance(arg)).toBeDefined();
      });
    });
  });
});

describe('ifStringPresent', () => {
  const validator = () => "I'm always invalid";

  it('returns undefined with undefined', () => {
    expect(validations.ifStringPresent(validator)()).toBeUndefined();
  });

  it('returns undefined with empty string', () => {
    expect(validations.ifStringPresent(validator)('')).toBeUndefined();
  });

  it('returns invalid message when present', () => {
    expect(validations.ifStringPresent(validator)('My Value')).toMatch(/invalid/);
  });
});

describe('noDuplicateItems', () => {
  const items = generate(5);
  it('returns undefined with an empty string', () => {
    expect(validations.noDuplicateItems(items)).toBeUndefined();
  });

  it('returns an error with duplicate items', () => {
    const duplicates = 'duplicate, duplicate, duplicate, notduplicate';
    expect(validations.noDuplicateItems(duplicates)).toMatch(/Can\'t contain duplicate items/);
  });
});

describe('maxItems', () => {
  const maxAllowed = 10;
  it('returns undefined with an empty string', () => {
    expect(validations.maxItems(maxAllowed)('')).toBeUndefined();
  });

  it('returns undefined when under the maximum size', () => {
    const emails = generate(5);
    expect(validations.maxItems(maxAllowed)(emails)).toBeUndefined();
  });

  it('return an error message when the length is above the maximum value', () => {
    const emails = generate(11);
    expect(validations.maxItems(maxAllowed)(emails)).toMatch(/Must contain no more than/);
  });
});

describe('Number between validation', () => {
  it('returns undefined for valid input', () => {
    expect(validations.numberBetween(0, 1)(0.5)).toBeUndefined();
  });

  it('returns error for invalid input', () => {
    expect(validations.numberBetween(0, 1)(0)).toEqual('Must be between 0 and 1');
  });

  it('returns undefined for valid input for inclusive case', () => {
    expect(validations.numberBetweenInclusive(0, 1)(0)).toBeUndefined();
  });

  it('returns error for invalid input for inclusive case', () => {
    expect(validations.numberBetweenInclusive(0, 1)(2)).toEqual('Must be between 0 and 1');
  });
});

describe('URL Validation', () => {
  it('returns undefined for valid url', () => {
    expect(validations.url('http://yahoo.com')).toBeUndefined();
  });

  it('returns error for invalid url', () => {
    expect(validations.url('http://  google.com')).toEqual('Must be a valid URL');
  });
});

describe('Credit card expiration validation', () => {
  let realDate;
  const mockNow = new Date('2018-06-15T12:00:00-00:00');

  beforeEach(() => {
    realDate = Date;
    /* eslint-disable-next-line no-global-assign */
    Date = class extends Date {
      constructor(...args) {
        /* eslint-disable-next-line constructor-super */
        return args[0] === undefined ? mockNow : super(...args);
      }
    };
  });

  afterEach(() => {
    /* eslint-disable-next-line no-global-assign */
    Date = realDate;
  });

  it('should be valid for a date in a future year', () => {
    expect(validations.cardExpiry('05 / 19')).toBeUndefined();
    expect(validations.cardExpiry('05/19')).toBeUndefined();
    expect(validations.cardExpiry('05 / 2019')).toBeUndefined();
  });

  it('should be valid for a date in the same year, future month', () => {
    expect(validations.cardExpiry('07 / 18')).toBeUndefined();
    expect(validations.cardExpiry('07/18')).toBeUndefined();
    expect(validations.cardExpiry('07 / 2018')).toBeUndefined();
  });

  it('should be valid for a date in the same year, same month', () => {
    expect(validations.cardExpiry('06 / 18')).toBeUndefined();
    expect(validations.cardExpiry('06/18')).toBeUndefined();
    expect(validations.cardExpiry('06 / 2018')).toBeUndefined();
  });

  it('should be invalid for a date in the same year, previous month', () => {
    expect(validations.cardExpiry('05 / 18')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('05/18')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('05 / 2018')).toEqual('Please choose a valid expiration date');
  });

  it('should be invalid for a date in a previous year', () => {
    expect(validations.cardExpiry('12 / 17')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('12/17')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('12 / 2017')).toEqual('Please choose a valid expiration date');
  });

  it('should be invalid for a date with an invalid month', () => {
    expect(validations.cardExpiry('44 / 20')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('44/20')).toEqual('Please choose a valid expiration date');
    expect(validations.cardExpiry('44 / 2020')).toEqual('Please choose a valid expiration date');
  });
});
