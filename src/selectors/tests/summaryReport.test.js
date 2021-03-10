import { selectSelectedMetrics } from '../summaryReport';

describe('Selector: Summary Report', () => {

  let testState;

  beforeEach(() => {
    testState = {
      summaryChart: {
        metrics: [
          { key: 'count_a', cool: 123 },
          { key: 'count_b', other: 'stuff' }
        ]
      }
    };
  });
  it('should select metric keys', () => {
    expect(selectSelectedMetrics(testState)).toEqual(['count_a', 'count_b']);
  });

  it('should select an empty array if no metrics exist in the summary chart state', () => {
    delete testState.summaryChart.metrics;
    expect(selectSelectedMetrics(testState)).toEqual([]);
  });

});
