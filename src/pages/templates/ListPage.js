/* eslint-disable max-lines */
import React, { Component } from 'react';
import { Page, ScreenReaderOnly } from 'src/components/matchbox';
import { ApiErrorBanner, Loading, TableCollection } from 'src/components';
import { Templates } from 'src/components/images';
import { Heading } from 'src/components/text';
import { PageLink } from 'src/components/links';
import ActionPopover from 'src/components/actionPopover';
import { resolveTemplateStatus } from 'src/helpers/templates';
import RecentActivity from './components/RecentActivity';
import { LastUpdated, Name, Status } from './components/ListComponents';
import DuplicateTemplateModal from './components/editorActions/DuplicateTemplateModal';
import DeleteTemplateModal from './components/editorActions/DeleteTemplateModal';
import { routeNamespace } from './constants/routes';

export default class ListPage extends Component {
  state = {
    showDeleteModal: false,
    showDuplicateModal: false,
    templateToDelete: null,
    templateToDuplicate: null,
    testDataToDuplicate: null,
  };

  componentDidMount() {
    this.props.listTemplates();
  }

  toggleDeleteModal = template => {
    this.setState({
      showDeleteModal: !this.state.showDeleteModal,
      templateToDelete: template,
    });
  };

  toggleDuplicateModal = template => {
    const { getDraft, getPublished, getTestData } = this.props;
    const isPublished = template.published;

    this.setState({ showDuplicateModal: true });

    if (isPublished) {
      return getPublished(template.id, template.subaccount_id).then(res => {
        this.setState({
          templateToDuplicate: res,
          testDataToDuplicate: getTestData({ id: res.id, mode: 'published' }),
        });
      });
    }

    return getDraft(template.id, template.subaccount_id).then(res => {
      this.setState({
        templateToDuplicate: res,
        testDataToDuplicate: getTestData({ id: res.id, mode: 'draft' }),
      });
    });
  };

  handleDuplicateSuccess = () => {
    const { showAlert, listTemplates } = this.props;
    const template = this.state.templateToDuplicate;

    this.setState({ showDuplicateModal: false });

    showAlert({
      type: 'success',
      message: `Template ${template.name} duplicated`,
    });

    return listTemplates();
  };

  handleDeleteSuccess = () => {
    const { listTemplates, showAlert } = this.props;
    const template = this.state.templateToDelete;

    this.toggleDeleteModal();

    showAlert({
      type: 'success',
      message: `Template ${template.name} deleted`,
    });

    return listTemplates();
  };

  getColumns = () => {
    const { canModify } = this.props;

    const columns = [
      {
        component: Name,
        header: {
          label: 'Template Name',
          sortKey: 'list_name',
        },
        visible: true,
        key: 'list_name',
      },
      {
        component: Status,
        header: {
          label: 'Status',
          sortKey: template => [
            resolveTemplateStatus(template).publishedWithChanges,
            template.published,
          ],
        },
        visible: true,
        key: 'status',
      },
      {
        component: LastUpdated,
        header: {
          label: 'Last Updated',
          sortKey: 'last_update_time',
        },
        visible: true,
        key: 'lastupdated',
      },
      {
        component: template => (
          <ActionPopover
            actions={[
              {
                content: 'Duplicate Template',
                onClick: () => this.toggleDuplicateModal(template),
              },
              {
                content: 'Delete Template',
                onClick: () => this.toggleDeleteModal(template),
              },
            ]}
          />
        ),
        header: {
          width: 20,
        },
        visible: canModify,
        key: 'actions',
      },
    ];

    return columns.filter(col => col.visible);
  };

  renderRow = columns => props =>
    columns.map(({ component: Component, onClick }) => <Component onClick={onClick} {...props} />);

  render() {
    const {
      canModify,
      error,
      listTemplates,
      loading,
      templates,
      isDeletePending,
      isCreatePending,
      isDraftPending,
      isPublishedPending,
    } = this.props;

    if (loading) {
      return <Loading />;
    }

    const columns = this.getColumns();

    return (
      <Page
        primaryAction={
          canModify
            ? { Component: PageLink, content: 'Create Template', to: `${routeNamespace}/create` }
            : undefined
        }
        title="Templates"
        empty={{
          show: !error && templates.length === 0,
          image: Templates,
          title: 'Manage your email templates',
          content: <p>Build, test, preview and send your transmissions.</p>,
        }}
      >
        {error ? (
          <ApiErrorBanner
            message="Sorry, we seem to have had some trouble loading your templates."
            errorDetails={error.message}
            reload={listTemplates}
          />
        ) : (
          <>
            <DeleteTemplateModal
              open={this.state.showDeleteModal}
              onClose={this.toggleDeleteModal}
              template={this.state.templateToDelete}
              deleteTemplate={this.props.deleteTemplate}
              successCallback={this.handleDeleteSuccess}
              isLoading={isDeletePending}
            />

            <DuplicateTemplateModal
              open={this.state.showDuplicateModal}
              onClose={() => this.setState({ showDuplicateModal: false })}
              createTemplate={this.props.createTemplate}
              template={this.state.templateToDuplicate}
              successCallback={this.handleDuplicateSuccess}
              showAlert={this.props.showAlert}
              contentToDuplicate={
                this.state.templateToDuplicate && this.state.templateToDuplicate.content
              }
              testDataToDuplicate={this.state.testDataToDuplicate}
              isPublishedMode={
                this.state.templateToDuplicate && this.state.templateToDuplicate.published
              }
              isLoading={isDraftPending || isPublishedPending || isCreatePending}
            />

            <RecentActivity
              hasActionButtons={canModify}
              templates={templates}
              onToggleDeleteModal={this.toggleDeleteModal}
              onToggleDuplicateModal={this.toggleDuplicateModal}
            />

            <ScreenReaderOnly>
              <Heading as="h2">All Templates</Heading>
            </ScreenReaderOnly>

            <TableCollection
              columns={columns.map(({ header, key }) => ({ ...header, key }))}
              rows={templates}
              getRowData={this.renderRow(columns)}
              pagination
              filterBox={{
                show: true,
                exampleModifiers: ['id', 'name'],
                itemToStringKeys: ['name', 'id', 'subaccount_id'],
              }}
              defaultSortColumn="last_update_time"
              defaultSortDirection="desc"
              saveCsv={true}
            />
          </>
        )}
      </Page>
    );
  }
}
