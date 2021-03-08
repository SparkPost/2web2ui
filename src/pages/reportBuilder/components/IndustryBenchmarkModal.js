import React, { useReducer } from 'react';
import { Button, Column, Columns, Modal, Select, Stack } from 'src/components/matchbox';
import { ToggleBlock } from 'src/components/toggleBlock';
import { INDUSTRY_BENCHMARK_METRICS_MAP } from 'src/config/metrics';
import { INDUSTRY_BENCHMARK_INDUSTRIES, INDUSTRY_BENCHMARK_MAILBOX_PROVIDERS } from 'src/constants';
import { useReportBuilderContext } from 'src/pages/reportBuilder/context/ReportBuilderContext';

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'CHANGE_METRIC': {
      const { metricKey, checked } = payload;
      const industryBenchmarkMetric = checked ? metricKey : null;
      return {
        ...state,
        industryBenchmarkMetric,
      };
    }
    case 'CHANGE_FILTER': {
      const { filterKey, value } = payload;
      const { industryBenchmarkFilters } = state;
      return {
        ...state,
        industryBenchmarkFilters: { ...industryBenchmarkFilters, [filterKey]: value },
      };
    }
    default:
      return { ...state };
  }
};

export const IndustryModal = ({ metrics, isModalOpen, closeModal }) => {
  const {
    state: reportOptions,
    actions: { setIndustryBenchmark },
  } = useReportBuilderContext();
  const { industryBenchmarkMetric, industryBenchmarkFilters } = reportOptions;
  const [state, dispatch] = useReducer(reducer, {
    industryBenchmarkFilters,
    industryBenchmarkMetric,
  });
  return (
    <>
      <Modal open={isModalOpen} onClose={closeModal} showCloseButton>
        <Modal.Header>Industry Benchmark</Modal.Header>
        <Modal.Content>
          <Stack>
            {metrics.map(metric => (
              <ToggleBlock
                input={{ name: metric }}
                key={metric}
                label={INDUSTRY_BENCHMARK_METRICS_MAP[metric].label}
                helpText={INDUSTRY_BENCHMARK_METRICS_MAP[metric].helpText}
                checked={state.industryBenchmarkMetric === metric}
                onChange={({ target: { checked } }) => {
                  dispatch({
                    type: 'CHANGE_METRIC',
                    payload: { metricKey: metric, checked },
                  });
                }}
              />
            ))}
            <Columns>
              <Column width={3 / 5}>
                <Select
                  maxWidth="800px"
                  label="Industry"
                  id="industry"
                  value={state.industryBenchmarkFilters.industryCategory}
                  options={INDUSTRY_BENCHMARK_INDUSTRIES}
                  onChange={({ target: { value } }) => {
                    dispatch({
                      type: 'CHANGE_FILTER',
                      payload: { filterKey: 'industryCategory', value },
                    });
                  }}
                />
              </Column>
              <Column width={2 / 5}>
                <Select
                  id="isp"
                  label="Mailbox Provider"
                  value={state.industryBenchmarkFilters.mailboxProvider}
                  options={INDUSTRY_BENCHMARK_MAILBOX_PROVIDERS}
                  onChange={({ target: { value } }) => {
                    dispatch({
                      type: 'CHANGE_FILTER',
                      payload: { filterKey: 'mailboxProvider', value },
                    });
                  }}
                />
              </Column>
            </Columns>
          </Stack>
        </Modal.Content>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setIndustryBenchmark(state);
              closeModal();
            }}
          >
            Display Benchmark
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
