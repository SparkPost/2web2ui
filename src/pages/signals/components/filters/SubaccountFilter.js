import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { ArrowDropDown, ChevronLeft, ChevronRight } from '@sparkpost/matchbox-icons';
import { Button, Label, Popover, UnstyledLink, WindowEvent } from 'src/components/matchbox';
import SubaccountTypeahead from 'src/components/typeahead/SubaccountTypeahead';
import { hasSubaccounts } from 'src/selectors/subaccounts';
import { useHibana } from 'src/context/HibanaContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import withSignalOptions from '../../containers/withSignalOptions';
import SubaccountOption from './SubaccountOption';
import { onEscape } from 'src/helpers/keyEvents';
import OGStyles from './SubaccountFilter.module.scss';
import hibanaStyles from './SubaccountFilterHibana.module.scss';

const OPTIONS = [
  {
    id: undefined,
    name: 'Primary & All Subaccounts',
    condition: ({ id }) => !id && id !== 0,
  },
  {
    id: 0,
    name: 'Primary Account',
    condition: ({ id }) => id === 0,
  },
  {
    name: 'Search for Subaccount',
    nested: true,
    condition: ({ id }) => id > 0,
  },
];

export class SubaccountFilterClassComponent extends React.Component {
  state = {
    isOpen: false,
    isSearchOpen: false,
  };

  close = () => {
    this.setState({ isOpen: false, isSearchOpen: false });
  };

  handleChange = subaccount => {
    const { name, id } = subaccount || OPTIONS[0];
    this.close();
    this.props.changeSignalOptions({ subaccount: { id, name } });
  };

  handleSearchToggle = () => {
    this.setState(prevState => ({ isSearchOpen: !prevState.isSearchOpen }));
  };

  handleVisibilityToggle = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  containsTarget = (ref, e) => Boolean(ref && ref.contains(e.target));

  handleWindowClick = e => {
    if (!this.containsTarget(this.contentRef, e) && !this.containsTarget(this.triggerRef, e)) {
      this.close();
    }
  };

  render() {
    const {
      hasSubaccounts,
      signalOptions: { subaccount = OPTIONS[0] },
      styles,
    } = this.props;
    const { isOpen, isSearchOpen } = this.state;

    if (!hasSubaccounts) {
      return null;
    }

    const trigger = (
      <div ref={node => (this.triggerRef = node)}>
        <Button
          aria-labelledby="subaccount-label"
          aria-controls="popover-subaccount-filter"
          fullWidth
          onClick={this.handleVisibilityToggle}
          className={styles.Button}
        >
          <span className={styles.ButtonLabel}>{subaccount.name}</span>
          {subaccount.id > 0 && <span>({subaccount.id})</span>}
          <TriggerIcon className={styles.ButtonIcon} />
        </Button>
      </div>
    );

    return (
      <>
        <Label id="subaccount-label" label="Subaccount" />

        <div className={styles.SubaccountFilter}>
          <WindowEvent handler={this.handleWindowClick} event="click" />
          <WindowEvent handler={onEscape(this.close)} event="keydown" />

          <Popover
            id="popover-subaccount-filter"
            className={styles.Popover}
            left
            open={isOpen}
            trigger={trigger}
          >
            <div ref={node => (this.contentRef = node)}>
              <div className={classnames(styles.PopoverContent, isSearchOpen && styles.showSearch)}>
                <div className={styles.SubaccountSearchHeader}>
                  <UnstyledLink className={styles.BackButton} onClick={this.handleSearchToggle}>
                    <ChevronLeft size={20} />
                  </UnstyledLink>
                  <span>Subaccount</span>
                </div>
                <div className={styles.SubaccountSearch}>
                  <SubaccountTypeahead
                    label="Subaccount Search"
                    onChange={this.handleChange}
                    placeholder="Search here"
                    selectedItem={
                      OPTIONS[0].condition(subaccount) || OPTIONS[1].condition(subaccount)
                        ? ''
                        : subaccount
                    }
                    unfiltered
                  />
                </div>
              </div>
              <div
                className={classnames(styles.PopoverContent, !isSearchOpen && styles.showOptions)}
              >
                {OPTIONS.map(({ condition, id, name, nested }) => (
                  <SubaccountOption
                    key={name}
                    label={name}
                    nested={nested}
                    onChange={this.handleChange}
                    onOpen={this.handleSearchToggle}
                    selected={condition(subaccount)}
                    value={{ id, name }}
                  />
                ))}
              </div>
            </div>
          </Popover>
        </div>
      </>
    );
  }
}

// TODO: Remove when OG theme is removed - just use the `Chevron*` icon without using `ArrowDropDown`
function TriggerIcon({ className }) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (isHibanaEnabled) {
    return <ChevronRight className={className} />;
  }

  return <ArrowDropDown className={className} />;
}

function SubaccountFilter(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return <SubaccountFilterClassComponent styles={styles} {...props} />;
}

const mapStateToProps = state => ({
  hasSubaccounts: hasSubaccounts(state),
});

export default withSignalOptions(connect(mapStateToProps)(SubaccountFilter));
