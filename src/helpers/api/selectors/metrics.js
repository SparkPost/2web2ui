export const selectRecipientDomains = ({ domains = [] } = {}) =>
  domains.map(value => ({
    type: 'domains',
    value,
  }));

export const selectSubaccounts = (subaccounts = []) =>
  subaccounts.map(({ name, id }) => ({
    type: 'subaccounts',
    value: `${name} (ID ${id})`,
    id,
  }));

export const selectSendingDomains = (sendingDomains = []) =>
  sendingDomains.map(({ domain }) => ({
    type: 'sending_domains',
    value: domain,
  }));

export const selectCampaigns = ({ campaigns = [] } = {}) =>
  campaigns.map(value => ({
    type: 'campaigns',
    value,
  }));

export const selectSubjectCampaigns = ({ 'subject-campaigns': subjectCampaigns = [] } = {}) =>
  subjectCampaigns.map(value => ({
    type: 'subject_campaigns',
    value,
  }));

export const selectSendingIps = (data = {}) => {
  const sendingIps = data['sending-ips'] || [];
  return sendingIps.map(value => ({
    type: 'sending_ips',
    value,
  }));
};

export const selectIpPools = (data = {}) => {
  const ipPools = data['ip-pools'] || [];
  return ipPools.map(value => ({
    type: 'ip_pools',
    value,
  }));
};

export const selectTemplates = ({ templates = [] } = {}) =>
  templates.map(value => ({
    type: 'templates',
    value,
  }));
