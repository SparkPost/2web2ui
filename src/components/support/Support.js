import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import qs from 'query-string';
import * as supportActions from 'src/actions/support';
import { AccessControl } from 'src/components/auth';
import { Panel, Tabs, UnstyledLink, Modal } from 'src/components/matchbox';
import findRouteByPath from 'src/helpers/findRouteByPath';
import { authorizedToSubmitSupportTickets } from 'src/selectors/support';
import SearchPanel from './components/SearchPanel';
import SupportForm from './components/SupportForm';
import { hasPhoneSupport } from 'src/selectors/accountBillingInfo';
import styles from './Support.module.scss';
import { selectRoutes } from 'src/selectors/routes';

export class Support extends Component {
  TABS = [
    {
      content: 'Search Help',
      onClick: () => this.props.openSupportPanel({ view: 'docs' }),
      view: 'docs',
      visible: () => true,
    },
    {
      content: 'Submit A Ticket',
      onClick: () => this.props.openSupportPanel({ view: 'ticket' }),
      view: 'ticket',
      visible: () => this.props.authorizedToSubmitSupportTickets,
    },
    {
      content: 'Contact Us',
      onClick: () => this.props.openSupportPanel({ view: 'contact' }),
      view: 'contact',
      visible: () => this.props.authorizedToCallSupport,
    },
  ];

  componentDidMount() {
    this.maybeOpenTicket();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location.search && location.search !== prevProps.location.search) {
      this.maybeOpenTicket();
    }
  }

  // Opens and hydrates support ticket form from query params
  maybeOpenTicket = () => {
    const { location, openSupportTicketForm } = this.props;
    const { supportTicket, supportMessage: message, supportIssue: issueId } = qs.parse(
      location.search,
    );

    if (supportTicket) {
      openSupportTicketForm({ issueId, message });
    }
  };

  render() {
    const {
      closeSupportPanel,
      currentSupportView,
      location,
      loggedIn,
      showSupportPanel,
      routes,
    } = this.props;
    const visibleTabs = this.TABS.filter(tab => tab.visible());
    const { supportDocSearch } = findRouteByPath(location.pathname, undefined, routes);

    if (!loggedIn) {
      return null;
    }

    return (
      <Modal.LEGACY
        open={showSupportPanel}
        onClose={closeSupportPanel}
        showCloseButton={true}
        title="Support Modal"
      >
        <Panel.LEGACY className={styles.Support}>
          {visibleTabs.length > 1 && (
            <Tabs
              connectBelow={true}
              selected={visibleTabs.findIndex(tab => tab.view === currentSupportView)}
              tabs={visibleTabs.map(({ content, onClick }) => ({ content, onClick }))}
              disableResponsiveBehavior
            />
          )}
          {currentSupportView === 'docs' && <SearchPanel defaultSearchText={supportDocSearch} />}
          {currentSupportView === 'ticket' && <SupportForm onClose={closeSupportPanel} />}
          {currentSupportView === 'contact' && (
            <div className={styles.SupportContainer}>
              <h6>We are available Monday through Friday, 9am to 7pm Eastern time.</h6>
              <UnstyledLink to="tel:1-415-751-0928">+1 (415) 751-0928</UnstyledLink>
            </div>
          )}
        </Panel.LEGACY>
      </Modal.LEGACY>
    );
  }
}

const mapStateToProps = state => ({
  authorizedToCallSupport: hasPhoneSupport(state),
  authorizedToSubmitSupportTickets: authorizedToSubmitSupportTickets(state),
  currentSupportView: state.support.currentView,
  loggedIn: state.auth.loggedIn,
  showSupportPanel: state.support.showPanel,
  routes: selectRoutes(state),
});

export const ConnectedSupport = withRouter(connect(mapStateToProps, supportActions)(Support));

export default function SupportWithAccessControlLoaded(props) {
  return (
    <AccessControl>
      <ConnectedSupport {...props} />
    </AccessControl>
  );
}
