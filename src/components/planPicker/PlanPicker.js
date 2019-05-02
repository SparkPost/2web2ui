import React, { Component } from 'react';
import Downshift from 'downshift';
import { Field } from 'redux-form';
import cx from 'classnames';
import _ from 'lodash';

import { ExpandMore } from '@sparkpost/matchbox-icons';
import Plan from './Plan';
import styles from './PlanPicker.module.scss';
import { PLAN_TIERS } from 'src/constants';

const TIERS = [
  { key: 'default' },
  { key: 'test', label: PLAN_TIERS.test },
  { key: 'starter', label: PLAN_TIERS.starter },
  { key: 'premier', label: PLAN_TIERS.premier }
];

/**
 * This component will register the a redux-form field named 'planpicker'
 * Entire selected plan object is stored in state
 */
export class PlanPicker extends Component {
  handleOpen = () => {
    this.input.focus();
  }

  planFn = ({
    getInputProps,
    getToggleButtonProps,
    getItemProps,
    isOpen,
    selectedItem,
    highlightedIndex
  }) => {
    const { plans, input, disabled, selectedPromo } = this.props;

    if (!selectedItem || _.isEmpty(plans)) {
      return null;
    }

    let index = 0;
    const items = [];

    TIERS.forEach((tier) => {
      const tierPlans = plans[tier.key];
      if (tierPlans) {
        if (tier.label) {
          items.push(<div key={`label_${tier.key}`} className={cx(styles.DropdownLabel)}>{tier.label}:</div>);
        }

        plans[tier.key].forEach((item) => {
          const classes = cx(
            styles.DropdownPlan,
            selectedItem.code === item.code && styles.selected,
            highlightedIndex === index && styles.highlighted
          );
          items.push(<Plan key={index} className={classes} {...getItemProps({ item, index, plan: item })} />);
          index++;
        });
      }
    });

    const listClasses = cx(styles.List, isOpen && styles.open);
    const triggerClasses = cx(
      styles.TriggerPlan,
      disabled && styles.disabled,
      isOpen && styles.triggerOpen
    );
    const triggerProps = getToggleButtonProps({
      plan: selectedItem,
      onClick: this.handleOpen
    });
    const planPriceProps = {
      selectedPromo
    };

    const selectedPlan = (<>
        {PLAN_TIERS[selectedItem.tier] && <div className={cx(styles.DropdownLabel)}>{PLAN_TIERS[selectedItem.tier]}</div>}
        <Plan plan={selectedItem} className={triggerClasses} planPriceProps={planPriceProps}/>
    </>);

    return (
      <div className={styles.PlanPicker}>
        <div {...triggerProps}>
          <div className={cx(styles.TriggerHeader)}>
            Select A Plan
            <ExpandMore size={24} className={styles.Chevron} />
          </div>
          {selectedPlan}
        </div>
        <input {...getInputProps()} ref={(input) => this.input = input} className={styles.Input} />
        <div className={listClasses}>{items}</div>
      </div>
    );
  };


  render() {
    const { plans, input } = this.props;
    const { onChange, value } = input;

    return (
      <Downshift
        onChange={onChange}
        itemToString={(item) => (item ? item.code : '')} // prevents the downshift console warning
        initialSelectedItem={(value && value.code) ? value : plans[0]} >
        {this.planFn}
      </Downshift>
    );
  }
}

export default ({ plans = [], ...rest }) => <Field component={PlanPicker} name='planpicker' plans={plans} {...rest} />;
