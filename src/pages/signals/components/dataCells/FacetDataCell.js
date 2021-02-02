import React from 'react';
import classNames from 'classnames';
import { PageLink } from 'src/components/links';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { setSubaccountQuery } from 'src/helpers/subaccounts';
import OGStyles from './DataCell.module.scss';
import hibanaStyles from './DataCellHibana.module.scss';

const FacetDataCell = ({ dimension, facet, id, name, subaccountId, truncate }) => {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  if (facet === 'sid' && id === -1) {
    return (
      <div className={classNames(styles.PaddedCell, truncate && styles.OverflowCell)}>
        Primary & All Subaccounts
      </div>
    );
  }

  //This is the default case for the label. The condition below is for special cases.
  let label = name ? `${name} (${id})` : id;
  if (facet === 'sid' && id === 0) {
    label = 'Primary Account';
  }

  //To handle any strange mailbox provider names; ie: Hotmail / Outlook
  const facetIdURL = 'mb_provider' ? encodeURIComponent(id) : id;

  const search = subaccountId >= 0 ? setSubaccountQuery(subaccountId) : undefined;

  return (
    <div className={classNames(styles.PaddedCell, truncate && styles.OverflowCell)}>
      <PageLink
        children={label}
        to={{
          pathname: `/signals/${dimension}/${facet}/${facetIdURL}`,
          search,
        }}
      />
    </div>
  );
};

export default FacetDataCell;
