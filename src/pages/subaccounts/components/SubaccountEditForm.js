import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { tokens } from '@sparkpost/design-tokens-hibana';
import { Box, Button, Panel, Stack } from 'src/components/matchbox';
import { ButtonWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { getIpPools } from 'src/selectors/ipPools';
import { selectFirstIpPoolId } from 'src/selectors/ipPools';
import { NameField, StatusSelect } from './formFields';
import IpPoolSelect from './IpPoolSelect';
import RestrictToIpPoolCheckbox from './RestrictToIpPoolCheckbox';

export class SubaccountEditForm extends Component {
  render() {
    const {
      handleSubmit,
      pristine,
      submitting,
      ipPools,
      compliance,
      reset,
      restrictedToIpPool,
    } = this.props;

    return (
      <Form onSubmit={handleSubmit} id="subaccount-edit-form">
        <Panel.LEGACY.Section>
          <Stack>
            <Box maxWidth={tokens.sizing_1200}>
              <NameField disabled={submitting || compliance} />
            </Box>

            <Box maxWidth={tokens.sizing_1200}>
              <StatusSelect disabled={submitting || compliance} compliance={compliance} />
            </Box>

            {Boolean(ipPools.length) && (
              <Stack>
                <RestrictToIpPoolCheckbox disabled={submitting || compliance} />
                {restrictedToIpPool && (
                  <IpPoolSelect disabled={submitting || compliance} options={ipPools} />
                )}
              </Stack>
            )}
          </Stack>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <ButtonWrapper>
            <Button variant="primary" submit disabled={pristine || submitting || compliance}>
              {submitting ? 'Updating...' : 'Update Subaccount'}
            </Button>
            <Button variant="secondary" disabled={pristine || submitting} onClick={reset}>
              Cancel
            </Button>
          </ButtonWrapper>
        </Panel.LEGACY.Section>
      </Form>
    );
  }
}

const formName = 'SubaccountEditForm';
const valueSelector = formValueSelector(formName);

const mapStateToProps = (state, { subaccount }) => {
  const { compliance, ip_pool, name, status } = subaccount;

  return {
    compliance,
    ipPools: getIpPools(state),
    restrictedToIpPool: valueSelector(state, 'restrictedToIpPool'),
    initialValues: {
      ipPool: ip_pool || selectFirstIpPoolId(state),
      name,
      restrictedToIpPool: Boolean(ip_pool),
      status: compliance ? `${status} by SparkPost` : status,
    },
  };
};

const SubaccountEditReduxForm = reduxForm({ form: formName })(SubaccountEditForm);
export default connect(mapStateToProps, {})(SubaccountEditReduxForm);
