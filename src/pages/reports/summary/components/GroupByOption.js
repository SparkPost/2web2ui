import React, { Component } from 'react';
import styles from './Table.module.scss';
import { Grid, Checkbox, Select } from 'src/components/matchbox';
import _ from 'lodash';
import { GROUP_CONFIG } from './tableConfig';

export class GroupByOption extends Component {
  state = {
    topDomainsOnly: true,
  };

  handleGroupChange = e => {
    this.props._getTableData({ groupBy: e.target.value });
  };

  handleDomainsCheckboxChange = () => {
    const topDomainsOnly = !this.state.topDomainsOnly;
    this.setState({ topDomainsOnly });
    const groupBy = topDomainsOnly ? 'watched-domain' : 'domain';
    this.props._getTableData({ groupBy });
  };

  getSelectOptions = () => {
    const { hasSubaccounts } = this.props;
    const { topDomainsOnly } = this.state;

    const filteredOptionsKeys = _.reduce(
      GROUP_CONFIG,
      (accumulator, value, key) => {
        if (
          (key === 'subaccount' && !hasSubaccounts) ||
          (key === 'domain' && topDomainsOnly) ||
          (key === 'watched-domain' && !topDomainsOnly)
        ) {
          return accumulator; // ignore
        }
        accumulator.push(key);
        return accumulator;
      },
      [],
    );

    const options = filteredOptionsKeys.map(key => ({
      value: key,
      label: GROUP_CONFIG[key].label,
    }));

    return options;
  };

  renderDomainsCheckbox() {
    const { tableLoading, groupBy } = this.props;
    const { topDomainsOnly } = this.state;

    //Only show 'Top Domains Only' checkbox when on the recipient domains grouping
    if (groupBy !== 'watched-domain' && groupBy !== 'domain') {
      return null;
    }
    return (
      <div className={styles.TopDomainsCheckbox}>
        <Checkbox
          id="watchedDomains"
          label="Top Domains Only"
          checked={topDomainsOnly}
          onChange={this.handleDomainsCheckboxChange}
          disabled={tableLoading}
        />
      </div>
    );
  }

  render() {
    const { groupBy, tableLoading } = this.props;
    return (
      <Grid>
        <Grid.Column xs={12} md={5} lg={4}>
          <Select
            label="Group By"
            options={this.getSelectOptions()}
            value={groupBy}
            disabled={tableLoading}
            onChange={this.handleGroupChange}
          />
        </Grid.Column>
        <Grid.Column xs={12} md={4} mdOffset={3} lg={3} lgOffset={5}>
          {this.renderDomainsCheckbox()}
        </Grid.Column>
      </Grid>
    );
  }
}

export default GroupByOption;
