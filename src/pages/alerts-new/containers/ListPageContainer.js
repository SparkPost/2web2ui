import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { deleteAlert, listAlerts } from 'src/actions/alerts';

function withAlertsList(WrappedComponent) {
  const mapDispatchToProps = { deleteAlert, listAlerts };

  const mapStateToProps = (state, props) => ({
    list: state.alerts.list,
    error: state.alerts.listError
  });

  return withRouter(connect(mapStateToProps, mapDispatchToProps)(WrappedComponent));
}

export default withAlertsList;
