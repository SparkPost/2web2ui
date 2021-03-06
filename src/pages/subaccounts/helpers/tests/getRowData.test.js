import cases from 'jest-in-case';

import getRowData from '../getRowData';

const active = {
  id: 123,
  name: 'Joe\'s Garage',
  status: 'active',
  ip_pool: 'my_ip_pool',
  compliance_status: 'active'
};

const suspended = {
  id: 789,
  name: 'Dev Avocado',
  status: 'suspended',
  compliance_status: 'active'
};

const terminated = {
  id: 456,
  name: 'SharkPost',
  status: 'terminated',
  compliance_status: 'terminated'
};

cases('Get row data', (opts) => {
  const rowData = getRowData(opts.subaccount);
  expect(rowData).toMatchSnapshot();
}, {
  active: { subaccount: active },
  suspended: { subaccount: suspended },
  terminated: { subaccount: terminated }
});
