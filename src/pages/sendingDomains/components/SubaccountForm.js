import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formValueSelector, change, Field } from 'redux-form';
import PropTypes from 'prop-types';
import { Box } from 'src/components/matchbox';
import { RadioGroup, SubaccountTypeaheadWrapper } from 'src/components';
import { required } from 'src/helpers/validation';

const createOptions = [
  { label: 'Assign to Primary Account', value: 'master' },
  { label: 'Share with all Subaccounts', value: 'shared' },
  { label: 'Assign to Subaccount', value: 'subaccount' },
];

/**
 * Component produces the follow redux form fields
 * - assignTo 'master' | 'shared' | 'subaccount'
 * - subaccount if assignTo === 'subaccount'
 */
export class SubaccountForm extends Component {
  componentDidUpdate(prevProps) {
    const { assignTo, formName, change } = this.props;

    // Clear subaccount value if switching away from subaccount
    if (assignTo !== 'subaccount' && prevProps.assignTo === 'subaccount') {
      change(formName, 'subaccount', null);
    }
  }

  render() {
    const { assignTo } = this.props;

    const typeahead =
      assignTo === 'subaccount' ? (
        <Box ml="500">
          <Field name="subaccount" component={SubaccountTypeaheadWrapper} validate={required} />
        </Box>
      ) : null;

    return (
      <div>
        <Field
          component={RadioGroup}
          name="assignTo"
          label="Subaccount Assignment"
          options={createOptions}
        />
        {typeahead}
      </div>
    );
  }
}

SubaccountForm.propTypes = {
  assignTo: PropTypes.oneOf(['master', 'shared', 'subaccount', null]),
  change: PropTypes.func,
};

const mapStateToProps = (state, props) => {
  const selector = formValueSelector(props.formName);
  return { assignTo: selector(state, 'assignTo') };
};

export default connect(mapStateToProps, { change })(SubaccountForm);
