import useHibanaToggle from 'src/hooks/useHibanaToggle';
import SummaryPage from './SummaryPage';
import ReportBuilder from 'src/pages/reportBuilder/ReportBuilder.container';

export default function(props) {
  return useHibanaToggle(SummaryPage, ReportBuilder)(props);
}
