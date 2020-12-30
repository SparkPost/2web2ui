import React, { Component } from 'react';
// Components
import { Page } from 'src/components/matchbox';
import { ApiErrorBanner, DeleteModal, ConfirmationModal } from 'src/components';
import { Setup } from 'src/components/images';
import { PageLink } from 'src/components/links';
import TestCollection from './components/TestCollection';
import InfoBanner from './components/InfoBanner';
import AbTestEmptyState from './components/AbTestEmptyState';

export class ListPage extends Component {
  state = {
    showDeleteModal: false,
    showCancelModal: false,
    testToDelete: {},
    testToCancel: {},
    isFirstRender: true, //this is set to display loading on the first render
  };

  componentDidMount() {
    this.setState({ isFirstRender: false });
    this.props.listAbTests();
  }

  toggleDelete = (id, subaccount_id) => {
    this.setState({
      showDeleteModal: !this.state.showDeleteModal,
      testToDelete: { id, subaccountId: subaccount_id },
    });
  };

  handleDelete = () => {
    const { id, subaccountId } = this.state.testToDelete;

    return this.props.deleteAbTest({ id, subaccountId }).then(() => {
      this.props.showAlert({ type: 'success', message: 'Test deleted' });
      this.toggleDelete();
    });
  };

  toggleCancel = (id, subaccount_id) => {
    this.setState({
      showCancelModal: !this.state.showCancelModal,
      testToCancel: { id, subaccountId: subaccount_id },
    });
  };

  handleCancel = () => {
    const { id, subaccountId } = this.state.testToCancel;

    return this.props.cancelAbTest({ id, subaccountId }).then(() => {
      this.props.showAlert({ type: 'success', message: 'Test cancelled' });
      this.toggleCancel();
    });
  };

  renderError() {
    const { error, listAbTests } = this.props;
    return (
      <ApiErrorBanner
        message="Sorry, we seem to have had some trouble loading your A/B tests."
        errorDetails={error.message}
        reload={listAbTests}
      />
    );
  }

  renderCollection() {
    const { abTests } = this.props;
    return (
      <TestCollection
        abTests={abTests}
        toggleCancel={this.toggleCancel}
        toggleDelete={this.toggleDelete}
      />
    );
  }

  render() {
    const { loading, error, abTests, deletePending, cancelPending } = this.props;

    return (
      <Page
        title="A/B Testing"
        primaryAction={{
          content: 'Create a New A/B Test',
          to: '/ab-testing/create',
          component: PageLink,
        }}
        empty={{
          show: !error && abTests.length === 0,
          image: Setup,
          title: 'Create an A/B test',
          content: <p>Create and run A/B tests to boost your engagement.</p>,
        }}
        hibanaEmptyStateComponent={AbTestEmptyState}
        loading={loading || this.state.isFirstRender}
      >
        {this.props.isEmptyStateEnabled && this.props.isHibanaEnabled && <InfoBanner />}
        {error ? this.renderError() : this.renderCollection()}
        <DeleteModal
          open={this.state.showDeleteModal}
          title="Are you sure you want to delete this test?"
          content={
            <p>
              The test and all associated versions will be immediately and permanently removed. This
              cannot be undone.
            </p>
          }
          onDelete={this.handleDelete}
          onCancel={this.toggleDelete}
          isPending={deletePending}
        />
        <ConfirmationModal
          open={this.state.showCancelModal}
          title="Are you sure you want to cancel this test?"
          content={
            <p>
              The test will be cancelled and all further messages will be delivered to the default
              template.
            </p>
          }
          onConfirm={this.handleCancel}
          onCancel={this.toggleCancel}
          isPending={cancelPending}
          confirmVerb="OK"
        />
      </Page>
    );
  }
}
