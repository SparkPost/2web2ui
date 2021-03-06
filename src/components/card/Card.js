import React from 'react';
import styles from './Card.module.scss';
import classNames from 'classnames';
import { Box, Text } from 'src/components/matchbox';
import useHibanaToggle from 'src/hooks/useHibanaToggle';

const OGCard = ({ children, textAlign }) => (
  <div className={classNames(styles.CardContainer, styles[textAlign])}>{children}</div>
);

export const CardActions = ({ children }) => <>{children}</>;

const OGCardContent = ({ children }) => <div className={styles.CardContent}>{children}</div>;

const OGCardTitle = ({ children, level = '3' }) => (
  <div
    className={classNames(
      styles.CardTitle,
      level === '2' && styles.level2,
      level === '3' && styles.level3,
    )}
    role="heading"
    aria-level={level}
  >
    {children}
  </div>
);

const HibanaCard = ({ children, textAlign }) => {
  return (
    <Box border="400" padding="400" textAlign={textAlign} color="gray.900">
      {children}
    </Box>
  );
};

const HibanaCardContent = ({ children }) => {
  return (
    <Box display="inline-block" fontSize="500" color="gray.900">
      {children}
    </Box>
  );
};

const HibanaCardTitle = ({ children, level }) => {
  return (
    <Text
      as="div"
      mb="400"
      color="gray.900"
      role="heading"
      aria-level={level}
      fontSize={level === '2' ? 22 : 20}
      fontWeight="500"
    >
      {children}
    </Text>
  );
};

export const Card = props => {
  return useHibanaToggle(OGCard, HibanaCard)(props);
};

export const CardContent = ({ children }) => {
  return useHibanaToggle(OGCardContent, HibanaCardContent)({ children });
};

export const CardTitle = props => {
  return useHibanaToggle(OGCardTitle, HibanaCardTitle)(props);
};
