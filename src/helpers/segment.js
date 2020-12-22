/**
 * These SEGMENT_EVENTS and SEGMENT_TRAITS can be found in the Segment UI at
 * https://app.segment.com/sparkpost-daniel-chalef/protocols/tracking-plans/rs_1fgfDp0I1luTRlc3XpeQ6EpPwxx
 * as part of the protocols feature.
 */

export const SEGMENT_EVENTS = {
  ACCOUNT_CANCELLED: 'Account Cancelled',
  ACCOUNT_CREATED: 'Account Created',
  ACCOUNT_DOWNGRADED: 'Account Downgraded',
  ACCOUNT_UPGRADED: 'Account Upgraded',
  ALERT_CREATED: 'Alert Created',
  API_KEY_CREATED: 'API Key Created',
  HIBANA_TOGGLED_ON: 'Hibana Toggled On',
  HIBANA_TOGGLED_OFF: 'Hibana Toggled Off',
  INVITE_SENT: 'Invite Sent',
  SENDING_DOMAIN_ADDED: 'Sending Domain Added',
  SENDING_DOMAIN_VERIFIED: 'Sending Domain Verified',
  EMPTY_STATE_LOADED: 'Empty state loaded',
  REPORT_BUILDER_COMPARISON_ADDED: 'Report Builder Comparison Added',
};

const UX_EVENTS = [SEGMENT_EVENTS.HIBANA_TOGGLED_ON, SEGMENT_EVENTS.HIBANA_TOGGLED_OFF];

export const SEGMENT_TRAITS = {
  COMPANY: 'company',
  CREATED_AT: 'createdAt',
  CUSTOMER_ID: 'customer_id',
  EMAIL: 'email',
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  PLAN: 'plan',
  SERVICE_LEVEL: 'service_level',
  TENANT: 'tenant',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
};

/**
 * Helper to identify and group a user, partial updates are supported
 * @param {} traits must include SEGMENT_TRAITS.USER_ID, SEGMENT_TRAITS.CUSTOMER_ID, and SEGMENT_TRAITS.EMAIL
 */
export const segmentIdentify = traits => {
  if (
    window.analytics &&
    window.analytics.identify &&
    window.analytics.group &&
    traits[SEGMENT_TRAITS.CUSTOMER_ID] &&
    traits[SEGMENT_TRAITS.USER_ID] &&
    traits[SEGMENT_TRAITS.EMAIL] &&
    traits[SEGMENT_TRAITS.TENANT]
  ) {
    const filteredTraits = Object.values(SEGMENT_TRAITS).reduce((filtered, key) => {
      if (traits[key]) {
        filtered[key] = traits[key];
      }
      return filtered;
    }, {});

    window.analytics.identify(
      `${filteredTraits[SEGMENT_TRAITS.EMAIL]}//${traits[SEGMENT_TRAITS.CUSTOMER_ID]}`,
      filteredTraits,
    );
    const groupIdentifier = `${filteredTraits[SEGMENT_TRAITS.TENANT]}//${
      traits[SEGMENT_TRAITS.CUSTOMER_ID]
    }`;

    // Mixpanel ignores the first argument for grouping, so we need to pass it twice
    window.analytics.group(groupIdentifier, {
      groupId: groupIdentifier,
    });
  }
};

const getUTMsFromURL = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const utms = {
    utm_campaign: urlParams.get('utm_campaign'),
    utm_medium: urlParams.get('utm_medium'),
    utm_source: urlParams.get('utm_source'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
  };

  return Object.keys(utms).reduce((clean, key) => {
    if (utms[key] !== null) {
      clean[key] = utms[key];
    }
    return clean;
  }, {});
};

export const segmentPage = () => {
  if (window.analytics && window.analytics.page) {
    const UTMs = getUTMsFromURL();
    if (UTMs) {
      window.analytics.page(undefined, UTMs);
    } else {
      window.analytics.page();
    }
  }
};

export const segmentTrack = (eventType, traits = {}) => {
  if (window.analytics && window.analytics.track) {
    if (UX_EVENTS.includes(eventType)) {
      window.analytics.track(eventType, { ...traits, ux: true });
    } else {
      window.analytics.track(eventType, traits);
    }
  }
};
