import React, { Component } from 'react';
import { Button, Page, Panel } from 'src/components/matchbox';
import { ButtonWrapper, Loading } from 'src/components';
import { Form } from 'src/components/tracking/form';
import { PageLink } from 'src/components/links';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import CreateForm from './components/create/CreateForm';
import { routeNamespace } from './constants/routes';

export default class CreatePage extends Component {
  componentDidMount() {
    this.props.listDomains();
  }

  handleCreate = values => {
    const { createTemplate, history, subaccountId, showAlert } = this.props;
    const formData = {
      ...values,
      content: {
        ...values.content,
        text: '', // add some content to avoid api validation error
      },
    };
    const templateId = values.id;
    const testDataBase = {
      options: {},
      substitution_data: {},
      metadata: {},
    };
    createTemplate({
      ...formData,
      sharedWithSubaccounts: formData.assignTo === 'shared',
      parsedTestData: testDataBase,
    }).then(() => {
      showAlert({ type: 'success', message: 'Template Created.' });
      history.push(
        `/${routeNamespace}/edit/${templateId}/draft/content${setSubaccountQuery(subaccountId)}`,
      );
    });
  };

  render() {
    const { handleSubmit, submitting, pristine, valid, loading, formName } = this.props;

    if (loading) {
      return <Loading />;
    }

    const backAction = {
      content: 'View All Templates',
      Component: PageLink,
      to: `/${routeNamespace}`,
    };

    return (
      <Page breadcrumbAction={backAction} title="Create Template">
        <Form onSubmit={handleSubmit(this.handleCreate)} id="templates-create-form">
          <Panel.LEGACY>
            <Panel.LEGACY.Section>
              <CreateForm formName={formName} />
            </Panel.LEGACY.Section>

            <Panel.LEGACY.Section>
              <ButtonWrapper>
                <Button type="submit" variant="primary" disabled={submitting || pristine || !valid}>
                  Create and View
                </Button>

                <PageLink as={Button} variant="secondary" to={`/${routeNamespace}`}>
                  Cancel
                </PageLink>
              </ButtonWrapper>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        </Form>
      </Page>
    );
  }
}
