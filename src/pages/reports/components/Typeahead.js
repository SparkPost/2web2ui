import React, { Component } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import { METRICS_API_LIMIT, TYPEAHEAD_LIMIT } from '../../../constants';
import { refreshTypeaheadCache } from 'src/actions/reportOptions';
import { ActionList, TextField } from 'src/components/matchbox';
import sortMatch from 'src/helpers/sortMatch';
import Item from './TypeaheadItem';
import styles from './Typeahead.module.scss';
import { connect } from 'react-redux';
import { LoadingSVG } from 'src/components';

function flattenItem({ type, value }) {
  return `${type}:${value}`;
}

const MatchesLoading = ({ isLoading }) => (isLoading ? <LoadingSVG size="XSmall" /> : null);

const staticItemTypes = ['Template', 'Subaccount', 'Sending Domain'];

export class Typeahead extends Component {
  state = {
    matches: [],
    calculatingMatches: false,
    pattern: null,
  };

  componentWillUnmount() {
    this.updateLookAhead.cancel();
  }

  /**
   * Returns all matches of the given types that match a pattern.
   */
  filterItems = (pattern, itemTypes) => {
    const { items, selected = [] } = this.props;
    const flatSelected = selected.map(flattenItem);
    const staticItems = itemTypes ? items.filter(({ type }) => itemTypes.includes(type)) : items;
    return sortMatch(staticItems, pattern, i => i.value)
      .filter(({ type, value }) => !flatSelected.includes(flattenItem({ type, value })))
      .slice(0, TYPEAHEAD_LIMIT);
  };

  /**
   * The lookahead/typeahead only activates when there are at least 2 characters.
   * If there are, it finds matches within the currently loaded items.
   * Then it makes the metrics api calls to load new items, filters those
   * items for matches while excluding results that already exits, and finally
   * appending the results to the existing matches.
   *
   */
  updateLookAhead = debounce(pattern => {
    if (!pattern || pattern.length < 2) {
      this.setState({ matches: [], calculatingMatches: false, pattern: null });
      return Promise.resolve();
    }

    // Show filtered static items
    const staticMatches = this.filterItems(pattern, staticItemTypes);
    this.setState({ calculatingMatches: true, pattern, matches: staticMatches });

    // Dispatch refresh for dynamic items
    const options = { ...this.props.reportOptions, match: pattern, limit: METRICS_API_LIMIT };
    return this.props.refreshTypeaheadCache(options).then(() => {
      // Avoid showing stale items from previous refreshes
      if (pattern === this.state.pattern) {
        // Then show static + dynamic items when available
        const allMatches = this.filterItems(pattern);
        this.setState({ calculatingMatches: false, matches: allMatches });
      }
    });
  }, 300);

  // Pass only item selection events to mask the
  // case where we call Downshift's clearSelection() which triggers
  // onChange(null).
  handleDownshiftChange = item => {
    // Maps to downshift's onChange function https://github.com/paypal/downshift#onchange
    const { onSelect } = this.props;
    if (item) {
      onSelect(item);
    }
  };

  onTypeahead = ({
    getInputProps,
    getItemProps,
    getLabelProps,
    isOpen,
    selectedItem,
    highlightedIndex,
    clearSelection,
  }) => {
    const {
      placeholder, // TextField placeholder
      disabled,
    } = this.props;

    const { matches = [] } = this.state;

    const mappedMatches = matches.map((item, index) => ({
      content: <Item value={item.value} helpText={item.type} />,
      ...getItemProps({ item, index }),
      highlighted: highlightedIndex === index,
      className: classnames(selectedItem === item && styles.selected), // Styles does nothing, was testing className pass through
    }));

    const listClasses = classnames(styles.List, isOpen && mappedMatches.length && styles.open);
    return (
      <div className={styles.Typeahead}>
        <div className={listClasses} data-id="report-filters-dropdown">
          <ActionList actions={mappedMatches} maxHeight={300} />
        </div>
        <label className={styles.Label} {...getLabelProps()}>
          Reports Filter Typeahead
        </label>
        <TextField
          id="report-options-typeahead"
          {...getInputProps({
            placeholder,
            onFocus: clearSelection,
          })}
          suffix={<MatchesLoading isLoading={this.state.calculatingMatches} />}
          disabled={disabled}
        />
      </div>
    );
  };

  render() {
    return (
      <Downshift
        itemToString={() => ''}
        onChange={this.handleDownshiftChange}
        onInputValueChange={this.updateLookAhead}
      >
        {this.onTypeahead}
      </Downshift>
    );
  }
}

const mapDispatchToProps = {
  refreshTypeaheadCache,
};

export default connect(null, mapDispatchToProps)(Typeahead);
