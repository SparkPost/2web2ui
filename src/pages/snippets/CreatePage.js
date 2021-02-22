import React from 'react';
import { Field } from 'redux-form';
import { Grid, Button, Page, Panel, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import ContentEditor from 'src/components/contentEditor';
import { ExternalLink, PageLink } from 'src/components/links';
import Loading from 'src/components/loading';
import TextFieldWrapper from 'src/components/reduxFormWrappers/TextFieldWrapper';
import SubaccountSection from 'src/components/subaccountSection';
import { LINKS } from 'src/constants';
import { slugify } from 'src/helpers/string';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import { maxLength, required, slug } from 'src/helpers/validation';

export default class CreatePage extends React.Component {
  componentDidMount() {
    const { snippetToDuplicate, getSnippet } = this.props;

    if (snippetToDuplicate) {
      getSnippet(snippetToDuplicate);
    }
  }

  componentWillUnmount() {
    this.props.clearSnippet(); // loaded for duplicate
  }

  fillIdField = event => {
    this.props.change('id', slugify(event.target.value));
  };

  submitSnippet = ({ assignTo, content: { html, text, amp_html } = {}, id, name, subaccount }) => {
    // must handle when subaccount is set to null by SubaccountSection
    const subaccountId = subaccount ? subaccount.id : undefined;
    const { createSnippet, history } = this.props;

    return createSnippet({
      html,
      id,
      name,
      sharedWithSubaccounts: assignTo === 'shared',
      subaccountId,
      text,
      amp_html,
    }).then(() => {
      history.push(`/snippets/edit/${id}${setSubaccountQuery(subaccountId)}`);
    });
  };

  render() {
    const { snippetToDuplicate, handleSubmit, hasSubaccounts, loading, submitting } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <Page
        title={snippetToDuplicate ? 'Duplicate Snippet' : 'Create a Snippet'}
        breadcrumbAction={{ Component: PageLink, content: 'View All Snippets', to: '/snippets' }}
        primaryAction={{
          Component: Button,
          content: 'Create Snippet',
          onClick: handleSubmit(this.submitSnippet),
        }}
      >
        <Form onSubmit={this.submitSnippet}>
          <Grid>
            <Grid.Column xs={12} lg={4}>
              <Panel.LEGACY sectioned>
                <Stack>
                  <Field
                    name="name"
                    component={TextFieldWrapper}
                    disabled={submitting}
                    label="Snippet Name"
                    onChange={this.fillIdField}
                    validate={[required, maxLength(64)]}
                    helpText={
                      <ExternalLink to={LINKS.SNIPPET_API_DOCS}>
                        Learn more about Snippets
                      </ExternalLink>
                    }
                  />
                  <Field
                    name="id"
                    component={TextFieldWrapper}
                    disabled={submitting}
                    helpText="This is a unique identifier to reference your snippet in a template."
                    label="Snippet ID"
                    validate={[required, slug, maxLength(64)]}
                  />
                  {hasSubaccounts && <SubaccountSection newTemplate={true} disabled={submitting} />}
                </Stack>
              </Panel.LEGACY>
            </Grid.Column>
            <Grid.Column xs={12} lg={8}>
              <ContentEditor contentOnly={true} />
            </Grid.Column>
          </Grid>
        </Form>
      </Page>
    );
  }
}
