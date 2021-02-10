/* eslint-disable */
import React from 'react';
import { useMachine, useService, useActor } from '@xstate/react';
import { analyticsReportMachine } from './machines';
import {
  Box,
  Button,
  Drawer,
  Expandable,
  Inline,
  Modal,
  Page,
  Panel,
  ScreenReaderOnly,
  Select,
  Stack,
  TextField,
  Tag,
} from 'src/components/matchbox';
import { Heading } from 'src/components/text';
import Divider from 'src/components/divider';

export function AnalyticsReportPage() {
  const [state, send, service] = useMachine(analyticsReportMachine);
  const addMetricsMachine = service.children.get('addMetricsMachine');
  console.log('addMetricsMachine', addMetricsMachine);

  // Live state machine debugging: https://xstate.js.org/docs/packages/xstate-react/#services
  React.useEffect(() => {
    const subscription = service.subscribe(state => {
      // simple state logging
      console.log(state);
    });

    return subscription.unsubscribe;
  }, [service]); // note: service should never change

  // eslint-disable-next-line
  console.log('state.value', state.value);

  return (
    <>
      <Page
        title="Analytics Report"
        primaryAction={{
          content: 'Save New Report',
          onClick: () => send('SAVE_NEW_REPORT_CLICK'),
        }}
      >
        <Stack>
          <Panel mb="0">
            <Panel.Section>
              <ScreenReaderOnly>
                <Heading as="h2">Report Settings</Heading>
              </ScreenReaderOnly>

              <Stack>
                <Box>
                  <p>// TODO: Report Typeahead goes here</p>
                </Box>

                <Inline>
                  {Boolean(state.context.report) ? (
                    <Button variant="tertiary">Edit Details</Button>
                  ) : null}

                  <Button variant="tertiary">Save Changes</Button>

                  <Button variant="tertiary">Schedule Report</Button>

                  <Button variant="tertiary">View All Reports</Button>
                </Inline>
              </Stack>
            </Panel.Section>

            <Expandable title="Metrics" variant="borderless">
              <Button variant="secondary" onClick={() => send('ADD_METRICS_CLICK')}>
                Add Metrics
              </Button>
            </Expandable>

            <Divider />

            <Expandable title="Filters" variant="borderless">
              <Button variant="secondary">Add Filters</Button>
            </Expandable>

            <Divider />

            <Expandable title="Comparisons" variant="borderless">
              <Button variant="secondary">Add Comparison</Button>
            </Expandable>
          </Panel>

          <Panel mb="0">
            <Panel.Section>
              <ScreenReaderOnly>
                <Heading as="h2">Report Charts</Heading>
              </ScreenReaderOnly>
            </Panel.Section>
          </Panel>

          <Panel mb="0">
            <Panel.Section>
              <ScreenReaderOnly>
                <Heading as="h2">Break Down Report</Heading>
              </ScreenReaderOnly>

              <Select
                id="break-down-by"
                name="breakDownBy"
                label="Break Down By"
                placeholder="Select Resource"
                placeholderValue="placeholder"
                value="placeholder"
                options={[]}
                onChange={() => {}}
              />
            </Panel.Section>
          </Panel>
        </Stack>
      </Page>

      {/* <SaveNewReportModal /> */}

      {state.matches('addingMetrics') ? <AddMetricsForm stateMachine={addMetricsMachine} /> : null}

      <Drawer
        position="right"
        open={state.matches('addingMetrics')}
        onClose={() => send('CLOSE_DRAWER')}
        portalId="drawer-portal"
      >
        <Drawer.Header showCloseButton />

        <Drawer.Content p="0">
          <form id="addingMetricsForm" onSubmit={() => {}}>
            <p>Adding metrics!</p>
          </form>
        </Drawer.Content>

        <Drawer.Footer>
          <Box display="flex">
            <Box mr="200" flex="1">
              <Button width="100%" variant="primary" type="submit" form="addingMetricsForm">
                Apply Metrics
              </Button>
            </Box>

            <Box flex="1">
              <Button width="100%" variant="secondary">
                Clear Metrics
              </Button>
            </Box>
          </Box>
        </Drawer.Footer>
      </Drawer>
    </>
  );
}

function AddMetricsForm({ stateMachine }) {
  /* eslint-disable */
  const [state, send] = useService(stateMachine);
  console.log('state', state);
  /* eslint-enable */

  return <></>;
}

// function SaveNewReportModal({ saveNewReportRef }) {

//   return (
//     <Modal
//       open={state.matches('savingNewReport')}
//       onClose={() => send('CLOSE_MODAL')}
//       closeOnEscape
//       closeOnOutsideClick
//     >
//       <Modal.Header showCloseButton>Save New Report</Modal.Header>

//       <Modal.Content>
//         <form id="saveNewReportForm" onSubmit={() => send('FORM_SUBMIT')}>
//           <Stack>
//             <TextField
//               id="save-new-report-name"
//               label="Name"
//               name="name"
//               onChange={e => send('NAME_CHANGE', { to: 'savingNewReport', value: e.target.value })}
//               value=""
//             />
//           </Stack>
//         </form>
//       </Modal.Content>

//       <Modal.Footer>
//         <Button variant="primary" type="submit" form="saveNewReportForm">
//           Save Report
//         </Button>

//         <Button variant="secondary" onClick={() => send('CLOSE_MODAL')}>
//           Cancel
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }
