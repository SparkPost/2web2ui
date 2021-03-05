import React from 'react';
import { Button, Modal, Text, Radio, Stack } from 'src/components/matchbox';
import { Bold, TranslatableText } from 'src/components/text';
import { useForm } from 'react-hook-form';
import useDomains from '../hooks/useDomains';
import { Form } from 'src/components/form';

export function DomainAlignmentModal(props) {
  const { isOpen, onSubmit, onClose } = props;
  const { register, handleSubmit } = useForm({
    defaultValues: {
      strictalignment: 'yes',
    },
  });
  const { createPending } = useDomains();
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header showCloseButton>Domain Alignment</Modal.Header>
      <Modal.Content>
        <Stack>
          <Text>
            Alignment in email refers to the relationship between the sending and bounce domain used
            for outbound messages.
          </Text>
          <Text>
            <Bold>Strict </Bold>
            <TranslatableText>
              alignment is when sending and bounce domain are the same value (e.g. sending domain =
              sparkpost.com and bounce domain = sparkpost.com)
            </TranslatableText>
          </Text>
          <Text>
            <Bold>Relaxed </Bold>
            <TranslatableText>
              alignment is when bounce domain is a subdomain of the sending domain (e.g. sending
              domain = sparkpost.com while bounce domain = bounces.sparkpost.com)
            </TranslatableText>
          </Text>
          <Text>
            Use of strict or relaxed alignment is considered best practice by many mailbox
            providers. Note, there is no inherent advantage to one over the other.
          </Text>
          <Form onSubmit={handleSubmit(onSubmit)} id="domain-alignment-form">
            <Radio.Group label="Verify domain for bounce for strict alignment">
              <Radio
                ref={register}
                label="Yes"
                id="yes-to-strict-alignment"
                value="yes"
                name="strictalignment"
                disabled={createPending}
              />
              <Radio
                ref={register}
                label="No"
                id="no-to-strict-alignment"
                value="no"
                name="strictalignment"
                disabled={createPending}
              />
            </Radio.Group>
          </Form>
        </Stack>
      </Modal.Content>
      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          form="domain-alignment-form"
          loading={createPending}
          loadingLabel="Loading"
        >
          Save and Continue
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
