import _ from 'lodash';

export const toSentence = (array, conjuctionTerm = 'and') => {
  const conjunction = array.length >= 3 ? `, ${conjuctionTerm} ` : ` ${conjuctionTerm} `;
  return (
    array.slice(0, -2).join(', ') + //combines all elements except the last 2 into comma separated items.
    (array.slice(0, -2).length ? ', ' : '') + //appends comma before appending last 2 items unless there are <=2 item in the whole array
    array.slice(-2).join(conjunction)
  ); //joins the last 2 items using oxford comma for >=3 items and append to end of sentence.
};
