import {
  getFilterTypeKey,
  getFilterTypeLabel,
  getApiFormattedGroupings,
  getGroupingFields,
  getIterableFormattedGroupings,
  getHasDuplicateFilters,
  getValidFilters,
  replaceComparisonFilterKey,
} from '../';
import * as helpers from '../';

const EXAMPLE_GROUPINGS = [
  {
    AND: {
      domains: {
        eq: ['gmail.com', 'yahoo.com', 'hotmail.com'],
        like: ['mail'],
      },
      sending_domains: {
        notEq: ['sparkpost.com'],
      },
    },
  },
  {
    OR: {
      templates: {
        eq: ['default'],
      },
      subaccounts: {
        eq: ['24'],
        like: ['33', '34', '35'],
      },
    },
  },
  {
    OR: {
      templates: {
        eq: ['default'],
      },
      subaccounts: {
        like: ['1', '2', '3'],
      },
    },
  },
  {
    OR: {
      campaigns: {
        notLike: ['Friday'],
        notEq: ['stuff', 'things'],
      },
    },
  },
];

describe('Report Builder helpers', () => {
  describe('getFilterTypeKey', () => {
    it('should return the key if the value passed in is the key', () => {
      expect(getFilterTypeKey('templates')).toEqual('templates');
    });

    it('should return the key if the value passed in is the label', () => {
      expect(getFilterTypeKey('Template')).toEqual('templates');
    });
  });

  describe('getFilterTypeLabel', () => {
    it('should return the label if the value passed in is the key', () => {
      expect(getFilterTypeLabel('templates')).toEqual('Template');
    });

    it('should return the label if the value passed in is the label', () => {
      expect(getFilterTypeLabel('Template')).toEqual('Template');
    });

    it('should return Campaign (ID) if the value passed in is "Campaign"', () => {
      expect(getFilterTypeLabel('Campaign')).toEqual('Campaign (ID)');
    });
  });

  describe('hydrateFilters', () => {
    it('should hydrate filters properly', () => {
      const hydratedFilters = helpers.hydrateFilters([{ AND: { templates: { eq: ['thing'] } } }]);
      expect(hydratedFilters).toMatchSnapshot();
    });

    it('should hydrate subaccount filters correctly', () => {
      const hydratedFilters = helpers.hydrateFilters([{ AND: { subaccounts: { eq: [123] } } }], {
        subaccounts: [{ id: 123, name: 'Cool Subaccount Name' }],
      });
      expect(hydratedFilters).toMatchSnapshot();
    });
  });

  describe('dehydrateFilters', () => {
    it('should dehydrate filters properly', () => {
      const dehydratedFilters = helpers.dehydrateFilters([
        {
          AND: {
            templates: { eq: [{ value: 'only thing left' }] },
            subaccounts: {
              notEq: [{ value: 'should be gone', id: 123, name: 'Should not be here' }],
            },
          },
        },
      ]);
      expect(dehydratedFilters).toMatchSnapshot();
    });
  });

  describe('getIterableFormattedGroupings', () => {
    it('remaps data in to an array of objects for clean consumption by the UI', () => {
      const data = getIterableFormattedGroupings(EXAMPLE_GROUPINGS);

      expect(data[0]).toStrictEqual({
        type: 'AND',
        filters: [
          {
            type: 'domains',
            compareBy: 'eq',
            values: ['gmail.com', 'yahoo.com', 'hotmail.com'],
          },
          {
            type: 'domains',
            compareBy: 'like',
            values: ['mail'],
          },
          {
            type: 'sending_domains',
            compareBy: 'notEq',
            values: ['sparkpost.com'],
          },
        ],
      });

      expect(data[1]).toStrictEqual({
        type: 'OR',
        filters: [
          {
            type: 'templates',
            compareBy: 'eq',
            values: ['default'],
          },
          {
            type: 'subaccounts',
            compareBy: 'eq',
            values: ['24'],
          },
          {
            type: 'subaccounts',
            compareBy: 'like',
            values: ['33', '34', '35'],
          },
        ],
      });

      expect(data[2]).toStrictEqual({
        type: 'OR',
        filters: [
          {
            type: 'templates',
            compareBy: 'eq',
            values: ['default'],
          },
          {
            type: 'subaccounts',
            compareBy: 'like',
            values: ['1', '2', '3'],
          },
        ],
      });

      expect(data[3]).toStrictEqual({
        type: 'OR',
        filters: [
          {
            type: 'campaigns',
            compareBy: 'notLike',
            values: ['Friday'],
          },
          {
            type: 'campaigns',
            compareBy: 'notEq',
            values: ['stuff', 'things'],
          },
        ],
      });
    });

    it('structures filters to a default state when no type is supplied', () => {
      const grouping = [{ AND: {} }, { OR: {} }];
      const data = getIterableFormattedGroupings(grouping);

      expect(data).toStrictEqual([
        {
          type: 'AND',
          filters: [
            {
              type: undefined,
              compareBy: 'eq',
              values: [],
            },
          ],
        },
        {
          type: 'OR',
          filters: [
            {
              type: undefined,
              compareBy: 'eq',
              values: [],
            },
          ],
        },
      ]);
    });

    it('remaps data with "not" conditions and preserves its order', () => {
      const firstGrouping = [
        {
          OR: {
            campaigns: {
              notLike: ['Friday'],
              notEq: ['stuff', 'things'],
            },
          },
        },
      ];
      const secondGrouping = [
        {
          OR: {
            campaigns: {
              notEq: ['stuff', 'things'],
              notLike: ['Friday'],
            },
          },
        },
      ];

      expect(getIterableFormattedGroupings(firstGrouping)).toStrictEqual([
        {
          type: 'OR',
          filters: [
            {
              type: 'campaigns',
              compareBy: 'notLike',
              values: ['Friday'],
            },
            {
              type: 'campaigns',
              compareBy: 'notEq',
              values: ['stuff', 'things'],
            },
          ],
        },
      ]);

      expect(getIterableFormattedGroupings(secondGrouping)).toStrictEqual([
        {
          type: 'OR',
          filters: [
            {
              type: 'campaigns',
              compareBy: 'notEq',
              values: ['stuff', 'things'],
            },
            {
              type: 'campaigns',
              compareBy: 'notLike',
              values: ['Friday'],
            },
          ],
        },
      ]);
    });
  });

  describe('getApiFormattedGroupings', () => {
    it('handles the initial, empty state', () => {
      const groupingFields = [
        {
          type: 'AND',
          hasAndBetweenGroups: false,
          hasAndButton: undefined,
          filters: [
            {
              type: undefined,
              compareBy: 'eq',
              values: [],
              hasCompareBySelect: false,
              hasCompareByLikeOptions: false,
              valueField: undefined,
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
      ];
      const data = getApiFormattedGroupings(groupingFields);

      expect(data).toStrictEqual([]);
    });

    it('handles empty values within a series of groupings', () => {
      const groupingFields = [
        {
          type: 'AND',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: 'templates',
              compareBy: 'eq',
              values: ['hello'],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'typeahead',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
        {
          type: 'AND',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: undefined,
              compareBy: 'eq',
              values: [],
              hasCompareBySelect: false,
              hasCompareByLikeOptions: false,
              valueField: undefined,
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
        {
          type: 'OR',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: 'templates',
              compareBy: 'eq',
              values: ['hello'],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'typeahead',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
      ];

      const data = getApiFormattedGroupings(groupingFields);

      expect(data).toStrictEqual([
        { AND: { templates: { eq: ['hello'] } } },
        { OR: { templates: { eq: ['hello'] } } },
      ]);
    });

    it('remaps grouping data when multiple filters are present', () => {
      const groupingFields = [
        {
          type: 'AND',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: 'templates',
              compareBy: 'eq',
              values: ['hello'],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'typeahead',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
        {
          type: 'AND',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: undefined,
              compareBy: 'eq',
              values: [],
              hasCompareBySelect: false,
              hasCompareByLikeOptions: false,
              valueField: undefined,
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
        {
          type: 'OR',
          hasAndBetweenGroups: true,
          hasAndButton: true,
          filters: [
            {
              type: 'templates',
              compareBy: 'eq',
              values: ['hello'],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'typeahead',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
            {
              type: 'subaccounts',
              compareBy: 'eq',
              values: ['102', '104'],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'typeahead',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
            {
              type: 'domains',
              compareBy: 'like',
              values: [],
              hasCompareBySelect: true,
              hasCompareByLikeOptions: true,
              valueField: 'multi-entry',
              hasGroupingTypeRadioGroup: false,
              hasAndButton: false,
              hasOrButton: false,
              hasComparisonBetweenFilters: false,
              hasRemoveButton: false,
            },
          ],
        },
      ];
      const data = getApiFormattedGroupings(groupingFields);
      const expectedData = [
        { AND: { templates: { eq: ['hello'] } } },
        { OR: { templates: { eq: ['hello'] }, subaccounts: { eq: ['102', '104'] } } },
      ];

      expect(data).toStrictEqual(expectedData);
      expect(expectedData[1]).not.toHaveProperty('domains');
    });

    it('reverts re-mapped groupings data to the original structure', () => {
      const data = getApiFormattedGroupings(
        getGroupingFields(getIterableFormattedGroupings(EXAMPLE_GROUPINGS)),
      );

      expect(data).toStrictEqual(EXAMPLE_GROUPINGS);
    });
  });

  describe('getHasDuplicateFilters', () => {
    it('returns `false` when there are no duplicate filters in the passed in array', () => {
      const filters = [
        {
          type: 'sending_domains',
          compareBy: 'contains',
        },
        {
          type: 'sending_domains',
          compareBy: 'eq',
        },
        {
          type: 'subaccounts',
          compareBy: 'eq',
        },
      ];

      expect(getHasDuplicateFilters(filters)).toBe(false);
    });

    it('returns `true` when there are duplicate filters in the array', () => {
      const filters = [
        {
          type: 'sending_domains',
          compareBy: 'contains',
        },
        {
          type: 'sending_domains',
          compareBy: 'contains',
        },
        {
          type: 'subaccounts',
          compareBy: 'eq',
        },
      ];

      expect(getHasDuplicateFilters(filters)).toBe(true);
    });

    it('ignores any object properties that are irrelevant to the UI', () => {
      const filters = [
        {
          type: 'sending_domains',
          compareBy: 'contains',
          random: 'stuff',
        },
        {
          type: 'sending_domains',
          compareBy: 'contains',
          what: 'is-going-on',
        },
      ];

      expect(getHasDuplicateFilters(filters)).toBe(true);
    });
  });

  describe('getValidFilters', () => {
    it('returns the same array when all filters are valid', () => {
      expect(getValidFilters(EXAMPLE_GROUPINGS)).toEqual(EXAMPLE_GROUPINGS);
    });
    it('removes filters with invalid comparator types', () => {
      const input = [
        {
          AND: {
            domains: {
              eq: ['gmail.com', 'yahoo.com', 'hotmail.com'],
              like: ['mail'],
            },
            sending_domains: {
              notEq: ['sparkpost.com'],
            },
          },
        },
        {
          OR: {
            templates: {
              eq: ['default'],
            },
            subaccounts: {
              eq: ['24'],
              not_valid_comparator: ['33', '34', '35'], //Invalid comparator type
            },
          },
        },
      ];
      expect(getValidFilters(input)).toEqual([EXAMPLE_GROUPINGS[0]]);
    });
    it('removes filters with invalid filter types', () => {
      const input = [
        {
          AND: {
            domains: {
              eq: ['gmail.com', 'yahoo.com', 'hotmail.com'],
              like: ['mail'],
            },
            sending_domains: {
              notEq: ['sparkpost.com'],
            },
          },
        },
        {
          OR: {
            templates: {
              eq: ['default'],
            },
            something: {
              //Invalid filter type
              eq: ['24'],
              like: ['33', '34', '35'],
            },
          },
        },
      ];
      expect(getValidFilters(input)).toEqual([EXAMPLE_GROUPINGS[0]]);
    });
    it('removes filters with invalid comparator conjugations', () => {
      const input = [
        {
          AND: {
            domains: {
              eq: ['gmail.com', 'yahoo.com', 'hotmail.com'],
              like: ['mail'],
            },
            sending_domains: {
              notEq: ['sparkpost.com'],
            },
          },
        },
        {
          XOR: {
            //Invalid comparator conjugation
            templates: {
              eq: ['default'],
            },
            subaccounts: {
              eq: ['24'],
              like: ['33', '34', '35'],
            },
          },
        },
      ];
      expect(getValidFilters(input)).toEqual([EXAMPLE_GROUPINGS[0]]);
    });
    it('returns empty array when all filters are invalid', () => {
      const input = [
        {
          XOR: {
            domains: {
              eq: ['gmail.com', 'yahoo.com', 'hotmail.com'],
              haha: ['mail'],
            },
          },
        },
        {
          Foo: {
            bar: {
              baz: ['default'],
            },
          },
        },
      ];
      expect(getValidFilters(input)).toEqual([]);
    });
    it('returns array with filters removed that are malformed', () => {
      const input = [
        5,
        { AND: 5 },
        {
          AND: {
            domains: 'foo',
          },
        },
        {
          AND: {
            domains: { eq: 'foo' },
          },
        },
      ];
      expect(getValidFilters(input)).toEqual([]);
    });
  });
  describe('replaceComparisonFilterKey', () => {
    it('returns the same comparison filter when there are the filter keys are already key value', () => {
      const comparison = [
        { type: 'campaigns', value: 'Black Friday' },
        { type: 'campaigns', value: 'Christmas Sale' },
      ];

      expect(replaceComparisonFilterKey(comparison)).toEqual(comparison);
    });

    it('returns the same comparison filter with the key value replaced from label to key', () => {
      const comparisonInput = [
        { type: 'Campaign', value: 'Black Friday' },
        { type: 'Campaign', value: 'Christmas Sale' },
      ];
      const comparisonOutput = [
        { type: 'campaigns', value: 'Black Friday' },
        { type: 'campaigns', value: 'Christmas Sale' },
      ];

      expect(replaceComparisonFilterKey(comparisonInput)).toEqual(comparisonOutput);
    });

    it('removes invalid comparison filters types', () => {
      const comparisonInput = [
        { type: 'campaigns', value: 'Black Friday' },
        { type: 'foo', value: 'Christmas Sale' },
      ];

      expect(replaceComparisonFilterKey(comparisonInput)).toHaveLength(1);
    });
  });
});
