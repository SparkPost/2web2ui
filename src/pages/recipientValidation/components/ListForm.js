import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Panel } from '@sparkpost/matchbox';
import { maxFileSize } from 'src/helpers/validation';
import FileUploadWrapper from './FileUploadWrapper';
import { uploadList } from 'src/actions/recipientValidation';
import { showAlert } from 'src/actions/globalAlert';
import config from 'src/config';

const formName = 'recipientValidationListForm';

export class ListForm extends Component {

  handleUpload = (fields) => {
    const { uploadList, showAlert, reset } = this.props;
    const form_data = new FormData();

    form_data.append('myupload', fields.csv);
    return uploadList(form_data).then(() => {
      showAlert({ type: 'success', message: 'Recipients Uploaded' });
      reset(formName);
    });
  }

  componentDidUpdate(prevProps) {
    const { file, handleSubmit } = this.props;

    // Redux form validation does not run in the same render cycle after Field's onChange,
    // thus checking props.valid would not work here *shakes fist*
    const valid = !maxFileSize(config.maxRecipVerifUploadSizeBytes)(file);

    if (file && valid) {
      handleSubmit(this.handleUpload)();
    }
  }

  render() {
    const fileTypes = ['.txt','.csv'];
    const uploadValidators = maxFileSize(config.maxRecipVerifUploadSizeBytes);

    return (
      <Panel.Section>
        <form>
          <Field
            component={FileUploadWrapper}
            fileTypes={fileTypes}
            header='Drag and drop your list here'
            name='csv'
            validate={uploadValidators}
            handleSubmit={this.handleSubmit}
          />
        </form>
      </Panel.Section>
    );
  }
}

const WrappedForm = reduxForm({ form: formName })(ListForm);

export default connect((state) => {
  const selector = formValueSelector(formName);
  return {
    file: selector(state, 'csv')
  };
}, { uploadList, showAlert })(WrappedForm);
