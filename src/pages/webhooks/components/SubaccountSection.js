import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import PropTypes from 'prop-types';
import { RadioGroup, SubaccountTypeaheadWrapper, TextFieldWrapper } from 'src/components';
import { Stack } from 'src/components/matchbox';
import { required } from 'src/helpers/validation';

/**
 * Component produces the follow redux form fields
 * If newWebhook
 * - assignTo 'master' | 'all' | 'subaccount'
 * - subaccount if assignTo === 'subaccount'
 *
 * If !newWebhook
 * - subaccount TextField | typeahead (disabled)
 */
export class SubaccountSection extends Component {
  componentDidUpdate(prevProps) {
    const { assignTo, formName, change } = this.props;

    // Clear subaccount value if switching away from subaccount
    if (assignTo !== 'subaccount' && prevProps.assignTo === 'subaccount') {
      change(formName, 'subaccount', null);
    }
  }

  renderCreate() {
    const { assignTo, disabled } = this.props;

    const createOptions = [
      { label: 'Primary and all subaccounts', value: 'all', disabled },
      { label: 'Primary account only', value: 'master', disabled },
      { label: 'Single Subaccount', value: 'subaccount', disabled },
    ];

    const typeahead =
      assignTo === 'subaccount' ? (
        <Field name="subaccount" component={SubaccountTypeaheadWrapper} validate={required} />
      ) : null;

    return (
      <Stack>
        <Field
          component={RadioGroup}
          name="assignTo"
          label="Receive events from"
          options={createOptions}
        />
        {typeahead}
      </Stack>
    );
  }

  renderEdit() {
    const { subaccount } = this.props;
    let component = SubaccountTypeaheadWrapper;

    // On 'primary only' or 'primary and all' webhooks
    if (typeof subaccount === 'string') {
      component = TextFieldWrapper;
    }

    return (
      <Field
        component={component}
        name="subaccount"
        label="Receive events from"
        helpText="This assignment is permanent."
        disabled
      />
    );
  }

  render() {
    return this.props.newWebhook ? this.renderCreate() : this.renderEdit();
  }
}

SubaccountSection.propTypes = {
  newWebhook: PropTypes.bool,
  assignTo: PropTypes.oneOf(['master', 'all', 'subaccount']),
  change: PropTypes.func,
};

const mapStateToProps = (state, props) => {
  const selector = formValueSelector(props.formName);
  return {
    assignTo: selector(state, 'assignTo'),
    subaccount: selector(state, 'subaccount'),
  };
};

export default connect(mapStateToProps, { change })(SubaccountSection);
