import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
import styled from 'styled-components';
import { ChevronRight } from '@sparkpost/matchbox-icons';
import { tokens } from '@sparkpost/design-tokens-hibana';
import { ScreenReaderOnly, WindowEvent } from 'src/components/matchbox';
import { selectHibanaAccountNavItems } from 'src/selectors/navItems';
import SparkPost from 'src/components/sparkPost/SparkPost';
import styles from './MobileNavigation.module.scss';

const Menu = {
  Wrapper,
  ToggleButton,
  Item,
  ChildItem,
  ExpandableButton,
  ExpandableContent,
};

function MobileNavigation(props) {
  const { navItems, accountItems, currentUser, dispatch } = props;
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen(!isOpen);

  const handleAccountItemClick = accountItem => {
    if (accountItem.action) {
      dispatch(accountItem.action());
    }

    handleToggle();
  };

  return (
    <div className={styles.MobileNavigation} data-id="mobile-navigation">
      {/* Prevents scrolling behind the navigation UI when opened */}
      {isOpen
        ? document.body.setAttribute('style', 'overflow-y: hidden')
        : document.body.setAttribute('style', 'overflow-y: initial')}

      {/* Keyboard focus is trapped within the element when opened */}
      {/* See: https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/ for more info on tab traps! */}
      <FocusLock disabled={!isOpen}>
        <div className={styles.Header}>
          <Link to="/landing" onClick={() => setIsOpen(false)}>
            {/* SVG label hidden from screen readers in favor of simpler ScreenReaderOnly content */}
            <SparkPost.Icon className={styles.Logo} aria-hidden="true" />

            <ScreenReaderOnly>SparkPost</ScreenReaderOnly>
          </Link>

          <Menu.ToggleButton onClick={handleToggle} isOpen={isOpen} />
        </div>

        <Menu.Wrapper onOverlayClick={handleToggle} isOpen={isOpen}>
          {currentUser && (
            <div className={styles.MenuMeta}>
              {currentUser.email && <div className={styles.MenuUserInfo}>{currentUser.email}</div>}

              {(currentUser.customer || currentUser.access_level) && (
                <div className={styles.MenuUserSupplemental}>
                  {currentUser.customer ? currentUser.customer : currentUser.access_level}
                </div>
              )}
            </div>
          )}

          {navItems.map(item => {
            const isExpandable = Boolean(item.children && item.children.length);
            const uniqueID = `mobile-nav-${item.label.toLowerCase().replace(/\s/g, '')}`;

            if (isExpandable) {
              return (
                <Menu.Item
                  onClick={() => setIsOpen(false)}
                  variant="primary"
                  id={uniqueID}
                  key={uniqueID}
                >
                  <Menu.ExpandableButton>{item.label}</Menu.ExpandableButton>

                  <Menu.ExpandableContent>
                    {item.children.map((childItem, childIndex) => {
                      return (
                        <Menu.ChildItem
                          onClick={handleToggle}
                          to={childItem.to}
                          key={`mobile-nav-child-item-${childIndex}`}
                        >
                          {childItem.label}
                        </Menu.ChildItem>
                      );
                    })}
                  </Menu.ExpandableContent>
                </Menu.Item>
              );
            }

            return (
              <Menu.Item variant="primary" onClick={handleToggle} to={item.to} key={uniqueID}>
                {item.label}
              </Menu.Item>
            );
          })}

          <div className={styles.Footer}>
            {accountItems.map((item, index) => {
              return (
                <Menu.Item
                  onClick={() => handleAccountItemClick(item)}
                  variant="secondary"
                  to={item.to}
                  action={item.action}
                  key={`mobile-account-item-${index}`}
                  external={item.external}
                >
                  {item.label}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Wrapper>
      </FocusLock>
    </div>
  );
}

function Wrapper(props) {
  const { children, onOverlayClick, isOpen } = props;
  const { motionDuration_medium } = tokens;
  const menuEl = useRef(null);
  const motionDurationMS = Number(motionDuration_medium.replace(/\D/g, '')) * 100;

  return (
    <Transition in={isOpen} timeout={motionDurationMS} onEntered={() => menuEl.current.focus()}>
      {state => (
        <div className={classNames(styles.MenuWrapper, styles[state])}>
          <nav
            ref={menuEl}
            tabIndex="-1"
            aria-labelledby="mobile-primary-nav-heading"
            className={classNames(styles.Menu, styles[state])}
            id="mobile-navigation-menu"
          >
            <ScreenReaderOnly as="div">
              <h2 id="mobile-primary-nav-heading">Main</h2>
            </ScreenReaderOnly>

            {/* wrapping <div> helps with :first-child styles */}
            <div>{children}</div>
          </nav>

          <div
            onClick={onOverlayClick}
            className={classNames(styles.Overlay, styles[state])}
            role="presentation"
          ></div>
        </div>
      )}
    </Transition>
  );
}

function Item(props) {
  const { children, id, to, variant, onClick, action, external } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const itemClassNames = classNames(styles.MenuItem, styles[variant]);
  const contentClassNames = styles.MenuItemContent;

  if (to) {
    if (external) {
      return (
        <a className={itemClassNames} href={to}>
          <div className={contentClassNames}>{children}</div>
        </a>
      );
    }
    return (
      <Link onClick={onClick} className={itemClassNames} to={to}>
        <div className={contentClassNames}>{children}</div>
      </Link>
    );
  }

  if (action) {
    return (
      <button onClick={onClick} className={itemClassNames}>
        <div className={contentClassNames}>{children}</div>
      </button>
    );
  }

  return (
    <>
      {React.Children.map(children, child => {
        if (child.type === ExpandableButton) {
          return React.cloneElement(child, {
            id,
            isExpanded,
            variant,
            onClick: () => setIsExpanded(!isExpanded),
          });
        }

        if (child.type === ExpandableContent) {
          return React.cloneElement(child, { id, isExpanded });
        }
      })}
    </>
  );
}

function ChildItem({ children, to, onClick }) {
  return (
    <Link onClick={onClick} className={styles.ChildItem} to={to}>
      <div className={styles.MenuItemContent}>{children}</div>
    </Link>
  );
}

function ToggleButton(props) {
  const { onClick, isOpen } = props;
  const buttonEl = useRef(null);

  const handleKeydown = e => {
    if (e.key === 'Escape') {
      onClick();
      buttonEl.current.focus();
    }
  };

  return (
    <>
      {isOpen && <WindowEvent event="keydown" handler={handleKeydown} />}

      <button
        className={styles.ToggleButton}
        onClick={onClick}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-controls="mobile-navigation-menu"
        ref={buttonEl}
      >
        <div className={classNames(styles.Hamburger, isOpen && styles.showClose)}>
          <span />
        </div>
        <ScreenReaderOnly>Menu</ScreenReaderOnly>
      </button>
    </>
  );
}

function ExpandableButton(props) {
  const { onClick, id, children, isExpanded, variant } = props;

  return (
    <button
      className={classNames(
        styles.MenuItem,
        styles.ExpandableButton,
        styles[variant],
        isExpanded && styles.isExpanded,
      )}
      onClick={onClick}
      aria-expanded={isExpanded ? 'true' : 'false'}
      aria-controls={`${id}-mobile-menu-expandable-content`}
    >
      <div className={styles.MenuItemContent}>
        {children}

        <ChevronRight
          className={classNames(styles.ExpandableIcon, isExpanded && styles.isExpanded)}
        />
      </div>
    </button>
  );
}

const StyledExpandableContent = styled.div`
  display: ${props => (props.isExpanded ? 'block' : 'none')};
`;

function ExpandableContent(props) {
  const { id, children, isExpanded } = props;

  return (
    <StyledExpandableContent id={`${id}-mobile-menu-expandable-content`} isExpanded={isExpanded}>
      {children}
    </StyledExpandableContent>
  );
}

const mapStateToProps = state => ({
  currentUser: state.currentUser,
  accountItems: selectHibanaAccountNavItems(state),
});

export default connect(mapStateToProps)(MobileNavigation);
