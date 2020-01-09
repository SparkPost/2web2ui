/* eslint-disable no-restricted-syntax */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScreenReaderOnly, Page, Panel, Button, Grid, UnstyledLink } from '@sparkpost/matchbox';
import styles from './SingleResult.module.scss';
import { withRouter, Link } from 'react-router-dom';
import CodeBlock from './components/CodeBlock';
import {
  ROLE_TOOLTIP,
  DISPOSABLE_TOOLTIP,
  FREE_TOOLTIP,
  DID_YOU_MEAN_TOOLTIP,
  RESULT_DESCRIPTIONS,
} from './constants';
import { singleAddress } from 'src/actions/recipientValidation';
import { showAlert } from 'src/actions/globalAlert';
import Loading from 'src/components/loading';
import Tooltip from './components/Tooltip';

const SINGLE_RV_LINK = '/recipient-validation/single';

export class SingleResult extends Component {
  componentDidMount() {
    const { address, singleAddress, history, showAlert } = this.props;

    singleAddress(address).catch(({ message }) => {
      showAlert({ message, type: 'error' });
      history.push(SINGLE_RV_LINK);
    });
  }

  resultTable = () => {
    const { singleResults = {} } = this.props;
    const { is_role, is_disposable, is_free, did_you_mean } = singleResults;

    return (
      <div className={styles.ResultsTable}>
        {did_you_mean && (
          <div className={styles.ResultsTableRow}>
            <span className={styles.ResultsTableKey}>
              Did you mean <Tooltip content={DID_YOU_MEAN_TOOLTIP} />
            </span>

            <span>{did_you_mean}</span>
          </div>
        )}

        <div className={styles.ResultsTableRow}>
          <span className={styles.ResultsTableKey}>
            Role-based <Tooltip content={ROLE_TOOLTIP} />
          </span>

          <ValueResponse value={is_role} />
        </div>

        <div className={styles.ResultsTableRow}>
          <span className={styles.ResultsTableKey}>
            Disposable <Tooltip content={DISPOSABLE_TOOLTIP} />
          </span>

          <ValueResponse value={is_disposable} />
        </div>

        <div className={styles.ResultsTableRow}>
          <span className={styles.ResultsTableKey}>
            Free <Tooltip content={FREE_TOOLTIP} />
          </span>

          <ValueResponse value={is_free} />
        </div>
      </div>
    );
  };

  render() {
    const { singleResults = {}, loading } = this.props;

    if (!singleResults || loading) {
      return <Loading />;
    }

    const { email, result } = singleResults;

    return (
      <Page
        title="Recipient Validation"
        subtitle="Results"
        breadcrumbAction={{ content: 'Back', to: SINGLE_RV_LINK, component: Link }}
      >
        <Panel>
          <Grid>
            <Grid.Column xs={12} md={7}>
              <div className={styles.SubSection}>
                <h2 className={styles.Heading}>{email}</h2>

                <Result>{result}</Result>

                <p className={styles.ResultDescription}>{RESULT_DESCRIPTIONS[result]}</p>

                {this.resultTable()}

                <Button component={Link} color="orange" to={SINGLE_RV_LINK}>
                  Validate Another
                </Button>
              </div>
            </Grid.Column>

            <Grid.Column xs={12} md={5}>
              <CodeBlock preformatted>
                <div className={styles.SubSection}>
                  <h3 className={styles.ApiHeading}>Raw API Response</h3>

                  <p className={styles.ApiDescription}>
                    <WhiteText>
                      The following raw API results outline the reasons for your email's validation
                      status. Learn how to&nbsp;
                      <UnstyledLink
                        external
                        to="https://developers.sparkpost.com/api/recipient-validation/"
                        className={styles.ApiDescriptionLink}
                      >
                        integrate with Recipient Validation
                      </UnstyledLink>
                      &nbsp;in your product.
                    </WhiteText>
                  </p>

                  <ResultCodeBlock data={singleResults} />
                </div>
              </CodeBlock>
            </Grid.Column>
          </Grid>
        </Panel>
      </Page>
    );
  }
}

function TabCharacter() {
  return <span className={styles.TabCharacter} />;
}

function WhiteText({ children }) {
  return <span className={styles.WhiteText}>{children}</span>;
}

function ValueResponse({ value }) {
  return <span data-id="validation-result-value">{value ? 'Yes' : 'No'}</span>;
}

function Result({ children }) {
  return (
    <div className={styles.Result}>
      <ScreenReaderOnly>Status:</ScreenReaderOnly>

      <div className={styles.ResultValue} data-id="validation-result-status">
        {children}
      </div>
    </div>
  );
}

function ResultCodeBlock({ data }) {
  const { result, valid, reason, is_role, is_disposable, is_free, did_you_mean } = data;

  return (
    <pre className={styles.CodeSnippet}>
      {'{'}
      <br />
      <TabCharacter />
      "results": {'{'}
      <br />
      {result && (
        <>
          <TabCharacter />
          <TabCharacter />
          "result": "<WhiteText>{result}</WhiteText>",
          <br />
        </>
      )}
      <TabCharacter />
      <TabCharacter />
      "valid": <WhiteText>{valid.toString()}</WhiteText>,<br />
      {reason && (
        <>
          <TabCharacter />
          <TabCharacter />
          "reason": "<WhiteText>{reason}</WhiteText>",
          <br />
        </>
      )}
      <TabCharacter />
      <TabCharacter />
      "is_role": <WhiteText>{is_role.toString()}</WhiteText>,<br />
      <TabCharacter />
      <TabCharacter />
      "is_disposable": <WhiteText>{is_disposable.toString()}</WhiteText>,<br />
      <TabCharacter />
      <TabCharacter />
      "is_free": <WhiteText>{is_free.toString()}</WhiteText>,<br />
      {did_you_mean && (
        <>
          <TabCharacter />
          <TabCharacter />
          "did_you_mean": "<WhiteText>{did_you_mean.toString()}</WhiteText>"<br />
        </>
      )}
      <TabCharacter />
      {'}'}
      <br />
      {'}'}
    </pre>
  );
}

const mapStateToProps = ({ recipientValidation }, { match }) => ({
  singleResults: recipientValidation.singleResults,
  loading: recipientValidation.loading,
  address: match.params.email,
});

export default withRouter(connect(mapStateToProps, { singleAddress, showAlert })(SingleResult));
