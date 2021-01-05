import React from 'react';
import PropTypes from 'prop-types';
import { Panel as OGPanel } from '@sparkpost/matchbox';
import { Panel as HibanaPanel } from '@sparkpost/matchbox-hibana';
import { Box } from 'src/components/matchbox';
import { useHibana } from 'src/context/HibanaContext';
import { omitSystemProps } from 'src/helpers/hibana';

const ERROR_MESSAGE =
  'Panel components can only be used with Hibana enabled. To use a Panel component in both themes, please use Panel.LEGACY';

function Panel(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaPanel mb={props.mb ? props.mb : '500'} {...props} />;
}

function LEGACY(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) {
    return <OGPanel {...omitSystemProps(props)} />;
  }

  return <HibanaPanel.LEGACY mb={props.mb ? props.mb : '500'} {...props} />;
}

function LegacySection(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) {
    return <OGPanel.Section {...omitSystemProps(props)} />;
  }

  return <HibanaPanel.LEGACY.Section {...props} />;
}

function LegacyFooter(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) {
    return <OGPanel.Footer {...omitSystemProps(props, ['left', 'right'])} />;
  }

  return <HibanaPanel.LEGACY.Footer {...props} />;
}

function Section(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaPanel.Section {...props} />;
}

function Header(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaPanel.Header {...props} />;
}

function Action(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaPanel.Action {...props} />;
}

/**
 * Used to consistently render a slightly larger heading font size and style within <Panel.Header /> component instances
 *
 * @param {children} React children to render the Headline content, typically a string though could also include <Panel.HeadlineIcon />
 *
 */
function Headline({ children }) {
  const [{ isHibanaEnabled }] = useHibana();

  if (!isHibanaEnabled) {
    throw new Error('Panel.Headline can only be used with Hibana enabled.');
  }

  return (
    <Box as="span" fontSize="500" fontWeight="medium" display="flex" alignItems="center">
      {children}
    </Box>
  );
}

function HeadlineIcon({ as }) {
  const [{ isHibanaEnabled }] = useHibana();

  if (!isHibanaEnabled) {
    throw new Error('Panel.HeadlineIcon can only be used with Hibana enabled.');
  }

  return <Box as={as} mr="200" marginTop="3px" size={24} />;
}

LEGACY.displayName = 'Panel.LEGACY';
LegacySection.displayName = 'Panel.LEGACY.Section';
LegacyFooter.displayName = 'Panel.LEGACY.Footer';
Header.displayName = 'Panel.Header';
Action.displayName = 'Panel.Action';
Section.displayName = 'Panel.Section';
Headline.displayName = 'Panel.Headline';
HeadlineIcon.displayName = 'Panel.HeadlineIcon';

Panel.LEGACY = LEGACY;
Panel.LEGACY.Section = LegacySection;
Panel.LEGACY.Footer = LegacyFooter;
Panel.Header = Header;
Panel.Action = Action;
Panel.Section = Section;
Panel.Headline = Headline;
Panel.HeadlineIcon = HeadlineIcon;

Headline.propTypes = {
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  paddingBottom: PropTypes.string,
};

HeadlineIcon.propTypes = {
  as: PropTypes.func,
};

export default Panel;
