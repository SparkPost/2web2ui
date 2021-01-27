import _ from 'lodash';
import React from 'react';
import {
  METRICS,
  FILTERS_FRIENDLY_NAMES,
  SOURCE_FRIENDLY_NAMES,
  OPERATOR_FRIENDLY_NAMES,
} from '../constants/formConstants';
import { Box, Panel, Tag } from 'src/components/matchbox';
import LabelledValue from 'src/components/labelledValue/LabelledValue';
import { MAILBOX_PROVIDERS } from 'src/constants';
import { Heading } from 'src/components/text';
import OGStyles from './AlertDetails.module.scss';
import hibanaStyles from './AlertDetailsHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride/useHibanaOverride';
import AlertToggle from './AlertToggle';
import { SlackIcon, WebhookIcon } from 'src/components/icons';
import { getEvaluatorOptions } from '../helpers/alertForm';
import { useHibana } from 'src/context/HibanaContext';

const extraChannels = [
  {
    key: 'slack',
    icon: SlackIcon,
    label: 'Slack',
  },
  {
    key: 'webhook',
    icon: WebhookIcon,
    label: 'Webhook',
  },
];

export const AlertDetails = ({
  alert,
  id,
  subaccountIdToString,
  hasSubaccounts,
  renderPrimaryAreaComponent,
}) => {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const SectionComponent = isHibanaEnabled ? Box : Panel.LEGACY.Section;
  const FilteredByComponent = isHibanaEnabled
    ? ({ children }) => <div>{children}</div>
    : ({ children }) => <span>{children}</span>;

  const {
    metric,
    channels = {},
    filters = [],
    subaccounts = [],
    threshold_evaluator = {},
    any_subaccount,
    muted,
  } = alert;
  const { source, operator, value } = threshold_evaluator;

  const getSubaccountsTags = () => {
    if (any_subaccount) {
      return <Tag className={styles.Tags}>Any Subaccount</Tag>;
    }
    const subaccountTags = subaccounts.map(subaccount => (
      <Tag className={styles.Tags} key={subaccount}>
        {subaccountIdToString(subaccount)}
      </Tag>
    ));
    return subaccountTags;
  };

  const getFilterValuesTags = (type, values) => {
    const valueTags = values.map(value => {
      const formattedValue = type === 'mailbox_provider' ? MAILBOX_PROVIDERS[value] : value;
      return (
        <Tag className={styles.Tags} key={`${type}-${value}`}>
          {formattedValue}
        </Tag>
      );
    });
    return valueTags;
  };

  const renderFilteredBy = () => {
    //Shows subaccounts filter if the account has subaccounts and if the subaccount value is not `Primary and all`
    const shouldShowSubaccounts =
      hasSubaccounts && ((subaccounts.length > 0 && subaccounts[0] !== -1) || any_subaccount);
    const subaccount = shouldShowSubaccounts ? (
      <span key="subaccounts">
        <p className={styles.ValueLabel}>Subaccounts</p> {getSubaccountsTags()}
      </span>
    ) : (
      undefined
    );

    // Removes filter which contain string 'any'. Currently only appears on blocklist alerts
    const blocklistFilters = ['blocklist_provider', 'blocklist_resource'];
    const cleanedFilters = filters.filter(
      ({ filter_values, filter_type }) =>
        !(blocklistFilters.includes(filter_type) && filter_values[0] === 'any'),
    );

    //Only show 'and' if it's not the first filter or if there's a subaccounts filter (linebreak for Hibana)
    const filtersTags = cleanedFilters.map((filter, i) => (
      <FilteredByComponent key={filter.filter_type}>
        {(shouldShowSubaccounts || i > 0) && !isHibanaEnabled && 'and '}
        <p className={styles.ValueLabel}>{FILTERS_FRIENDLY_NAMES[filter.filter_type]}</p>{' '}
        {getFilterValuesTags(filter.filter_type, filter.filter_values)}
      </FilteredByComponent>
    ));

    const renderedFilters = [subaccount, ...filtersTags].filter(Boolean);

    //If no subaccount or filters, do not show this row.
    if (renderedFilters.length === 0) {
      return undefined;
    }
    return renderedFilters;
  };

  const renderEvaluated = () => {
    // todo, there is a bug in the API that forces us to define a threshold_evaluator to create a
    //   blocklist alert, when fixed this condition can be removed
    if (metric === 'blocklist' || _.isEmpty(threshold_evaluator)) {
      return null;
    }

    const sourceTag =
      metric === 'health_score' ? (
        <Tag className={styles.FirstTag}>{SOURCE_FRIENDLY_NAMES[source]}</Tag>
      ) : (
        ''
      );
    const percentChangeText = source === 'raw' ? '' : 'change ';
    const operatorText = sourceTag
      ? OPERATOR_FRIENDLY_NAMES[operator].toLowerCase()
      : OPERATOR_FRIENDLY_NAMES[operator];
    const { suffix } = getEvaluatorOptions(metric, source);
    const valueTag = (
      <Tag className={styles.Tags}>
        {value}
        {suffix}
      </Tag>
    );
    return (
      <>
        {sourceTag}
        <p className={styles.ValueLabel}>{percentChangeText}</p>
        <p className={styles.ValueLabel}>{operatorText}</p>
        {valueTag}
      </>
    );
  };

  const renderNotify = () => {
    const { emails, ...restChannels } = channels;
    const visibleExtraChannels = extraChannels.filter(({ key }) =>
      restChannels.hasOwnProperty(key),
    );

    return (
      <>
        {emails && emails.length > 0 && (
          <div id="email">
            <p className={styles.ValueLabel}>Email</p>{' '}
            {emails.map(email => (
              <Tag key={email} className={styles.Tags}>
                <span className={styles.TagText}>{email}</span>
              </Tag>
            ))}
          </div>
        )}
        {visibleExtraChannels.map(({ icon: Icon, key, label }) => (
          <div key={key}>
            <p className={styles.ValueLabel}>{label}</p>{' '}
            <Tag className={styles.TagsWithIcon}>
              <Icon className={styles.Icon} />
              <span className={styles.TagText}>{restChannels[key].target}</span>
            </Tag>
          </div>
        ))}
      </>
    );
  };

  const detailsMap = [
    { label: 'Metric:', render: () => <p className={styles.ValueLabel}>{METRICS[metric]}</p> },
    { label: 'Condition:', render: renderEvaluated },
    { label: 'Filtered By:', render: renderFilteredBy },
    { label: 'Notify:', render: renderNotify },
    { label: 'Mute:', render: () => <AlertToggle muted={muted} id={id} /> },
  ];

  const renderAlertDetails = () =>
    detailsMap.map(({ label, render }, i) => {
      const renderedValue = render();

      if (!renderedValue) {
        return null;
      }

      return (
        <SectionComponent key={i} paddingLeft="500" paddingBottom="400">
          <LabelledValue label={label}>{renderedValue}</LabelledValue>
        </SectionComponent>
      );
    });

  return (
    <Panel.LEGACY data-id="alert-details-panel">
      <SectionComponent paddingLeft="500" paddingTop="400" width="100%">
        <Heading as="h3" className={styles.Title}>
          Alert Details
        </Heading>

        {renderPrimaryAreaComponent()}
      </SectionComponent>
      {renderAlertDetails()}
    </Panel.LEGACY>
  );
};
