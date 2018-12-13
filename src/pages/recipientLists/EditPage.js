import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { showAlert } from 'src/actions/globalAlert';
import { Page, Grid, Button } from '@sparkpost/matchbox';

import {
  getRecipientList,
  updateRecipientList,
  deleteRecipientList,
  validateRecipientList,
  filterRecipientList
} from 'src/actions/recipientLists';

import { Loading, DeleteModal } from 'src/components';

import RecipientListForm from './components/RecipientListForm';
import ValidationStatusPanel from './components/ValidationStatusPanel';

export class EditPage extends Component {
  state = {
    showDelete: false,
    complete: false,
    INVALID_DOMAIN: false,
    INVALID_EMAIL: true,
    UNDELIVERABLE: true,
    DISPOSABLE_DOMAIN: true,
    ROLE_BASED_EMAIL: true
  };

  startValidation = () => {
    const { validateRecipientList, current } = this.props;
    validateRecipientList(current.id);
  }

  toggleDelete = () => this.setState({ showDelete: !this.state.showDelete });

  deleteRecipientList = () => {
    const { current, deleteRecipientList, showAlert, history } = this.props;

    return deleteRecipientList(current.id).then(() => {
      showAlert({
        type: 'success',
        message: 'Deleted recipient list'
      });
      history.push('/lists/recipient-lists');
    });
  };

  updateRecipientList = (values) => {
    const { updateRecipientList, showAlert, history } = this.props;

    return updateRecipientList(values).then(() => {
      showAlert({
        type: 'success',
        message: 'Updated recipient list'
      });
      history.push('/lists/recipient-lists');
    });
  };

  componentDidMount() {
    const {
      match: { params: { id }},
      getRecipientList,
      history
    } = this.props;

    return getRecipientList(id).catch((err) => {
      history.push('/lists/recipient-lists');
    });
  }

  render() {
    const { loading, listValidatingPending, current = {}, filterRecipientList } = this.props;

    const pendingId = localStorage.getItem('rl_id');

    if (loading) {
      return <Loading />;
    }

    return <Page
      title='Edit Recipient List'
      primaryArea={(
        <span>
          <Button flat onClick={this.toggleDelete}>Delete</Button>
          <Button onClick={this.startValidation} disabled={listValidatingPending}>Validate List</Button>
        </span>
      )}
      breadcrumbAction={{
        content: 'Recipient Lists',
        Component: Link,
        to: '/lists/recipient-lists' }}>
      <Grid>
        <Grid.Column>
          <RecipientListForm editMode={true} onSubmit={this.updateRecipientList} />
        </Grid.Column>
        {current && current.id === pendingId || true &&
          <Grid.Column xs={12} md={4} lg={5}>
            <ValidationStatusPanel filterRecipientList={filterRecipientList} id={current.id}/>
          </Grid.Column>
        }
      </Grid>

      <DeleteModal
        open={this.state.showDelete}
        title='Are you sure you want to delete this recipient list?'
        content={<p>The recipient list will be immediately and permanently removed. This cannot be undone.</p>}
        onCancel={this.toggleDelete}
        onDelete={this.deleteRecipientList}
      />
    </Page>;
  }
}

const mapStateToProps = (state) => ({
  current: state.recipientLists.current,
  loading: state.recipientLists.currentLoading,
  list: state.recipientLists.list,
  error: state.recipientLists.error,
  listValidatingPending: state.recipientLists.listValidatingPending
});

const mapDispatchToProps = {
  getRecipientList,
  updateRecipientList,
  deleteRecipientList,
  showAlert,
  validateRecipientList,
  filterRecipientList
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditPage));
