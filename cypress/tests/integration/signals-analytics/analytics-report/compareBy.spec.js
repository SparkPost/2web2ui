import { FILTER_OPTIONS, PAGE_URL } from './constants';
import { commonBeforeSteps } from './helpers';

const TYPE_LABEL = 'Type';

describe('Analytics Report compare by form', () => {
  beforeEach(() => {
    commonBeforeSteps();
    cy.visit(PAGE_URL);
  });

  it('renders the compare by form when the user clicks "Add Comparison"', () => {
    openCompareByDrawer();
    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findAllByLabelText('Subaccount').should('have.length', 2);
      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .type('Fake Subaccount');
    });
  });

  it('adds additional filters when the user clicks the relevant "Add" button', () => {
    openCompareByDrawer();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Add Subaccount' }).should('not.exist');
    });
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findAllByLabelText('Subaccount').should('have.length', 2);
      cy.findByRole('button', { name: 'Add Subaccount' }).click();
      cy.findAllByLabelText('Subaccount').should('have.length', 3);
    });
  });

  it('resets form filters when clicking "Clear Filters"', () => {
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Add Subaccount' }).click();
      cy.findAllByLabelText('Subaccount').should('have.length', 3);
      cy.findByRole('button', { name: 'Clear Comparison' }).click();
      cy.findAllByLabelText('Subaccount').should('have.length', 0);
      cy.findByLabelText(TYPE_LABEL).should('have.value', null);
    });
  });

  it('unsets all existing fields when the filter type is changed', () => {
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Add Subaccount' }).click();
      cy.findAllByLabelText('Subaccount').should('have.length', 3);
      cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
      cy.findAllByLabelText('Recipient Domain').should('have.length', 2);
      cy.findAllByLabelText('Recipient Domain')
        .eq(0)
        .should('have.value', '');
      cy.findAllByLabelText('Recipient Domain')
        .eq(1)
        .should('have.value', '');
    });
  });

  it('removes relevant fields when the user clicks a "Remove Filter" button', () => {
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Remove Filter' }).should('not.exist');
      cy.findByRole('button', { name: 'Add Subaccount' }).click();
      cy.findAllByLabelText('Subaccount').should('have.length', 3);
      cy.findByRole('button', { name: 'Remove Filter' })
        .should('be.visible')
        .click();
      cy.findAllByLabelText('Subaccount').should('have.length', 2);
    });
  });

  it('submit the form and adds data to the Analytics Report state', () => {
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Compare' }).click();
    });
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.findByDataId('active-comparison-filters').within(() => {
      cy.findByText('Subaccount').should('be.visible');
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
    });

    openCompareByDrawer();

    cy.findByLabelText(TYPE_LABEL).should('have.value', 'subaccounts');
    cy.findAllByLabelText('Subaccount')
      .eq(0)
      .should('have.value', 'Fake Subaccount 1 (ID 101)');
    cy.findAllByLabelText('Subaccount')
      .eq(1)
      .should('have.value', 'Fake Subaccount 3 (ID 103)');
  });

  describe('the comparison typeahead', () => {
    // Dynamically generate a test case according to the config
    FILTER_OPTIONS.forEach(option => {
      return it(`requests data for the ${option.label} typeahead when the user searches`, () => {
        // Stub the billing request in order to ensure the "deliverability" product is present on the account
        cy.stubRequest({
          url: '/api/v1/billing/subscription',
          fixture: 'billing/subscription/200.get.include-deliverability.json',
          requestAlias: 'getBillingSubscription',
        });
        cy.visit(`${PAGE_URL}&metrics[0]=count_inbox`); // Has a "deliverability" metric selected so as to render all filter options
        cy.wait([
          '@getSubaccounts',
          '@getDeliverability',
          '@getTimeSeries',
          '@getBillingSubscription',
        ]);

        cy.stubRequest({
          url: option.url,
          fixture: option.fixture,
          requestAlias: option.requestAlias,
        });

        cy.findByRole('button', { name: 'Add Comparison' }).click();

        cy.withinDrawer(() => {
          cy.findByLabelText(TYPE_LABEL).select(option.label);
          cy.findAllByLabelText(option.label)
            .first()
            .type(option.search);

          cy.wait(`@${option.requestAlias}`).then(xhr => {
            if (xhr.url.includes('match=')) {
              cy.wrap(xhr.url).should('include', option.search);
            }
          });

          if (option.label === 'Subaccount') {
            cy.findByRole('option', { name: `${option.search} (ID 103)` })
              .should('be.visible')
              .click();
          } else {
            cy.findByRole('option', { name: option.search })
              .should('be.visible')
              .click();
          }
        });
      });
    });
  });

  it('properly submits form with custom comparisons and adds to report options', () => {
    openCompareByDrawer();

    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .type('Fa{enter}');

      cy.findAllByLabelText('Subaccount')
        .eq(1)
        .type('St{enter}');

      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .should('have.value', 'Fa');

      cy.findAllByLabelText('Subaccount')
        .eq(1)
        .should('have.value', 'St');

      cy.findByRole('button', { name: 'Compare' }).click();
    });

    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.findByDataId('active-comparison-filters').within(() => {
      cy.findByText('Subaccount').should('be.visible');
      cy.findByText('Fa').should('be.visible');
      cy.findByText('St').should('be.visible');
    });

    openCompareByDrawer();

    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).should('have.value', 'subaccounts');
      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .should('have.value', 'Fa');

      cy.findAllByLabelText('Subaccount')
        .eq(1)
        .should('have.value', 'St');
    });
  });

  it('removes tags properly when clicking on tag remove buttons', () => {
    openCompareByDrawer();
    fillOutForm();
    addOneMoreField();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Compare' }).click();
    });

    cy.findByDataId('active-comparison-filters').within(() => {
      cy.findByText('Subaccount').should('be.visible');
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
      cy.findAllByRole('button', { name: 'Remove' })
        .eq(0)
        .click();
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
    });

    //Comparison added to filters after this point if last one
    cy.findByDataId('report-options').within(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('not.exist');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
    });
  });

  it('appends to filters if 2nd to last comparison removed', () => {
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Compare' }).click();
    });

    cy.findByDataId('active-comparison-filters').within(() => {
      cy.findByText('Subaccount').should('be.visible');
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
      cy.findAllByRole('button', { name: 'Remove' })
        .eq(0)
        .click();
    });

    cy.findByDataId('active-comparison-filters').should('not.exist');

    //Comparison added to filters after this point if last one
    cy.findByDataId('report-options').within(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('not.exist');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
    });
  });

  it("doesn't render a tooltip if not truncating text in the aggregated data section", () => {
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.short.json',
    });
    openCompareByDrawer();

    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .type('Fake Subaccount');
      cy.findByText('Fake Subaccount 1 (ID 101)')
        .should('be.visible')
        .click();

      cy.findAllByLabelText('Subaccount')
        .eq(1)
        .type('Sub');
      cy.findByText('Sub 2 (ID 102)')
        .should('be.visible')
        .click();
      cy.findByRole('button', { name: 'Compare' }).click();
    });

    cy.wait(['@getDeliverability', '@getDeliverability']);

    cy.withinTooltip(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('not.exist');
    });
    cy.findByDataId('compare-by-aggregated-metrics').within(() => {
      cy.findAllByText('Fake Subaccount 1 (ID 101)')
        .eq(0)
        .should('be.visible')
        .trigger('mouseover');
    });
    cy.withinTooltip(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
    });

    cy.findByDataId('compare-by-aggregated-metrics').within(() => {
      cy.findAllByText('Fake Subaccount 1 (ID 101)')
        .eq(0)
        .should('be.visible')
        .trigger('mouseout');
    });
    cy.withinTooltip(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('not.exist');
      cy.findByText('Sub 2 (ID 102)').should('not.exist');
    });

    cy.findByDataId('compare-by-aggregated-metrics').within(() => {
      cy.findAllByText('Sub 2 (ID 102)')
        .eq(0)
        .should('be.visible')
        .trigger('mouseover');
    });
    cy.withinTooltip(() => {
      cy.findByText('Sub 2 (ID 102)').should('not.be.visible');
    });
  });

  it('submits the compare by form and renders multiple charts along with aggregated data below the charts', () => {
    // Add metrics that align with the fixture response *and* contain a dynamically calculated metric ('Accepted Rate' in this case)
    cy.findByRole('button', { name: 'Add Metrics' }).click();
    cy.withinDrawer(() => {
      cy.findByRole('checkbox', { name: 'Bounces' }).uncheck({ force: true });
      cy.findByRole('checkbox', { name: 'Unique Clicks' }).check({ force: true });
      cy.findByRole('checkbox', { name: 'Accepted Rate' }).check({ force: true });
      cy.findByRole('button', { name: 'Apply Metrics' }).click();
    });
    cy.wait(['@getDeliverability', '@getTimeSeries']);
    openCompareByDrawer();
    fillOutForm();
    cy.withinDrawer(() => {
      cy.findByRole('button', { name: 'Compare' }).click();
    });
    cy.wait(['@getDeliverability', '@getTimeSeries']);

    cy.get('.recharts-wrapper').should('have.length', 4);
    cy.findByRole('heading', { name: 'Fake Subaccount 1 (ID 101)' }).should('be.visible');
    cy.findByRole('heading', { name: 'Fake Subaccount 3 (ID 103)' }).should('be.visible');

    // TODO: When we have access to `cy.intercept()` we can separately stub each request and produce different results
    cy.findByDataId('compare-by-aggregated-metrics')
      .scrollIntoView()
      .within(() => {
        cy.findAllByText('Fake Subaccount 1 (ID 101)')
          .eq(0)
          .should('be.visible')
          .trigger('mouseover');
        cy.findAllByText('Fake Subaccount 1 (ID 101)')
          .eq(1)
          .should('be.visible'); //Tooltip

        cy.findAllByText('Fake Subaccount 3 (ID 103)')
          .eq(0)
          .should('be.visible')
          .trigger('mouseover');
        cy.findAllByText('Fake Subaccount 3 (ID 103)')
          .eq(1)
          .should('be.visible'); //Tooltip
        cy.findAllByText('Sent').should('have.length', 2);
        cy.findAllByText('325K').should('have.length', 2);
        cy.findAllByText('Unique Confirmed Opens').should('have.length', 2);
        cy.findAllByText('250K').should('have.length', 2);
        cy.findAllByText('Accepted').should('have.length', 2);
        cy.findAllByText('200K').should('have.length', 2);
        cy.findAllByText('Unique Clicks').should('have.length', 2);
        cy.findAllByText('150K').should('have.length', 2);
        cy.findAllByText('Accepted Rate').should('have.length', 2);
        cy.findAllByText('61.54%').should('have.length', 2); // `count_accepted` divided by `count_sent`
      });
  });

  it('shows a form error if the form contains fewer than 2 filters', () => {
    openCompareByDrawer();
    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findAllByLabelText('Subaccount').should('have.length', 2);
      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .type('Fake Subaccount');
      cy.findByText('Fake Subaccount 1 (ID 101)')
        .should('be.visible')
        .click();
      cy.findByRole('button', { name: 'Compare' }).click();
      cy.findByText('Select more than one item to compare').should('exist');
    });
  });

  it('shows a form warning if 10 comparison filters are used', () => {
    cy.stubRequest({
      url: '/api/v1/subaccounts',
      fixture: 'subaccounts/200.get.many.json',
      requestAlias: 'getManySubaccounts',
    });

    cy.visit(PAGE_URL);
    cy.wait(['@getManySubaccounts', '@getDeliverability', '@getTimeSeries']);

    openCompareByDrawer();
    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');

      cy.findAllByLabelText('Subaccount')
        .eq(0)
        .type('Fake Subaccount');
      cy.findByText('Fake Subaccount 1 (ID 101)')
        .should('be.visible')
        .click({ force: true });
      cy.findAllByLabelText('Subaccount')
        .eq(1)
        .type('Fake Subaccount');
      cy.findByText('Fake Subaccount 2 (ID 102)')
        .should('be.visible')
        .click();

      Array(7)
        .fill()
        .forEach((_item, index) => {
          cy.findByRole('button', { name: 'Add Subaccount' })
            .scrollIntoView()
            .click({ force: true });
          cy.findAllByLabelText('Subaccount')
            .eq(index + 2)
            .scrollIntoView()
            .type('Fake Subaccount');
          cy.findByText(`Fake Subaccount ${index + 3} (ID 10${index + 3})`)
            .scrollIntoView()
            .should('be.visible')
            .click();
        });

      cy.findByRole('button', { name: 'Add Subaccount' })
        .scrollIntoView()
        .click({ force: true });
      cy.findAllByLabelText('Subaccount')
        .eq(9)
        .scrollIntoView()
        .type('Fake Subaccount');

      cy.findByText(`Fake Subaccount 10 (ID 110)`)
        .scrollIntoView()
        .should('be.visible')
        .click();

      cy.findByText('Limit on number of comparisons reached')
        .scrollIntoView()
        .should('be.visible');
      cy.findByRole('button', { name: 'Add Subaccount' }).should('not.exist');

      cy.findAllByRole('button', { name: 'Remove Filter' })
        .eq(8)
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      cy.findByText('Limit on number of comparisons reached').should('not.exist');
    });
  });

  it('loads the form according to the URL query parameters', () => {
    cy.visit(
      '/signals/analytics?comparisons%5B0%5D%5Btype%5D=Subaccount&comparisons%5B0%5D%5Bvalue%5D=Fake%20Subaccount%201%20%28ID%20101%29&comparisons%5B0%5D%5Bid%5D=101&comparisons%5B1%5D%5Btype%5D=Subaccount&comparisons%5B1%5D%5Bvalue%5D=Fake%20Subaccount%203%20%28ID%20103%29&comparisons%5B1%5D%5Bid%5D=103',
    );
    cy.wait(['@getSubaccounts', '@getDeliverability', '@getTimeSeries']);

    openCompareByDrawer();
    cy.findByLabelText(TYPE_LABEL).should('have.value', 'subaccounts');
    cy.findAllByLabelText('Subaccount')
      .eq(0)
      .should('have.value', 'Fake Subaccount 1 (ID 101)');
    cy.findAllByLabelText('Subaccount')
      .eq(1)
      .should('have.value', 'Fake Subaccount 3 (ID 103)');
  });
});

function openCompareByDrawer() {
  cy.findByRole('button', { name: 'Add Comparison' }).click();
}

function fillOutForm() {
  cy.withinDrawer(() => {
    cy.findByLabelText(TYPE_LABEL).select('Subaccount');
    cy.findAllByLabelText('Subaccount')
      .eq(0)
      .type('Fake Subaccount');
    cy.findByText('Fake Subaccount 1 (ID 101)')
      .should('be.visible')
      .click();

    cy.findAllByLabelText('Subaccount')
      .eq(1)
      .type('Fake Subaccount');
    cy.findByText('Fake Subaccount 3 (ID 103)')
      .should('be.visible')
      .click();
  });
}

function addOneMoreField() {
  cy.findByRole('button', { name: 'Add Subaccount' }).click();
  cy.findAllByLabelText('Subaccount')
    .eq(2)
    .type('Fake Subaccount');
  cy.findByText('Fake Subaccount 2 (ID 102)')
    .should('be.visible')
    .click();
}
