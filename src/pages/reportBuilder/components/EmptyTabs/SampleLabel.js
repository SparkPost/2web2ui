import React from 'react';
import styles from './EmptyTabs.module.scss';
import { Box } from 'src/components/matchbox';

const SampleLabel = () => (
  <Box
    className={styles.SampleLabel}
    position="absolute"
    bg="gray.900"
    zIndex="2"
    color="white"
    fontSize="400"
    px="650"
    py="300"
    top="50%"
    left="50%"
    boxShadow="200"
  >
    SAMPLE DATA
  </Box>
);

export default SampleLabel;
