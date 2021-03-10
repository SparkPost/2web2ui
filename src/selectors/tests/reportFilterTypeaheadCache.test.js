import selectCache from '../reportFilterTypeaheadCache';

describe('Selector: Report Filter Typeahead Cache', () => {

  let testState;

  beforeEach(() => {
    testState = {
      subaccounts: { list: []},
      sendingDomains: { list: []},
      metrics: {
        campaigns: [],
        domains: [],
        sendingIps: [],
        ipPools: [],
        templates: []
      }
    };
  });

  it('should reshape the templates', () => {
    testState.metrics.templates = [1,2,3];
    expect(selectCache(testState)).toEqual([
      { type: 'Template', value: 1 },
      { type: 'Template', value: 2 },
      { type: 'Template', value: 3 }
    ]);
  });

  it('should reshape subaccounts', () => {
    testState.subaccounts.list = [{ name: 'A', id: 1, blah: 'garbage' }, { name: 'B', id: 2, ignore: 'me' }, { name: 'C', id: 3 }];
    expect(selectCache(testState)).toEqual([
      { type: 'Subaccount', value: 'A (ID 1)', id: 1 },
      { type: 'Subaccount', value: 'B (ID 2)', id: 2 },
      { type: 'Subaccount', value: 'C (ID 3)', id: 3 }
    ]);
  });

  it('should reshape sending domains', () => {
    testState.sendingDomains.list = [{ domain: 'abc.com', blah: 'whatever' }, { domain: 'xyz.biz', blah: 'ok' }];
    expect(selectCache(testState)).toEqual([
      { type: 'Sending Domain', value: 'abc.com' },
      { type: 'Sending Domain', value: 'xyz.biz' }
    ]);
  });

  it('should reshape recipient domains', () => {
    testState.metrics.domains = ['domain1', 'domain2', 'domain3', 'domain4'];
    expect(selectCache(testState)).toEqual([
      { type: 'Recipient Domain', value: 'domain1' },
      { type: 'Recipient Domain', value: 'domain2' },
      { type: 'Recipient Domain', value: 'domain3' },
      { type: 'Recipient Domain', value: 'domain4' }
    ]);
  });

  it('should reshape campaigns', () => {
    testState.metrics.campaigns = ['campaign1', 'campaign2'];
    expect(selectCache(testState)).toEqual([
      { type: 'Campaign', value: 'campaign1' },
      { type: 'Campaign', value: 'campaign2' }
    ]);
  });

  it('should reshape sending IPs', () => {
    testState.metrics.sendingIps = ['ip1', 'ip2', 'ip3'];
    expect(selectCache(testState)).toEqual([
      { type: 'Sending IP', value: 'ip1' },
      { type: 'Sending IP', value: 'ip2' },
      { type: 'Sending IP', value: 'ip3' }
    ]);
  });

  it('should reshape IP pools', () => {
    testState.metrics.ipPools = ['pool_1', 'pool_2'];
    expect(selectCache(testState)).toEqual([
      { type: 'IP Pool', value: 'pool_1' },
      { type: 'IP Pool', value: 'pool_2' }
    ]);
  });

  it('should flatten all the caches together', () => {
    testState.subaccounts.list = [{ name: 'A', id: 11 }, { name: 'B', id: 12 }];
    testState.sendingDomains.list = [{ domain: 'abc.com' }, { domain: 'xyz.biz' }];
    testState.metrics.domains = ['domain1', 'domain2'];
    testState.metrics.campaigns = ['campaign1', 'campaign2'];
    testState.metrics.sendingIps = ['ip1', 'ip2'];
    testState.metrics.ipPools = ['pool_1', 'pool_2'];
    testState.metrics.templates = [1, 2];

    expect(selectCache(testState)).toHaveLength(14);
  });
});
