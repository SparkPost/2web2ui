import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { segmentPage } from 'src/helpers/segment';

export const SegmentPage = () => {
  const history = useHistory();
  const prevPathname = useRef(history.location.pathname);
  const prevSearchParams = useRef(history.location.search);

  // On URL path changes, inform segment via "PAGE" event
  useEffect(() => {
    const unlisten = history.listen(location => {
      if (
        prevPathname.current === location.pathname &&
        prevSearchParams.current !== location.search
      ) {
        segmentPage(prevPathname.current + prevSearchParams.current);
        prevSearchParams.current = location.search;
      }
      if (prevPathname.current !== location.pathname) {
        prevPathname.current = location.pathname;
        segmentPage();
      }
    });

    return () => unlisten();
  }, [history]);

  // "PAGE" on app load
  useEffect(() => {
    segmentPage();
  }, []);

  return null;
};

export default SegmentPage;
