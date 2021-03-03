import React, { useMemo } from 'react';
import { Check, ViewModule } from '@sparkpost/matchbox-icons';
import { Button, Panel } from 'src/components/matchbox';
import { PLAN_TIERS } from 'src/constants';
import PlanPrice from 'src/components/billing/PlanPrice';
import FeatureComparisonModal from './FeatureComparisonModal';
import cx from 'classnames';
import _ from 'lodash';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { useModal } from 'src/hooks';
import OGStyles from './PlanSelect.module.scss';
import HibanaStyles from './PlanSelectHibana.module.scss';
import PromoCodeNew from 'src/components/billing/PromoCodeNew';

export function SelectedPlan({ bundle, onChange, promoCodeObj, handlePromoCode }) {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);

  const { messaging: plan, tier } = bundle;
  const { price } = plan;

  const { closeModal, openModal, isModalOpen } = useModal();
  const { selectedPromo } = promoCodeObj;
  return (
    <Panel.LEGACY
      title="Your New Plan"
      actions={[
        {
          content: (
            <span>
              Compare Features <ViewModule />
            </span>
          ),
          onClick: openModal,
          color: 'orange',
        },
      ]}
    >
      <FeatureComparisonModal open={isModalOpen} handleClose={closeModal} />
      <Panel.LEGACY.Section>
        <div className={styles.SelectedPlan}>
          <div className={styles.tierLabel}>{PLAN_TIERS[tier]}</div>
          <div className={styles.PlanRow}>
            <div>
              <PlanPrice showOverage showIp showCsm plan={plan} selectedPromo={selectedPromo} />
            </div>
            <div>
              <Button onClick={() => onChange()} size="small" flat color="orange">
                Change
              </Button>
            </div>
          </div>
        </div>
      </Panel.LEGACY.Section>
      {price > 0 && (
        <Panel.LEGACY.Section>
          <div className={styles.PlanRow}>
            <PromoCodeNew
              key={selectedPromo.promoCode || 'promocode'}
              promoCodeObj={promoCodeObj}
              handlePromoCode={handlePromoCode}
            />
          </div>
        </Panel.LEGACY.Section>
      )}
    </Panel.LEGACY>
  );
}

export default function PlanSelectSection({ bundles, currentPlan, onSelect }) {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const publicBundlesByTier = useMemo(
    () =>
      _.groupBy(
        bundles.filter(x => x.status !== 'secret'),
        'tier',
      ),
    [bundles],
  );
  const { closeModal, openModal, isModalOpen } = useModal();
  const planList = _.map(
    PLAN_TIERS,
    (label, key) =>
      publicBundlesByTier[key] && (
        <Panel.LEGACY.Section key={`tier_section_${key}`}>
          <div className={styles.tierLabel}>{label}</div>
          <div className={styles.tierPlans}>
            {publicBundlesByTier[key].map(bundle => {
              const { messaging, bundle: bundleCode } = bundle;
              const isCurrentPlan = currentPlan.code === bundleCode;
              return (
                <div
                  className={cx(styles.PlanRow, isCurrentPlan && styles.SelectedPlan)}
                  key={`plan_row_${bundleCode}`}
                >
                  <div>
                    {isCurrentPlan && <Check className={styles.CheckIcon} />}
                    <PlanPrice showOverage showIp showCsm plan={messaging} />
                  </div>
                  <div>
                    <Button
                      className={styles.selectButton}
                      disabled={isCurrentPlan}
                      onClick={() => onSelect(bundleCode)}
                      data-id={`select-plan-${bundleCode}`}
                      size="small"
                      variant="monochrome-secondary"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel.LEGACY.Section>
      ),
  );

  return (
    <Panel.LEGACY
      title="Select a Plan"
      actions={[
        {
          content: (
            <span>
              Compare Features <ViewModule />
            </span>
          ),
          onClick: openModal,
          color: 'orange',
        },
      ]}
    >
      <FeatureComparisonModal open={isModalOpen} handleClose={closeModal} />
      {planList}
    </Panel.LEGACY>
  );
}
