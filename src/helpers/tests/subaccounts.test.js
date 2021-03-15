import * as subaccounts from '../subaccounts';

describe('subaccount helpers', () => {
  describe('setSubaccountQuery', () => {
    it('should return an empty string for undefined', () => {
      expect(subaccounts.setSubaccountQuery()).toEqual('');
    });

    it('should return an empty string for null', () => {
      expect(subaccounts.setSubaccountQuery(null)).toEqual('');
    });

    it('should return a query string for an integer', () => {
      expect(subaccounts.setSubaccountQuery(101)).toEqual('?subaccount=101');
    });

    it('should return a query string for an string', () => {
      expect(subaccounts.setSubaccountQuery('101')).toEqual('?subaccount=101');
    });
  });

  describe('setSubaccountHeader', () => {
    it('should set headers to empty object if subaccount is null', () => {
      expect(subaccounts.setSubaccountHeader()).toEqual({});
    });

    it('should use subaccount.id when it is an object', () => {
      expect(subaccounts.setSubaccountHeader({ id: 1 })).toEqual({ 'x-msys-subaccount': 1 });
    });

    it('should use subaccount when not an object', () => {
      expect(subaccounts.setSubaccountHeader(1)).toEqual({ 'x-msys-subaccount': 1 });
    });
  });
});
