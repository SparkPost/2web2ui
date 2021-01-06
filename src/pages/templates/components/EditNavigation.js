import React from 'react';
import classNames from 'classnames';
import { ButtonLink } from 'src/components/links';
import links from '../constants/editNavigationLinks';
import SavedIndicator from './SavedIndicator';
import useEditorContext from '../hooks/useEditorContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import OGStyles from './EditNavigation.module.scss';
import hibanaStyles from './EditNavigationHibana.module.scss';

const EditNavigation = ({ primaryArea }) => {
  const { currentNavigationKey, setNavigation, hasSaved } = useEditorContext();
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return (
    <nav className={styles.Navigation} aria-label="Templates">
      <div className={styles.NavigationLinks}>
        {links.map(({ key, content }) => (
          <ButtonLink
            key={key}
            className={classNames(styles.NavigationLink, {
              [styles.active]: key === currentNavigationKey,
            })}
            onClick={() => setNavigation(key)}
            data-id={`subnav-link-${key}`}
          >
            {content}
          </ButtonLink>
        ))}
      </div>
      <div className={styles.NavigationPrimaryArea}>
        <SavedIndicator hasSaved={hasSaved} />

        {primaryArea}
      </div>
    </nav>
  );
};

export default EditNavigation;
