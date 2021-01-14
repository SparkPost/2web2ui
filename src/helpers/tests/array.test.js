import { toSentence } from '../array';

describe('toSentence', () => {
  it('returns empty string for empty list', () => {
    expect(toSentence([])).toEqual('');
  });

  it('returns first value', () => {
    expect(toSentence(['first'])).toEqual('first');
  });

  it('returns both values joined by and', () => {
    expect(toSentence(['first', 'second'])).toEqual('first and second');
  });

  it('returns a sentence', () => {
    expect(toSentence(['first', 'second', 'third'])).toEqual('first, second, and third');
  });

  it('returns both values with specified conjuction', () => {
    expect(toSentence(['first', 'second'], 'or')).toEqual('first or second');
  });

  it('returns a sentence with specified conjunction', () => {
    expect(toSentence(['first', 'second', 'third'], 'or')).toEqual('first, second, or third');
  });
});
