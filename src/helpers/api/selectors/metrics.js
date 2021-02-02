export const selectRecipientDomains = ({ domains = [] } = {}) =>
  domains.map(value => ({
    type: 'Recipient Domain',
    value,
  }));

export const selectSubaccounts = (subaccounts = []) =>
  subaccounts.map(({ name, id }) => ({
    type: 'Subaccount',
    value: `${name} (ID ${id})`,
    id,
  }));

export const selectSendingDomains = (sendingDomains = []) =>
  sendingDomains.map(({ domain }) => ({
    type: 'Sending Domain',
    value: domain,
  }));

export const selectCampaigns = ({ campaigns = [] } = {}) =>
  campaigns.map(value => ({
    type: 'Campaign',
    value,
  }));

export const selectSendingIps = (data = {}) => {
  const sendingIps = data['sending-ips'] || [];
  return sendingIps.map(value => ({
    type: 'Sending IP',
    value,
  }));
};

export const selectIpPools = (data = {}) => {
  const ipPools = data['ip-pools'] || [];
  return ipPools.map(value => ({
    type: 'IP Pool',
    value,
  }));
};

export const selectTemplates = ({ templates = [] } = {}) =>
  templates.map(value => ({
    type: 'Template',
    value,
  }));
