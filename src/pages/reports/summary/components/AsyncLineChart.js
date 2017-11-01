import loadable from 'react-loadable';
import LoadableLoading from 'src/components/loading/LoadableLoading';

export const LoadableEditor = loadable({
  loader: () => import('./LineChart'),
  loading: LoadableLoading
});

export default LoadableEditor;
