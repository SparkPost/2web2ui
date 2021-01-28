import React from 'react';
import styled from 'styled-components';
import {
  Banner,
  Panel,
  Stack,
  Toggle,
  Columns,
  Column,
  ScreenReaderOnly,
} from 'src/components/matchbox';
import LabelledValue from 'src/components/labelledValue/LabelledValue';

const RightAlignedText = styled.div`
  text-align: right;
`;

export const TogglePanelSection = ({
  readOnly,
  tfaRequired,
  toggleTfaRequired,
  tfaRequiredEnforced,
}) => {
  const tfaRequiredOrEnforced = tfaRequired || tfaRequiredEnforced;
  const tfaRequiredMsg = tfaRequiredOrEnforced
    ? 'All users must have two-factor authentication enabled to login to this account.'
    : 'Each user can manage their own two-factor authentication settings.';
  return (
    <Panel.LEGACY.Section>
      <Stack>
        <Columns>
          <Column width={2 / 3}>
            {tfaRequiredEnforced && (
              <Banner size="small">Two-factor authentication is required for your account.</Banner>
            )}
          </Column>
        </Columns>
        <Columns>
          <Column width={2 / 3}>
            <LabelledValue label="Status">
              <strong>{tfaRequiredOrEnforced ? 'Required' : 'Optional'}</strong>
              <p>{tfaRequiredMsg}</p>
            </LabelledValue>
          </Column>
          <Column width={1 / 3}>
            <RightAlignedText>
              <Toggle
                label={<ScreenReaderOnly>Enforce TFA</ScreenReaderOnly>}
                labelHidden
                disabled={readOnly || tfaRequiredEnforced}
                checked={tfaRequiredOrEnforced}
                onChange={toggleTfaRequired}
              />
            </RightAlignedText>
          </Column>
        </Columns>
      </Stack>
    </Panel.LEGACY.Section>
  );
};

export default TogglePanelSection;
