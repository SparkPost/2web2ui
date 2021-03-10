import React, { Component } from 'react';
import { Button, Checkbox, Panel, Tooltip, WindowEvent, Modal } from 'src/components/matchbox';
import { list } from 'src/config/metrics';
import _ from 'lodash';
import styles from './MetricsModal.module.scss';

const METRICS_LIST = _.sortBy(list, ['label']);
const MAX_METRICS = 5;

export default class MetricsModal extends Component {
  componentWillMount() {
    this.syncPropsToState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.syncPropsToState(nextProps);
  }

  syncPropsToState = ({ selectedMetrics }) => {
    METRICS_LIST.map(({ key }) => {
      const isActive = _.some(selectedMetrics, { key });
      this.setState({ [key]: isActive });
    });
  };

  handleCheckbox = key => {
    this.setState({ [key]: !this.state[key] });
  };

  handleApply = () => {
    this.props.onSubmit(this.getSelectedMetrics());
  };

  handleKeyDown = e => {
    const { open } = this.props;

    if (!open) {
      return;
    }

    if (e.key === 'Enter') {
      this.handleApply();
    }
  };

  getSelectedMetrics = () => _.keys(this.state).filter(key => !!this.state[key]);

  renderMetrics() {
    const selectedCount = this.getSelectedMetrics().length;
    const MAX = this.props.maxMetrics || MAX_METRICS;

    return METRICS_LIST.map(metric => {
      if (metric.inSummary) {
        const checked = this.state[metric.key];
        return (
          <div className={styles.Metric} key={metric.key}>
            <Tooltip content={metric.description} dark>
              <Checkbox
                id={metric.key}
                disabled={selectedCount >= MAX && !checked}
                onChange={() => this.handleCheckbox(metric.key)}
                checked={checked}
                label={metric.label}
              />
            </Tooltip>
          </div>
        );
      }
    });
  }

  render() {
    const { open, onCancel } = this.props;
    const selectedCount = this.getSelectedMetrics().length;

    return (
      <Modal.LEGACY open={open} onClose={onCancel}>
        <WindowEvent event="keydown" handler={this.handleKeyDown} />
        <Panel.LEGACY>
          <Panel.LEGACY.Section>
            <h5>Select up to 5 metrics</h5>
            <div>{this.renderMetrics()}</div>
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <Button
              onClick={this.handleApply}
              primary
              className={styles.Apply}
              disabled={!selectedCount}
            >
              Apply Metrics
            </Button>
            <Button onClick={onCancel} className={styles.Cancel}>
              Cancel
            </Button>
          </Panel.LEGACY.Section>
        </Panel.LEGACY>
      </Modal.LEGACY>
    );
  }
}
