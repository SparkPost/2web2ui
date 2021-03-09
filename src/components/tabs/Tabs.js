import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Tabs as TabsComponent } from 'src/components/matchbox';
import useTabs from 'src/hooks/useTabs';

const TabPanel = styled.div`
  display: ${props => (props.forceRender && !props.selected ? 'none' : 'initial')};
`;

function Tabs(props) {
  const { children, defaultTabIndex = 0, forceRender = false, tabs: setTabs, ...rest } = props;

  const [selectedTabIndex, tabs] = useTabs(setTabs, defaultTabIndex);
  return (
    <>
      {tabs.length > 1 && <TabsComponent tabs={tabs} selected={selectedTabIndex} {...rest} />}
      {React.Children.toArray(children)
        //first removes all null react nodes in the case of conditional rendering
        .filter(Boolean)
        .map((child, index) => {
          return React.cloneElement(child, { forceRender, selected: selectedTabIndex === index });
        })}
    </>
  );
}

function Item(props) {
  const { forceRender, selected, children } = props;

  //Prevent rendering the tab children unless tab has already been selected before
  const [hasRendered, setHasRendered] = useState(false);
  useEffect(() => {
    if (selected && !hasRendered) {
      setHasRendered(true);
    }
  }, [hasRendered, selected]);

  return (
    <TabPanel role="tabpanel" forceRender={forceRender} selected={selected}>
      {(forceRender || selected) && hasRendered ? children : null}
    </TabPanel>
  );
}

Tabs.Item = Item;

export default Tabs;
