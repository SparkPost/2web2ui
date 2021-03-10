import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'src/components/matchbox';
import { useHibana } from 'src/context/HibanaContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import _ from 'lodash';
import OGStyles from './ControlGroup.module.scss';
import hibanaStyles from './ControlGroupHibana.module.scss';

class ControlGroup extends Component {
  state = {
    selected: '',
  };

  componentDidMount() {
    const { initialSelected } = this.props;

    if (initialSelected) {
      this.setState({ selected: initialSelected });
    }
  }

  handleChange = selected => {
    const { onChange } = this.props;

    this.setState({ selected });

    if (onChange) {
      onChange(selected);
    }
  };

  renderButtons = () => {
    const { options } = this.props;
    const { selected } = this.state;

    return _.keys(options).map(key => {
      return (
        <ControlButton
          key={key}
          selectedKey={key}
          isSelected={selected === key}
          onClick={() => this.handleChange(key)}
        >
          {options[key]}
        </ControlButton>
      );
    });
  };

  render() {
    return <Button.Group>{this.renderButtons()}</Button.Group>;
  }
}

function ControlButton(props) {
  const [state] = useHibana();
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const { isHibanaEnabled } = state;
  const { children, selectedKey, isSelected, onClick } = props;

  let defaultStyleProps = {};
  let selectedStyleProps = {};

  if (isHibanaEnabled) {
    defaultStyleProps = {
      color: 'gray',
      outlineBorder: true,
    };

    selectedStyleProps = {
      color: 'gray',
      flat: false,
    };
  }

  return (
    <Button
      {...(isSelected ? selectedStyleProps : defaultStyleProps)}
      selectedkey={selectedKey}
      onClick={onClick}
      className={classNames(styles.Button, isSelected && styles.isSelected)}
      size="small"
    >
      {children}
    </Button>
  );
}

ControlGroup.propTypes = {
  options: PropTypes.object.isRequired,
  initialSelected: PropTypes.string,
  onChange: PropTypes.func,
};

export default ControlGroup;
