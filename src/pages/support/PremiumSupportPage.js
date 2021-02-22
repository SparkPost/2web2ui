import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { createTicket } from 'src/actions/support';
import { showAlert } from 'src/actions/globalAlert';
import { PageLink } from 'src/components/links';
import { Button, Page, Panel } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import PremiumSupportFields from './components/PremiumSupportFields';
import { generateMessage } from './helpers/formHelpers';

export class PremiumSupportPage extends Component {
  handleTicketCreate = values =>
    this.props.createTicket({
      message: generateMessage(values),
      issueType: 'Vetting',
      subject: 'AWS Premium Vetting',
    });

  componentDidUpdate(prevProps) {
    const { submitSucceeded, showAlert, history, ticketId, createError } = this.props;

    if (!prevProps.submitSucceeded && submitSucceeded && !createError) {
      history.push('/account/billing');
      return showAlert({
        type: 'success',
        message: `Request Submitted - Ticket # ${ticketId}`,
        autoDismiss: false,
      });
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <Page
        breadcrumbAction={{
          as: PageLink,
          to: '/account/billing',
          content: 'Back to billing',
        }}
      >
        <Panel.LEGACY title="Request Premium Support" sectioned accent>
          <Form onSubmit={handleSubmit(this.handleTicketCreate)}>
            <PremiumSupportFields />
            <Button submit color="orange" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Form>
        </Panel.LEGACY>
      </Page>
    );
  }
}

const formName = 'AwsPremiumSupportForm';
const mapStateToProps = state => ({
  ticketId: state.support.ticketId,
  createError: state.support.createError,
});
const formOptions = { form: formName };
export default connect(mapStateToProps, { createTicket, showAlert })(
  reduxForm(formOptions)(PremiumSupportPage),
);
