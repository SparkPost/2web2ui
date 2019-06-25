import React from 'react';
import { connect } from 'react-redux';
import { Page, Panel, Button, Grid, UnstyledLink } from '@sparkpost/matchbox';
import styles from './SingleResult.module.scss';
import { withRouter, Redirect, Link } from 'react-router-dom';
import CodeBlock from './components/CodeBlock';
import InfoTooltip from 'src/pages/signals/components/InfoTooltip';
import { WarningIcon, SuccessIcon, InfoIcon, ErrorIcon } from './components/icons';
import { ROLE_TOOLTIP, DISPOSABLE_TOOLTIP, FREE_TOOLTIP, RESULT_DESCRIPTIONS } from './constants';

const SINGLE_RV_LINK = '/recipient-validation/single';

const Tab = () => (<span className={styles.tab} />);
const White = ({ children }) => (<span className={styles.white} >{children}</span>);

const valueResponse = (value) => value ? (
  <span className={styles.redBoolean}>Yes</span>
) : (
  <span className={styles.greenBoolean}>No</span>
);

const ICONS = {
  unkown: <InfoIcon />,
  undeliverable: <ErrorIcon />,
  deliverable: <SuccessIcon />,
  risky: <WarningIcon />
};

const SingleResult = ({ singleResults = {}}) => {

  // singleResults = {
  //   result: 'deliverable',
  //   valid: true,
  //   reason: 'Invalid Domain',
  //   is_role: false,
  //   is_disposable: false,
  //   is_free: false,
  //   did_you_mean: 'harry.potter@hogwarts.edu',
  //   email: 'harry.potter@hogwarts.com'
  // }
  if (!singleResults) {
    return (<Redirect to='/recipient-validation/list' />);
  }

  const { email, result, valid, reason, is_role, is_disposable, is_free, did_you_mean } = singleResults;

  const codeBlock = () => (
    <small className={styles.blue}>
      {'{'}<br/>
      <Tab />"results": {'{'}<br/>
      <Tab /><Tab />"result": "<White>{result}</White>",<br/>
      <Tab /><Tab />"valid": <White>{valid.toString()}</White>,<br/>
      <Tab /><Tab />"reason": "<White>{reason}</White>",<br/>
      <Tab /><Tab />"is_role": <White>{is_role.toString()}</White>,<br/>
      <Tab /><Tab />"is_disposable": <White>{is_disposable.toString()}</White>,<br/>
      <Tab /><Tab />"is_free": <White>{is_free.toString()}</White>,<br/>
      <Tab /><Tab />"did_you_mean": "<White>{did_you_mean.toString()}</White>"<br/>
      <Tab />{'}'}<br/>
      {'}'}
    </small>
  );

  const resultTable = () => (
    <div className={styles.table}>
      <h6 className={styles.tableKey}>Did you mean</h6>
      <span>{did_you_mean}</span>
      <hr />
      <h6 className={styles.tableKey}>Normalized</h6>
      <span>{email}</span>
      <hr />
      <h6 className={styles.tableKey}>Role-based <InfoTooltip size={16} content={ROLE_TOOLTIP}/></h6>
      {valueResponse(is_role)}
      <hr />
      <h6 className={styles.tableKey}>Disposable <InfoTooltip size={16} content={DISPOSABLE_TOOLTIP}/></h6>
      {valueResponse(is_disposable)}
      <hr />
      <h6 className={styles.tableKey}>Free <InfoTooltip size={16} content={FREE_TOOLTIP}/></h6>
      {valueResponse(is_role)}
    </div>
  );

  const renderResult = () => (
    <div className={styles.Result}>
      <div style={{ marginRight: '15px' }}>
        {ICONS[result]}
      </div>
      <div>
        <div style={{ marginBottom: '20px' }}>Status:</div>
        <div style={{ textTransform: 'capitalize', fontSize: '2.8em', fontWeight: 550 }}>{result}</div>
      </div>
    </div>
  );

  return (
    <Page
      title='Recipient Validation'
      subtitle='Results'
      breadcrumbAction={{ content: 'Back', to: SINGLE_RV_LINK, component: Link }}
    >
      <Panel>
        <Grid>
          <Grid.Column xs={12} md={7}>
            <div style={{ padding: '1.5rem 2rem' }}>
              <h2 className={styles.Header}>{email}</h2>
              {renderResult()}
              {resultTable()}
              <p className={styles.Paragraph}>
                {RESULT_DESCRIPTIONS[result]}
              </p>
              <Button component={Link} color='orange' to={SINGLE_RV_LINK}>
                Validate Another
              </Button>
            </div>
          </Grid.Column>
          <Grid.Column xs={12} md={5}>
            <CodeBlock
              preformatted
            >
              <div style={{ padding: '1rem 2rem' }}>
                <h2 style={{ color: 'white' }}>Raw API Response</h2>
                <p className={styles.Paragraph}>
                  <White>
                    The following raw API results outline the reasons for your email's validation status. Learn how to
                    <UnstyledLink to='https://developers.sparkpost.com/api/recipient-validation/' style={{ color: 'white', fontWeight: '800' }}> integrate with Recipient Validation </UnstyledLink>
                    in your product.
                  </White>
                </p>
                <pre>
                  {codeBlock()}
                </pre>
              </div>
            </CodeBlock>
          </Grid.Column>
        </Grid>
      </Panel>
    </Page>
  );
};

const mapStateToProps = ({ recipientValidation }) => ({
  singleResults: recipientValidation.singleResults
});

export default withRouter(connect(mapStateToProps)(SingleResult));
