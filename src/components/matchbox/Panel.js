import React from 'react';
import PropTypes from 'prop-types';
import { Panel as HibanaPanel } from '@sparkpost/matchbox-hibana';
import { Box } from 'src/components/matchbox';

function Panel(props) {
  return <HibanaPanel mb={props.mb ? props.mb : '500'} {...props} />;
}

function LEGACY(props) {
  return <HibanaPanel.LEGACY mb={props.mb ? props.mb : '500'} {...props} />;
}

function LegacySection(props) {
  return <HibanaPanel.LEGACY.Section {...props} />;
}

function LegacyFooter(props) {
  return <HibanaPanel.LEGACY.Footer {...props} />;
}

function Section(props) {
  return <HibanaPanel.Section {...props} />;
}

function Header(props) {
  return <HibanaPanel.Header {...props} />;
}

function Action(props) {
  return <HibanaPanel.Action {...props} />;
}

/**
 * Used to consistently render a slightly larger heading font size and style within <Panel.Header /> component instances
 *
 * @param {children} React children to render the Headline content, typically a string though could also include <Panel.HeadlineIcon />
 *
 */
function Headline({ children }) {
  return (
    <Box as="span" fontSize="500" fontWeight="medium" display="flex" alignItems="center">
      {children}
    </Box>
  );
}

function HeadlineIcon({ as }) {
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
