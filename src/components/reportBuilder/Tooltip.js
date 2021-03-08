import React from 'react';
import { Box, Text } from 'src/components/matchbox';
import { LegendCircle } from 'src/components';
import { tokens } from '@sparkpost/design-tokens-hibana';

function CustomTooltip({ showTooltip, payload, label, labelFormatter, formatter }) {
  if (!showTooltip) {
    return null;
  }

  const industryRate = payload.find(entry => entry.dataKey === 'industry_rate');

  return (
    <Box borderRadius="200" padding="200" bg="gray.1000">
      <Box fontSize="100" color="gray.200" mb="100">
        {labelFormatter(label)}
      </Box>
      {payload.map(entry => {
        if (entry.dataKey === 'industry_rate') {
          return null;
        }

        return (
          <Box key={`report_chart_${entry.name}`}>
            <Box mb="100">
              <Box justifyContent="space-between" alignItems="center" display="flex">
                <Box display="inline-flex" alignItems="center">
                  <LegendCircle mr={tokens.spacing_300} color={entry.stroke} />
                  <Text as="span" fontSize="100" color="white">
                    {entry.name}
                  </Text>
                </Box>
                <Box ml="800">
                  <Text fontSize="100" textAlign="right" color="white">
                    {formatter(entry.value)}
                  </Text>
                </Box>
              </Box>
            </Box>

            {entry.dataKey === 'inbox_folder_rate' && industryRate && (
              <Box mb="100">
                {Boolean(industryRate.value[0]) && (
                  <Box justifyContent="space-between" alignItems="center" display="flex">
                    <Box display="inline-flex" alignItems="center">
                      <Box mr={tokens.spacing_300} height="16px" width="16px" />
                      <Text as="span" fontWeight="light" fontSize="100" color="white">
                        {industryRate.value[2]} 25th percentile
                      </Text>
                    </Box>
                    <Box ml="800">
                      <Text fontSize="100" fontWeight="light" textAlign="right" color="white">
                        {formatter(industryRate.value[0])}
                      </Text>
                    </Box>
                  </Box>
                )}
                {Boolean(industryRate.value[1]) && (
                  <Box justifyContent="space-between" alignItems="center" display="flex">
                    <Box display="inline-flex" alignItems="center">
                      <Box mr={tokens.spacing_300} height="16px" width="16px" />
                      <Text as="span" fontWeight="light" fontSize="100" color="white">
                        {industryRate.value[2]} 75th percentile
                      </Text>
                    </Box>
                    <Box ml="800">
                      <Text fontSize="100" fontWeight="light" textAlign="right" color="white">
                        {formatter(industryRate.value[1])}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default CustomTooltip;
