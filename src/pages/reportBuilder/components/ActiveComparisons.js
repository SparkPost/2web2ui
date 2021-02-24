import React from 'react';
import { Box, Inline, Text, Tag } from 'src/components/matchbox';
import { Comparison } from 'src/components/text';
import { getFilterTypeLabel } from 'src/pages/reportBuilder/helpers';
export default function ActiveComparisons({ comparisons, handleFilterRemove }) {
  return (
    <Box data-id="active-comparison-filters" marginTop="100">
      <Inline space="200" as="span">
        <Text fontSize="200" as="span">
          {getFilterTypeLabel(comparisons[0]?.type)}
        </Text>
        {comparisons.map((compareFilter, index) => {
          const onRemoveFn = handleFilterRemove
            ? () => {
                handleFilterRemove({ index });
              }
            : undefined;

          return (
            <Inline key={`comparison_${index}`}>
              <Tag onRemove={onRemoveFn}>{compareFilter.value}</Tag>
              {index < comparisons.length - 1 && (
                <Box>
                  <Comparison>AND</Comparison>
                </Box>
              )}
            </Inline>
          );
        })}
      </Inline>
    </Box>
  );
}
