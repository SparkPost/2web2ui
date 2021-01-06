import { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePageFilters } from 'src/hooks';
import links from '../constants/editNavigationLinks';
import { routeNamespace } from '../constants/routes';
import { setSubaccountQuery } from '../../../helpers/subaccounts';

const initFilters = {
  navKey: { excludeFromRoute: true },
  subaccount: {},
};

const useEditorNavigation = () => {
  const history = useHistory();
  const { id, version = 'draft', navKey = '' } = useParams();
  const {
    filters: { subaccount: subaccountId },
  } = usePageFilters(initFilters);
  const [navKeyTemp, setNavKeyTemp] = useState(navKey.toLowerCase());

  const setNavigation = nextNavigationKey => {
    setNavKeyTemp(nextNavigationKey.toLowerCase());
    history.push(
      `/${routeNamespace}/edit/${id}/${version}/${nextNavigationKey}${setSubaccountQuery(
        subaccountId,
      )}`,
    );
  };

  return useMemo(() => {
    let index = links.findIndex(link => link.routeKey === navKeyTemp.toLowerCase());

    if (index === -1) {
      // no match
      index = 0;
    }

    return {
      currentNavigationIndex: index,
      currentNavigationKey: links[index].key,
      setNavigation,
    };
  }, [navKeyTemp, setNavigation]);
};

export default useEditorNavigation;
