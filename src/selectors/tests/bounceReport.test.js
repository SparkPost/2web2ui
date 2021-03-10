import { mapStateToProps } from '../bounceReport';
import * as bounceHelpers from 'src/helpers/bounce';
import * as reportSearchOptions from 'src/selectors/reportSearchOptions';


jest.mock('src/helpers/bounce');

jest.mock('src/selectors/reportSearchOptions', () => ({
  selectReportSearchOptions: jest.fn()
}));

describe('Selector: Bounce Report', () => {

  let testState;
  let bandTypes;
  let reshapedCategories;
  let formattedAggregates;
  let searchOptions;

  beforeEach(() => {
    testState = {
      reportOptions: {},
      bounceReport: {
        aggregates: {
          count_sent: 100,
          count_bounce: 4,
          count_admin_bounce: 3,
          count_inband_bounce: 2,
          count_outofband_bounce: 1
        },
        aggregatesLoading: false,
        categoriesLoading: false,
        reasonsLoading: false,
        reasons: [],
        adminReasons: [],
        classifications: []
      }
    };

    bandTypes = [];
    bounceHelpers.getBandTypes = jest.fn(() => bandTypes);

    reshapedCategories = [];
    bounceHelpers.reshapeCategories = jest.fn(() => reshapedCategories);

    formattedAggregates = [];
    bounceHelpers.formatAggregates = jest.fn(() => formattedAggregates);

    searchOptions = { from: '', to: '', range: '7d', filters: {}};
    reportSearchOptions.selectReportSearchOptions.mockReturnValue(searchOptions);
  });

  it('should map state to props when not loading', () => {
    const props = mapStateToProps(testState);
    expect(props).toEqual({
      chartLoading: false,
      tableLoading: false,
      reasons: testState.bounceReport.reasons,
      adminReasons: testState.bounceReport.adminReasons,
      aggregates: formattedAggregates,
      categories: reshapedCategories,
      adminCategories: reshapedCategories,
      types: bandTypes,
      reportOptions: testState.reportOptions,
      bounceSearchOptions: searchOptions
    });
    expect(bounceHelpers.getBandTypes).toHaveBeenCalledWith(formattedAggregates);
    expect(bounceHelpers.reshapeCategories).toHaveBeenCalledWith(testState.bounceReport.classifications);
    expect(bounceHelpers.formatAggregates).toHaveBeenCalledWith(testState.bounceReport.aggregates);
  });

  it('should report chart and table as loading if aggregates are loading', () => {
    testState.bounceReport.aggregatesLoading = true;
    const props = mapStateToProps(testState);
    expect(props.chartLoading).toEqual(true);
    expect(props.tableLoading).toEqual(true);
  });

  it('should report chart and table as loading if categories are loading', () => {
    testState.bounceReport.categoriesLoading = true;
    const props = mapStateToProps(testState);
    expect(props.chartLoading).toEqual(true);
    expect(props.tableLoading).toEqual(true);
  });

  it('should report table as loading when reasons are loading', () => {
    testState.bounceReport.reasonsLoading = true;
    const props = mapStateToProps(testState);
    expect(props.chartLoading).toEqual(false);
    expect(props.tableLoading).toEqual(true);
  });

  it('should default to an empty array when there are no aggregates', () => {
    testState.bounceReport.aggregates = {};
    const props = mapStateToProps(testState);
    expect(props.aggregates).toEqual([]);
    expect(bounceHelpers.formatAggregates).not.toHaveBeenCalled();
  });

  it('should format aggregates when there are only Admin bounces', () => {
    testState.bounceReport.aggregates.count_bounce = 0;
    const props = mapStateToProps(testState);
    expect(props.aggregates).toEqual([]);
    expect(bounceHelpers.formatAggregates).toHaveBeenCalled();
  });

  it('should default to an empty array when there are no classifications', () => {
    delete testState.bounceReport.classifications;
    const props = mapStateToProps(testState);
    expect(props.categories).toEqual(reshapedCategories);
    expect(bounceHelpers.reshapeCategories).toHaveBeenCalledWith([]);
  });

  it('should extract admin bounces from classifications', () => {
    const categories = [
      { name: 'Admin', count: 10, children: ['test']},
      { name: 'Block', count: 100, children: ['test']}
    ];
    bounceHelpers.reshapeCategories = jest.fn(() => categories);
    const props = mapStateToProps(testState);
    expect(props.categories).toEqual([{ name: 'Block', count: 100, children: ['test']}]);
    expect(props.adminCategories).toEqual(['test']);
    expect(bounceHelpers.reshapeCategories).toHaveBeenCalledWith([]);
  });

  it('should remove regular bounces in admin bounce data', () => {
    testState.bounceReport.adminReasons = [
      { name: 'test1', count_bounce: 0, count_admin_bounce: 5 } ,
      { name: 'test2', count_bounce: 5, count_admin_bounce: 0 },
      { name: 'test3' }
    ];
    const props = mapStateToProps(testState);
    expect(props.adminReasons).toHaveLength(1);
  });

  it('should remove admin bounces in regular bounce data', () => {
    testState.bounceReport.reasons = [
      { name: 'test1', count_bounce: 5, count_admin_bounce: 0 } ,
      { name: 'test2', count_bounce: 0, count_admin_bounce: 5 },
      { name: 'test3' }
    ];
    const props = mapStateToProps(testState);
    expect(props.reasons).toHaveLength(1);
  });
});
