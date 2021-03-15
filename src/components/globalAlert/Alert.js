import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Snackbar } from 'src/components/matchbox';
import { ButtonLink } from 'src/components/links';
import styles from './Alert.module.scss';

class Alert extends Component {
  static propTypes = {
    autoDismiss: PropTypes.bool,
    message: PropTypes.node.isRequired,
    type: PropTypes.string,
    details: PropTypes.string,
    timeoutInterval: PropTypes.number,
    onDismiss: PropTypes.func.isRequired,
    maxWidth: PropTypes.number,
    action: PropTypes.object,
  };

  static defaultProps = {
    autoDismiss: true,
    type: 'default',
    timeoutInterval: 15000,
  };

  state = {
    showDetails: false,
  };

  timeout = null;

  componentDidMount() {
    if (this.props.autoDismiss) {
      this.refreshTimeout();
    }
  }

  handleDismiss = () => {
    this.props.onDismiss();
  };

  refreshTimeout = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.handleDismiss, this.props.timeoutInterval);
  };

  handleDetails = () => {
    if (this.props.autoDismiss) {
      this.refreshTimeout();
    }
    this.setState({ showDetails: true });
  };

  renderMessage() {
    const { message, details, action } = this.props;
    const { showDetails } = this.state;
    let actionMarkup = null;

    const detailsLink =
      details && !showDetails ? (
        <ButtonLink className={styles.Details} onClick={this.handleDetails}>
          View Details
        </ButtonLink>
      ) : null;

    if (action) {
      const { content: actionContent, ...actionProps } = action;
      actionMarkup = (
        <ButtonLink className={styles.Details} {...actionProps}>
          {actionContent}
        </ButtonLink>
      );
    }

    const markup = showDetails ? (
      <div>{details}</div>
    ) : (
      <div>
        {message} <span>{detailsLink || actionMarkup}</span>
      </div>
    );

    return <div>{markup}</div>;
  }

  render() {
    const { type, maxWidth } = this.props;

    return (
      <Snackbar status={type} onDismiss={this.handleDismiss} maxWidth={maxWidth}>
        {this.renderMessage()}
      </Snackbar>
    );
  }
}

export default Alert;
