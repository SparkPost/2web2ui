import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { SendingDomainTypeaheadWrapper, TextFieldWrapper } from 'src/components';
import { Form } from 'src/components/tracking/form';
import AccessControl from 'src/components/auth/AccessControl';
import { required } from 'src/helpers/validation';
import { configFlag } from 'src/helpers/conditions/config';
import { inSPC, inSPCEU } from 'src/config/tenant';
import { hasAccountOptionEnabled } from 'src/helpers/conditions/account';
import { any } from 'src/helpers/conditions';
import { selectCurrentPool } from 'src/selectors/ipPools';
import isDefaultPool from '../helpers/defaultPool';
import { SelectWrapper } from '../../../components/reduxFormWrappers';
import { getIpPools, canEditOverflowPool } from '../../../selectors/ipPools';

export class PoolForm extends Component {
  getOverflowPoolOptions = () => {
    const { pools, pool } = this.props;

    const overflowPools = pools
      .map(currentPool => {
        if (currentPool.auto_warmup_overflow_pool || currentPool.id === pool.id) {
          return null;
        }

        return {
          label: `${currentPool.name} (${currentPool.id})`,
          value: currentPool.id,
        };
      })
      .filter(Boolean); // See: https://stackoverflow.com/a/32906951

    if (inSPC() || inSPCEU()) {
      overflowPools.unshift({
        label: 'Shared Pool',
        value: 'shared pool',
      });
    }

    overflowPools.unshift({ label: 'None', value: '' });

    return overflowPools;
  };

  render() {
    const { isNew, pool, handleSubmit, canEditOverflowPool, submitting, pristine } = this.props;
    const submitText = isNew ? 'Create IP Pool' : 'Update IP Pool';
    const editingDefault = !isNew && isDefaultPool(pool.id);
    const helpText = editingDefault ? "You cannot change the default IP pool's name" : '';

    return (
      <Panel.LEGACY>
        <Form onSubmit={handleSubmit} id={isNew ? 'create-ip-pool-form' : 'update-ip-pool-form'}>
          <Panel.LEGACY.Section>
            <Stack>
              <Field
                name="name"
                component={TextFieldWrapper}
                validate={required}
                label="Pool Name"
                placeholder="My IP Pool"
                disabled={editingDefault || submitting}
                helpText={helpText}
              />

              {!editingDefault && (
                <AccessControl
                  condition={any(
                    hasAccountOptionEnabled('allow_default_signing_domains_for_ip_pools'),
                    configFlag('featureFlags.allow_default_signing_domains_for_ip_pools'),
                  )}
                >
                  <Field
                    name="signing_domain"
                    component={SendingDomainTypeaheadWrapper}
                    label="Default Signing Domain"
                    disabled={submitting}
                  />
                </AccessControl>
              )}

              {!editingDefault && (
                <Field
                  name="auto_warmup_overflow_pool"
                  label="Overflow Pool"
                  component={SelectWrapper}
                  options={this.getOverflowPoolOptions()}
                  helpText="With automatic IP Warmup enabled, selected pool will be used when volume threshold for this pool has been reached."
                  disabled={submitting || (!isNew && !canEditOverflowPool)}
                />
              )}
            </Stack>
          </Panel.LEGACY.Section>

          <Panel.LEGACY.Section>
            <Button submit disabled={submitting || pristine} variant="primary">
              {submitting ? 'Saving' : submitText}
            </Button>
          </Panel.LEGACY.Section>
        </Form>
      </Panel.LEGACY>
    );
  }
}

PoolForm.defaultProps = {
  pool: {},
  pools: [],
};

const mapStateToProps = (state, props) => {
  const pool = selectCurrentPool(state, props);
  return {
    pool,
    pools: getIpPools(state, props),
    canEditOverflowPool: canEditOverflowPool(state, props),
    initialValues: {
      ...pool,
    },
  };
};

const formOptions = {
  form: 'poolForm',
  enableReinitialize: true,
};

const PoolReduxForm = reduxForm(formOptions)(PoolForm);
export default withRouter(connect(mapStateToProps, {})(PoolReduxForm));
