import React from 'react';
import { CheckCircle, Send } from '@sparkpost/matchbox-icons';
import {
  Card,
  CenteredLogo,
  RecipientValidationPriceTable,
  CardTitle,
  CardContent,
} from 'src/components';
import { PageLink } from 'src/components/links';
import { Button, Modal, Panel, Stack, UnstyledLink } from 'src/components/matchbox';
import { Heading } from 'src/components/text';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import OGStyles from './RVBundlePage.module.scss';
import HibanaStyles from './RVBundlePageHibana.module.scss';

const RVPriceModal = ({ open, onClose }) => (
  <Modal.LEGACY
    open={open}
    onClose={onClose}
    showCloseButton
    title="Onboarding Recipient Validation Pricing Modal"
  >
    <Panel.LEGACY sectioned title="Pay-As-You-Go Pricing">
      <p>
        We have a monthly pay-as-you-go plan using tiered pricing. The more you validate, the less
        you pay per message.
      </p>
      <RecipientValidationPriceTable />
    </Panel.LEGACY>
  </Modal.LEGACY>
);

const RVBundlePage = () => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <div className={styles.Header}>
        <Stack>
          <CenteredLogo />
          <Heading as="h1" looksLike="h2">
            You're Almost There...
          </Heading>
          <p>
            Here at SparkPost we do it all! As part of our Recipient Validation service we also
            provide a SparkPost sending account. Make every email count and start verifying.
          </p>
        </Stack>
      </div>
      <Panel.LEGACY>
        <Panel.LEGACY.Section>
          <Stack>
            <p>
              Take a look at what's included in our Recipient Validation service and then start
              validating.
            </p>
            <div className={styles.Grid}>
              <Card>
                <CardTitle level="2">
                  <CheckCircle className={styles.ValidationIcon} size={22} />
                  Recipient Validation
                </CardTitle>
                <CardContent>
                  <Stack>
                    <p>
                      With our monthly pay-as-you-go plan using tiered pricing, the more you
                      validate, the less you pay per message.
                    </p>
                    <p>
                      <UnstyledLink
                        title="Opens a pricing dialog"
                        role="button"
                        href="#"
                        onClick={event => {
                          event.preventDefault();
                          setModalOpen(true);
                        }}
                      >
                        See Pricing
                      </UnstyledLink>
                    </p>
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardTitle level="2">
                  <Send className={styles.SendIcon} size={22} />
                  Email Messaging
                </CardTitle>
                <CardContent>
                  <Stack>
                    <p>
                      A full featured FREE test account is standard with all SparkPost accounts:
                    </p>
                    <ul>
                      <li>500 emails/month included for testing.</li>
                      <li>Access to all our powerful API features.</li>
                      <li>Free technical support to get you up and running.</li>
                    </ul>
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Stack>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <PageLink as={Button} variant="primary" to="/recipient-validation">
            Start Validating
          </PageLink>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
      <RVPriceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default RVBundlePage;
