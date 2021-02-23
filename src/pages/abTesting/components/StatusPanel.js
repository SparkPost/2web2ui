import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import {
  selectLatestVersionNumberFromParams,
  selectIdAndVersionFromParams,
} from 'src/selectors/abTesting';
import { LabelledValue, Subaccount } from 'src/components';
import { PageLink } from 'src/components/links';
import { ActionList, Panel, Popover } from 'src/components/matchbox';
import { OGOnlyWrapper } from 'src/components/hibana';
import { ExpandMore } from '@sparkpost/matchbox-icons';
import StatusTag from './StatusTag';
import _ from 'lodash';

// todo, this component is rendered as a panel action content and panel actions are buttons, this
//   doesn't work to have the Popover inside the Button
const VersionSelector = ({ current, latest, id, subaccountId }) => {
  const actions = _.times(latest, i => ({
    content: `View Version ${i + 1}`,
    to: `/ab-testing/${id}/${i + 1}${setSubaccountQuery(subaccountId)}`,
    as: PageLink,
    visible: i + 1 !== current,
  })).reverse();

  return (
    <Popover
      id="popover-version-selector"
      left
      trigger={
        <Fragment>
          Version <span>{current}</span> <ExpandMore />
        </Fragment>
      }
    >
      <ActionList actions={actions} />
    </Popover>
  );
};

export const StatusPanel = ({ test, version, id, subaccountId, latest, subaccountName }) => {
  let panelActions = null;

  if (latest > 1) {
    panelActions = [
      {
        content: (
          <VersionSelector current={version} id={id} latest={latest} subaccountId={subaccountId} />
        ),
        color: 'orange',
        'aria-controls': 'popover-version-selector',
      },
    ];
  }

  return (
    <OGOnlyWrapper as={Panel.LEGACY}>
      <Panel.LEGACY.Section actions={panelActions}>
        <LabelledValue label="Status">
          <StatusTag status={test.status} />
        </LabelledValue>
        <LabelledValue label="Test ID" value={id} />
        {!!subaccountId && (
          <LabelledValue label="Subaccount">
            <Subaccount id={subaccountId} name={subaccountName} shrinkLength={12} />
          </LabelledValue>
        )}
      </Panel.LEGACY.Section>
    </OGOnlyWrapper>
  );
};

StatusPanel.displayName = 'StatusPanel';

const mapStateToProps = (state, props) => ({
  latest: selectLatestVersionNumberFromParams(state, props),
  ...selectIdAndVersionFromParams(state, props),
});
export default withRouter(connect(mapStateToProps, {})(StatusPanel));
