import asyncComponent from 'src/components/asyncComponent/asyncComponent';
import { PanelLoading } from 'src/components/loading';

export default asyncComponent(() => import('./async/EngagementChart'), PanelLoading);
