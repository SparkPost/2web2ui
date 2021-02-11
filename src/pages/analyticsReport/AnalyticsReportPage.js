import React from 'react';
import { useMachine, useService } from '@xstate/react';
import {
  Box,
  Button,
  Checkbox,
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
} from 'src/components/matchbox';
import { Heading } from 'src/components/text';
import Divider from 'src/components/divider';
import {
  analyticsReportMachine,
  METRICS_FORM_MACHINE_ID,
  CREATE_REPORT_FORM_MACHINE_ID,
} from './machines';

/* eslint-disable no-console */
export function AnalyticsReportPage() {
  const [state, send, service] = useMachine(analyticsReportMachine);
  const addMetricsMachine = service.children.get(METRICS_FORM_MACHINE_ID);
  const createReportMachine = service.children.get(CREATE_REPORT_FORM_MACHINE_ID);
  console.log('addMetricsMachine', addMetricsMachine);

  // Live state machine debugging: https://xstate.js.org/docs/packages/xstate-react/#services
  React.useEffect(() => {
    const subscription = service.subscribe(state => {
      // simple state logging
      console.log(state);
    });

    return subscription.unsubscribe;
  }, [service]); // note: service should never change

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
                  <p>TODO: Report Typeahead goes here</p>
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

      <Drawer
        open={state.matches('addingMetrics')}
        onClose={() => send('CLOSE_DRAWER')}
        position="right"
        id="analytics-report-drawer"
        portalId="drawer-portal"
      >
        <Drawer.Header showCloseButton />

        <Drawer.Content p="0">
          {state.matches('addingMetrics') ? <MetricsForm stateMachine={addMetricsMachine} /> : null}
        </Drawer.Content>
      </Drawer>

      {/* TODO: Animation does not work - truthfully, Drawer and Modal should open/close on mount/unmount vs. a prop */}
      {state.matches('creatingReport') && (
        <CreateReportModal onClose={() => send('CLOSE_MODAL')} stateMachine={createReportMachine} />
      )}
    </>
  );
}

function MetricsForm({ stateMachine }) {
  const [_state, send] = useService(stateMachine);

  return (
    <form id="addingMetricsForm" onSubmit={() => send('SUBMIT_FORM')}>
      <p>TODO: Metrics checkboxes go here</p>

      <Drawer.Footer>
        <Box display="flex">
          <Box mr="200" flex="1">
            <Button width="100%" variant="primary" type="submit">
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
    </form>
  );
}

function CreateReportModal({ onClose, stateMachine }) {
  const [_state, send] = useService(stateMachine);

  return (
    <Modal open={true} onClose={onClose}>
      <Modal.Header showCloseButton>Saving New Report</Modal.Header>

      <Modal.Content>
        <form id="createReportForm" onSubmit={() => send('SUBMIT_FORM')}>
          <Stack>
            <TextField label="Name" name="name" id="create-report-name" type="text" value="" />

            <TextField
              label="Description"
              name="description"
              id="create-report-description"
              placeholder="Enter short description for your report"
              multiline
              value=""
            />

            <Checkbox.Group label="Editable">
              <Checkbox
                id="create-report-editable"
                label="Allow others to edit report"
                checked=""
              />
            </Checkbox.Group>
          </Stack>
        </form>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="primary" type="submit" form="createReportForm">
          Save Report
        </Button>

        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// function SaveNewReportModal({ saveNewReportRef }) {

//   return (
//     <Modal
//       open={state.matches('creatingReport')}
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
//               onChange={e => send('NAME_CHANGE', { to: 'creatingReport', value: e.target.value })}
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
