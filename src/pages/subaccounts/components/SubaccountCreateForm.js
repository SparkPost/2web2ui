import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { Form } from 'src/components/form';
import { ButtonWrapper } from 'src/components';
import { getSubaccountGrants, getInitialSubaccountGrants } from 'src/selectors/api-keys';
import { getIpPools, selectFirstIpPoolId } from 'src/selectors/ipPools';
import { NameField, ApiKeyCheckBox, ApiKeyFields } from './formFields';
import IpPoolSelect from './IpPoolSelect';
import RestrictToIpPoolCheckbox from './RestrictToIpPoolCheckbox';
export class SubaccountCreateForm extends Component {
  render() {
    const {
      handleSubmit,
      pristine,
      showGrants,
      grants,
      submitting,
      createApiKey,
      ipPools,
      restrictedToIpPool,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit} id="subaccount-create-form">
        <Panel.LEGACY.Section>
          <Stack>
            <NameField disabled={submitting} />
            <ApiKeyCheckBox disabled={submitting} createApiKey={createApiKey} />
            <ApiKeyFields
              show={createApiKey}
              showGrants={showGrants}
              grants={grants}
              submitting={submitting}
            />
            {Boolean(ipPools.length) && (
              <Stack>
                <RestrictToIpPoolCheckbox disabled={submitting} />
                {restrictedToIpPool && <IpPoolSelect disabled={submitting} options={ipPools} />}
              </Stack>
            )}
          </Stack>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <ButtonWrapper>
            <Button variant="primary" submit disabled={submitting || pristine}>
              {submitting ? 'Loading...' : 'Create Subaccount'}
            </Button>

            <PageLink
              as={Button}
              variant="secondary"
              to="/account/subaccounts"
              disabled={submitting}
            >
              Cancel
            </PageLink>
          </ButtonWrapper>
        </Panel.LEGACY.Section>
      </Form>
    );
  }
}

const formName = 'SubaccountCreateForm';
const valueSelector = formValueSelector(formName);

const mapStateToProps = state => ({
  grants: getSubaccountGrants(state),
  createApiKey: valueSelector(state, 'createApiKey'),
  showGrants: valueSelector(state, 'grantsRadio') === 'select',
  ipPools: getIpPools(state),
  restrictedToIpPool: valueSelector(state, 'restrictedToIpPool'),
  initialValues: {
    grants: getInitialSubaccountGrants(state),
    grantsRadio: 'all',
    createApiKey: true,
    restrictedToIpPool: false,
    ipPool: selectFirstIpPoolId(state),
  },
});

const SubaccountReduxForm = reduxForm({ form: formName })(SubaccountCreateForm);
export default connect(mapStateToProps, {})(SubaccountReduxForm);
