import * as helpers from '../helpers';

let allSubaccounts;

beforeEach(() => {
  allSubaccounts = [
    { name: 'sub 1', id: 101 },
    { name: 'sub 2', id: 501 },
  ];
});

describe('formatSubaccountDisplay', () => {
  it('formats correctly if no subaccount exist', () => {
    expect(helpers.formatSubaccountDisplay(null, allSubaccounts)).toEqual('Primary Account (0)');
  });

  it('format just subaccount id if not found in allSubaccounts', () => {
    expect(helpers.formatSubaccountDisplay(1, allSubaccounts)).toEqual('1');
  });

  it('formats with name and id when subaccount is found in allSubaccounts', () => {
    expect(helpers.formatSubaccountDisplay(101, allSubaccounts)).toEqual('sub 1 (101)');
  });
});
