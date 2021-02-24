import _ from 'lodash';
import {
  REPORT_BUILDER_FILTER_KEY_MAP,
  REPORT_BUILDER_FILTER_KEY_INVERTED_MAP,
} from 'src/constants';

/**
 * Returns the filter key for REPORT_BUILDER_FILTER_KEY_MAP object based on the passed in value
 *
 * @param {string} key - either the key or label value for the filters map
 */
export function getFilterTypeKey(key) {
  if (REPORT_BUILDER_FILTER_KEY_INVERTED_MAP.hasOwnProperty(key)) {
    return key;
  }
  return REPORT_BUILDER_FILTER_KEY_MAP[key];
}

/**
 * Returns the filter label for REPORT_BUILDER_FILTER_KEY_MAP object based on the passed in value
 *
 * @param {string} key - either the key or label value for the filters map
 */
export function getFilterTypeLabel(key) {
  if (REPORT_BUILDER_FILTER_KEY_MAP.hasOwnProperty(key)) {
    if (key === 'Campaign') {
      const campaignKey = REPORT_BUILDER_FILTER_KEY_MAP[key];
      return REPORT_BUILDER_FILTER_KEY_INVERTED_MAP[campaignKey];
    }
    return key;
  }
  return REPORT_BUILDER_FILTER_KEY_INVERTED_MAP[key];
}
/**
 * Remaps grouped filter data to make it more iterable
 *
 * @param {array} groupings - An array of grouped metrics filters
 * */
export function getIterableFormattedGroupings(groupings) {
  return groupings.map(grouping => {
    const groupingKeys = Object.keys(grouping);
    const groupingType = groupingKeys[0];
    const filters = Object.keys(grouping[groupingType]);

    if (filters.length === 0) {
      return {
        type: groupingType,
        filters: [getInitialFilterState()],
      };
    }

    return {
      type: groupingType,
      filters: _.flatten(
        filters.map(filter => {
          const filterObj = grouping[groupingType][filter];
          const comparisons = Object.keys(filterObj);

          return comparisons.map(compareBy => {
            return {
              type: filter,
              compareBy: compareBy,
              values: _.get(filterObj, compareBy),
            };
          });
        }),
      ),
    };
  });
}

/**
 * Returns initial state for an individual filter, i.e., after it is added to a list of filters
 */
export function getInitialFilterState() {
  return {
    type: undefined,
    compareBy: 'eq',
    values: [],
  };
}

/**
 * Returns initial state for a group, i.e., after it is added to a list of groupings
 */
export function getInitialGroupState() {
  return {
    type: 'AND',
    filters: [getInitialFilterState()],
  };
}

/**
 * Returns UI state to render multi-layer filter forms based on the user's entry
 * Unit tests for this function were intentionally not written as they are tied closely to UI state
 * and are well tested by integration tests.
 *
 * @param {array} iterableGroupings - array of iterable filter groupings, usually derived from `getIterableFormattedGroupings`
 */
export function getGroupingFields(iterableGroupings) {
  const groupings = iterableGroupings;
  const getValueFieldType = compareBy => {
    switch (compareBy) {
      case 'eq':
      case 'notEq':
        return 'typeahead';

      case 'like':
      case 'notLike':
        return 'multi-entry';

      default:
        return undefined;
    }
  };

  return groupings.map((grouping, groupingIndex) => {
    return {
      ...grouping,

      // Renders an "AND" below all groups *except* the last one in the list
      hasAndBetweenGroups: Boolean(groupingIndex + 1 < groupings.length),

      // Renders below the last group in the list when one of the filters has values
      hasAndButton: Boolean(
        groupingIndex + 1 === groupings.length &&
          groupings[groupingIndex].filters.find(filter => filter.values.length > 0),
      ),

      // Whether or not this particular group has duplicate filters
      hasDuplicateFilters: getHasDuplicateFilters(grouping.filters),

      filters: grouping.filters.map((filter, filterIndex) => {
        return {
          ...filter,

          // Grabbing the label by the key value
          label: Object.keys(REPORT_BUILDER_FILTER_KEY_MAP).find(
            key => REPORT_BUILDER_FILTER_KEY_MAP[key] === filter.type,
          ),

          // The form comparison field does not render without a type selected,
          hasCompareBySelect: !!filter.type,

          // Controls whether a filter has "like" comparison options
          hasCompareByLikeOptions: !!filter.type && filter.type !== 'subaccounts',

          // Filter comparison type controls which type of form control renders next
          valueField: filter.type ? getValueFieldType(filter.compareBy) : undefined,

          // Renders on the first group of filters only and when valid filter values exist
          hasGroupingTypeRadioGroup: filterIndex === 0 && filter.values.length > 0,

          // Renders when the grouping is an "AND", when valid filter values exist, on the last filter
          hasAndButton:
            grouping.type === 'AND' &&
            filter.values.length > 0 &&
            filterIndex + 1 === grouping.filters.length,

          // Renders when the grouping is an "OR", when valid filter values exist, on the last filter
          hasOrButton:
            grouping.type === 'OR' &&
            filter.values.length &&
            filterIndex + 1 === grouping.filters.length,

          // Renders comparison text ("OR" or "AND") when more than one grouping exists but not on the last filter in the grouping
          hasComparisonBetweenFilters:
            grouping.filters.length > 1 && filterIndex + 1 !== grouping.filters.length,

          // Renders when there is more than 1 grouping in the form
          hasRemoveButton:
            (groupingIndex === 0 && grouping.filters.length > 1) || groupingIndex > 0,
        };
      }),
    };
  });
}

/**
 * Returns UI state to render active filter tags based on the user's entry
 * Unit tests for this function were intentionally not written as they are tied closely to UI state
 * and are well tested by integration tests.
 *
 * @param {array} remappedGroupings
 *
 */
export function getActiveFilterTagGroups(iterableGroupings) {
  const groupings = iterableGroupings;
  const getCompareByText = compareBy => {
    switch (compareBy) {
      case 'eq':
        return 'is equal to';
      case 'notEq':
        return 'is not equal to';
      case 'like':
        return 'contains';
      case 'notLike':
        return 'does not contain';
      default:
        throw new Error(`${compareBy} is not a valid comparison value.`);
    }
  };

  return groupings.map((grouping, groupingIndex) => {
    return {
      type: grouping.type,
      values: grouping.values,

      // Renders below all groups *except* the last one in the list
      hasAndBetweenGroups: groupingIndex + 1 < groupings.length,

      filters: grouping.filters.map((filter, filterIndex) => {
        return {
          values: filter.values,

          // Grabbing the label by the key value
          label: REPORT_BUILDER_FILTER_KEY_INVERTED_MAP[filter.type],

          compareBy: getCompareByText(filter.compareBy),

          // Renders comparison text ("OR" or "AND") when more than one grouping exists but not on the last filter in the grouping
          hasComparisonBetweenFilters:
            grouping.filters.length > 1 && filterIndex + 1 !== grouping.filters.length,
        };
      }),
    };
  });
}

/**
 * Reverts UI-formatted data mapping and re-structures said data to match API structure
 *
 * @param {array} groupingFields - array of UI filter group fields, typically derived from `getGroupingFields`
 */
export function getApiFormattedGroupings(groupingFields) {
  return groupingFields
    .map(grouping => {
      const groupingHasValues = Boolean(grouping.filters.find(filter => filter.values.length > 0));
      const groupingType = grouping.type; // "AND" or "OR"

      // Only reformat and return a grouping when it has valid filters within
      if (!groupingHasValues) return undefined;

      // Converts filters array to object/key structure
      const formattedFilters = grouping.filters.reduce((obj, filter) => {
        const filterHasValues = filter.values.length > 0;
        const comparisonWithValues = _.setWith({}, filter.compareBy, filter.values); // Pairs values with the grouping type, i.e., `"domains": [ ...values ]`
        const filterObj = {
          [filter.type]: {
            ...obj[filter.type],
            ...comparisonWithValues,
          },
        };

        return {
          ...obj,
          ...(filterHasValues ? filterObj : undefined), // Only incorporate the object key and its comparisons when values are present
        };
      }, {});

      return {
        [groupingType]: {
          ...formattedFilters,
        },
      };
    })
    .filter(Boolean); // Remove undefined entries in the object
}

/**
 * Converts API data structure in to a more human-readable version of filters for later rendering
 *
 * @param {array} groupings - grouped filters retrieved from the API
 * @param {Object} options
 * @param {array} options.subaccounts - array of subaccounts, usually retrieved from the global data store
 */
export function hydrateFilters(groupings, { subaccounts } = {}) {
  return groupings.map(grouping => {
    const groupingKeys = Object.keys(grouping);
    const groupingType = groupingKeys[0];
    const filters = Object.keys(grouping[groupingType]);

    return {
      [groupingType]: filters.reduce((ret, filter) => {
        const filterObj = grouping[groupingType][filter];
        const comparisons = Object.keys(filterObj);
        ret[filter] = comparisons.reduce((filterRet, comparison) => {
          switch (comparison) {
            case 'eq':
            case 'notEq': {
              if (filter === 'subaccounts') {
                filterRet[comparison] = filterObj[comparison].map(rawValue => {
                  // Depending on the filters being parsed (old vs. newer grouped comparator filters),
                  // the filters may be a an object instead of a string.
                  const value = typeof rawValue === 'object' ? rawValue.id : rawValue;
                  const subaccount =
                    subaccounts.find(subaccount => subaccount.id === Number.parseInt(value)) || {};
                  const { name, id } = subaccount;

                  return {
                    value: name ? `${name} (ID ${id})` : value,
                    id,
                    type: getFilterTypeKey(filter),
                  };
                });
              } else {
                filterRet[comparison] = filterObj[comparison].map(rawValue => {
                  // Depending on the filters being parsed (old vs. newer grouped comparator filters),
                  // the filters may be a an object instead of a string.
                  const value = typeof rawValue === 'object' ? rawValue.value : rawValue;

                  return { value, type: getFilterTypeKey(filter) };
                });
              }

              return filterRet;
            }
            case 'like':
            case 'notLike':
            default:
              filterRet[comparison] = filterObj[comparison];
              return filterRet;
          }
        }, {});

        return ret;
      }, {}),
    };
  });
}

/**
 * Flattens manipulated data structure for use with the API
 *
 * @param {array} groupings - array of filter groups
 */
export function dehydrateFilters(groupings) {
  return groupings.map(grouping => {
    const groupingKeys = Object.keys(grouping);
    const groupingType = groupingKeys[0];
    const filters = Object.keys(grouping[groupingType]);

    return {
      [groupingType]: filters.reduce((ret, filter) => {
        const filterObj = grouping[groupingType][filter];
        const comparisons = Object.keys(filterObj);
        ret[filter] = comparisons.reduce((filterRet, comparison) => {
          switch (comparison) {
            case 'eq':
            case 'notEq': {
              if (filter === 'subaccounts') {
                filterRet[comparison] = filterObj[comparison].map(({ id }) => String(id));
              } else {
                filterRet[comparison] = filterObj[comparison].map(({ value }) => value);
              }

              return filterRet;
            }
            case 'like':
            case 'notLike':
            default:
              filterRet[comparison] = filterObj[comparison];
              return filterRet;
          }
        }, {});

        return ret;
      }, {}),
    };
  });
}

/**
 * Within a filter grouping, this function returns `true` when duplicate filters are present.
 * Only the "type" and "compareBy" keys are relevant when making this comparison.
 *
 * @param {array} filters - iterable array of filter objects derived from `getIterableFormattedGroupings`
 *
 */
export function getHasDuplicateFilters(filters) {
  // Simplifies filters according to relevant keys
  const formattedFilters = filters.map(({ type, compareBy }) => {
    return {
      type,
      compareBy,
    };
  });
  const uniqueFilters = _.uniqWith(formattedFilters, _.isEqual); // Generates an array of unique filters

  // If there are more filters than unique filters, then there must be a duplicate present
  return filters.length > uniqueFilters.length;
}

/**
 * Replaces the key of comparisons with the key value rather than label value
 *
 * @param {array[Object]} comparisons - comparison object
 *
 */
export function replaceComparisonFilterKey(comparisons) {
  return comparisons.map(comparison => {
    return { ...comparison, type: getFilterTypeKey(comparison.type) };
  });
}
