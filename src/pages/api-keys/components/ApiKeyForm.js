import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import {
  RadioGroup,
  TextFieldWrapper,
  SubaccountTypeaheadWrapper,
} from 'src/components/reduxFormWrappers';
import {
  getGrants,
  getSubaccountGrants,
  getIsNew,
  getInitialGrantsRadio,
  getInitialValues,
} from 'src/selectors/api-keys';
import { selectSubaccountFromQuery } from 'src/selectors/subaccounts';
import validIpList from '../helpers/validIpList';
import { required } from 'src/helpers/validation';
import GrantsCheckboxes from 'src/components/grantBoxes/GrantsCheckboxes';

const formName = 'apiKeyForm';

export class ApiKeyForm extends Component {
  get availableGrants() {
    return this.props.subaccount ? this.props.subaccountGrants : this.props.grants;
  }

  onSubmit = ({ grants = {}, grantsRadio, label, subaccount, validIps = '' }) => {
    const availableGrantKeys = Object.keys(this.availableGrants);
    // extracts all checked grants and returns array of all checked ['grant1', 'grant2']
    const checkedGrantKeys = _.reduce(
      grants,
      (result, checked, key) => (checked ? [...result, key] : result),
      [],
    );

    return this.props.onSubmit({
      label,
      grants:
        grantsRadio === 'select'
          ? _.intersection(availableGrantKeys, checkedGrantKeys)
          : availableGrantKeys,
      subaccount,
      validIps: _.trim(validIps) !== '' ? validIps.split(',').map(_.trim) : undefined,
    });
  };

  getGrantOptions() {
    const { isReadOnly } = this.props;

    return [
      { value: 'all', label: 'All', disabled: isReadOnly },
      { value: 'select', label: 'Select', disabled: isReadOnly },
    ];
  }

  render() {
    const { handleSubmit, isNew, pristine, showGrants, submitting, isReadOnly } = this.props;
    const submitText = isNew ? 'Create API Key' : 'Update API Key';

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)}>
        <Panel.LEGACY.Section>
          <Stack>
            <Field
              name="label"
              component={TextFieldWrapper}
              validate={required}
              label="API Key Name"
              disabled={isReadOnly}
            />
            <Field
              name="subaccount"
              helpText={
                isReadOnly
                  ? ''
                  : 'This assignment is permanent. Leave blank to assign to primary account.'
              }
              component={SubaccountTypeaheadWrapper}
              disabled={!isNew}
            />
          </Stack>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <Stack>
            <Field
              name="grantsRadio"
              component={RadioGroup}
              label="API Permissions"
              options={this.getGrantOptions()}
            />
            <GrantsCheckboxes
              grants={this.availableGrants}
              show={showGrants}
              disabled={isReadOnly}
            />
            <Field
              name="validIps"
              component={TextFieldWrapper}
              label="Allowed IPs"
              helpText={
                isReadOnly
                  ? ''
                  : 'Leaving the field blank will allow access by valid API keys from any IP address.'
              }
              placeholder={isReadOnly ? '' : '10.20.30.40, 10.20.30.0/24'}
              validate={validIpList}
              disabled={isReadOnly}
            />
          </Stack>
        </Panel.LEGACY.Section>
        {!isReadOnly && (
          <Panel.LEGACY.Section>
            <Button submit variant="primary" disabled={submitting || pristine}>
              {submitting ? 'Loading...' : submitText}
            </Button>
          </Panel.LEGACY.Section>
        )}
      </Form>
    );
  }
}

const valueSelector = formValueSelector(formName);
const mapStateToProps = (state, props) => ({
  grants: getGrants(state),
  subaccountGrants: getSubaccountGrants(state),
  subaccount: valueSelector(state, 'subaccount'),
  showGrants: valueSelector(state, 'grantsRadio') === 'select',
  isNew: getIsNew(state, props),
  initialValues: {
    grantsRadio: getInitialGrantsRadio(state, props),
    subaccount: selectSubaccountFromQuery(state, props),
    ...getInitialValues(state, props),
  },
});

const formOptions = {
  form: formName,
  enableReinitialize: true,
};
export default withRouter(connect(mapStateToProps, {})(reduxForm(formOptions)(ApiKeyForm)));
