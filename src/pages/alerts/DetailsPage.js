import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Delete, ContentCopy } from '@sparkpost/matchbox-icons';
import { DeleteModal, Loading } from 'src/components';
import { PageLink } from 'src/components/links';
import { TranslatableText } from 'src/components/text';
import { Button, Page } from 'src/components/matchbox';
import withAlert from './containers/DetailsPage.container';
import { AlertDetails } from './components/AlertDetails';
import AlertIncidents from './components/AlertIncidents';
import RedirectAndAlert from 'src/components/globalAlert/RedirectAndAlert';
import { useHibana } from 'src/context/HibanaContext';
import styles from './DetailsPage.module.scss';

// note, this is one off that shouldn't be reused
// todo, consider removing this wrapper and moving these buttons to AlertDetails as Panel.Action's when removing OG
const FloatingButtons = styled.div`
  float: right;
  margin-right: ${props => props.theme.space['500']};
`;

export class DetailsPageComponent extends Component {
  state = {
    isDeleteModalOpen: false,
  };

  componentDidMount() {
    const { id, getAlert, hasSubaccounts, listSubaccounts, getIncidents } = this.props;

    getAlert({ id });
    getIncidents({ id });

    if (hasSubaccounts) {
      listSubaccounts();
    }
  }

  closeDeleteModal = () => {
    this.setState({ isDeleteModalOpen: false });
  };

  openDeleteModal = () => {
    this.setState({ isDeleteModalOpen: true });
  };

  handleDelete = () => {
    const { id, deleteAlert, showUIAlert, alert, history } = this.props;
    const { name } = alert;

    return deleteAlert({ id }).then(() => {
      this.closeDeleteModal();
      history.push('/alerts');
      showUIAlert({ type: 'success', message: `Alert: ${name} Deleted` });
    });
  };

  subaccountIdToString = id => {
    const { subaccounts } = this.props;
    if (id === -1) {
      return 'Primary and all subaccounts';
    }
    if (id === 0) {
      return 'Primary account';
    }
    const matchedSubaccount = subaccounts.find(subaccount => subaccount.id === id) || {};
    return `${matchedSubaccount.name} (${matchedSubaccount.id})`;
  };

  DuplicateDeleteAction = () => {
    const { id, isHibanaEnabled } = this.props;
    const Wrapper = isHibanaEnabled ? FloatingButtons : Fragment;

    return (
      <Wrapper>
        <PageLink as={Button} flat to={`/alerts/create/${id}`}>
          <TranslatableText>Duplicate</TranslatableText>

          <ContentCopy className={styles.Icon} />
        </PageLink>

        <Button flat onClick={this.openDeleteModal}>
          <TranslatableText>Delete</TranslatableText>

          <Delete className={styles.Icon} />
        </Button>
      </Wrapper>
    );
  };

  EditAction = () => (
    <PageLink
      as={Button}
      to={`/alerts/edit/${this.props.id}`}
      variant="primary"
      className={styles.Actions}
    >
      Edit Alert
    </PageLink>
  );

  render() {
    const {
      loading,
      deletePending,
      alert = {},
      error,
      id,
      hasSubaccounts,
      incidents,
      isHibanaEnabled,
    } = this.props;
    const { isDeleteModalOpen } = this.state;
    const { name } = alert;

    if (loading) {
      return <Loading />;
    }

    if (error) {
      return <RedirectAndAlert to="/alerts" alert={{ type: 'error', message: error.message }} />;
    }

    const renderPagePrimaryArea = isHibanaEnabled ? this.EditAction : this.DuplicateDeleteAction;

    const renderComponentPrimaryArea = isHibanaEnabled
      ? this.DuplicateDeleteAction
      : this.EditAction;

    return (
      <Page
        title={name || 'Alert'}
        breadcrumbAction={{ content: 'Back to Alerts', to: '/alerts', as: PageLink }}
        primaryArea={renderPagePrimaryArea()}
      >
        {!_.isEmpty(alert) && (
          <AlertDetails
            alert={alert}
            id={id}
            subaccountIdToString={this.subaccountIdToString}
            hasSubaccounts={hasSubaccounts}
            renderPrimaryAreaComponent={renderComponentPrimaryArea}
          />
        )}
        {alert.metric !== 'blocklist' && (
          <AlertIncidents
            alert={alert}
            incidents={incidents}
            subaccountIdToString={this.subaccountIdToString}
          />
        )}
        <DeleteModal
          open={isDeleteModalOpen}
          title="Are you sure you want to delete this alert?"
          content={
            <p>
              <TranslatableText>The alert "</TranslatableText>
              <strong>{name}</strong>
              <TranslatableText>
                " will be permanently removed. This cannot be undone.
              </TranslatableText>
            </p>
          }
          onDelete={this.handleDelete}
          onCancel={this.closeDeleteModal}
          isPending={deletePending}
        />
      </Page>
    );
  }
}

const DetailsPage = props => {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  return <DetailsPageComponent isHibanaEnabled={isHibanaEnabled} {...props} />;
};

export default withAlert(DetailsPage);
