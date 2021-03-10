import React, { Component } from 'react';
import { Grid, Button } from 'src/components/matchbox';
import Legend from './Legend';

import styles from './ChartHeader.module.scss';

export default class ChartHeader extends Component {
  renderScaleButton(scale, label) {
    const { onScaleClick, selectedScale } = this.props;
    return (
      <Button size="small" primary={scale === selectedScale} onClick={() => onScaleClick(scale)}>
        {label}
      </Button>
    );
  }

  renderTimeMode() {
    const { selectedTime, onTimeClick } = this.props;
    return (
      <Button.Group className={styles.ButtonSpacer}>
        <Button primary={selectedTime === 'real'} onClick={() => onTimeClick('real')} size="small">
          Real Time
        </Button>
        <Button
          primary={selectedTime === 'injection'}
          onClick={() => onTimeClick('injection')}
          size="small"
        >
          Injection Time
        </Button>
      </Button.Group>
    );
  }

  render() {
    const { selectedMetrics, onMetricsToggle } = this.props;

    return (
      <Grid className={styles.ChartHeader}>
        <Grid.Column xs={12} md={9}>
          <Legend metrics={selectedMetrics} />
        </Grid.Column>
        <Grid.Column xs={12} md={3}>
          <div className={styles.Controls}>
            <Button size="small" onClick={onMetricsToggle}>
              Select Metrics
            </Button>
            {/* {this.renderTimeMode()} */}
            {/*<Button.Group className={styles.ButtonSpacer}>*/}
            {/*{this.renderScaleButton('linear', 'Linear')}*/}
            {/*{this.renderScaleButton('log', 'Log')}*/}
            {/*{this.renderScaleButton('pow', 'Pow')}*/}
            {/*</Button.Group>*/}
          </div>
        </Grid.Column>
      </Grid>
    );
  }
}
