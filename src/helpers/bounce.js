import { snakeToCamel } from 'src/helpers/string';
import fp from 'lodash/fp';

/**
 * Camel cases aggregates
 */
function formatAggregates(aggregates) {
  return fp.mapKeys(key => snakeToCamel(key))(aggregates);
}

/**
 * Formats category objects from getBounceClassifications
 */
function formatCategory(classification) {
  const {
    bounce_category_name,
    bounce_class_name,
    count_bounce = 0,
    count_admin_bounce = 0,
  } = classification;
  return {
    category: bounce_category_name,
    name: bounce_class_name,
    count: count_bounce || count_admin_bounce,
  };
}

/**
 * Reshapes results of getBounceClassifications for the bounce chart
 * @param  {Object} data - getBounceClassifications results
 * @return {Array} - Categories ordered by count and grouped by bounce category name
 */
function reshapeCategories(data) {
  const categories = [];

  const assignToCategory = item => {
    const { category, ...rest } = item;
    const index = fp.findIndex(({ name }) => name === category)(categories);

    if (index === -1) {
      categories.push({
        name: category,
        count: rest.count,
        children: [rest],
      });
    } else {
      categories[index].count = categories[index].count + rest.count;
      categories[index].children.push(rest);
    }
  };

  fp.flow(fp.flatMap(formatCategory), fp.each(assignToCategory))(data);

  return fp.orderBy(['count'], ['desc'])(categories);
}

/**
 * Creates band type data for bounce chart from aggregates
 */
function getBandTypes({ countInbandBounce, countOutofbandBounce }) {
  return [
    { name: 'In-Band', count: countInbandBounce },
    { name: 'Out-of-Band', count: countOutofbandBounce },
  ];
}

export { formatAggregates, reshapeCategories, getBandTypes };
