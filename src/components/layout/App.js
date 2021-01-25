import React from 'react';
import cx from 'classnames';
import Navigation from 'src/components/navigation/Navigation';
import { Header as HibanaHeader, Footer } from 'src/components/hibana';
import WindowSize from 'src/context/WindowSize';
import { BannerContext } from 'src/context/GlobalBanner';
import withContext from 'src/context/withContext';
import { useHibana } from 'src/context/HibanaContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import ScrollToTop from './components/ScrollToTop';
import FeedbackButton from './components/FeedbackButton';
import OGStyles from './Layout.module.scss';
import hibanaStyles from './LayoutHibana.module.scss';

export const App = ({ children, bannerOpen }) => {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return (
    <WindowSize>
      <div className={cx(styles.wrapper, styles.app)}>
        {isHibanaEnabled ? <HibanaHeader className={styles.header} /> : <Navigation />}

        <main
          role="main"
          tabIndex="-1"
          id="main-content"
          className={cx(styles.content, bannerOpen && styles.bannerOpen)}
        >
          <div className={styles.container}>
            {children}

            <FeedbackButton />
          </div>
        </main>

        {isHibanaEnabled && <Footer />}

        <ScrollToTop />
      </div>
    </WindowSize>
  );
};

export default withContext(BannerContext, App);
