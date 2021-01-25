import { PAGE_URL } from './constants';
import {
  commonBeforeSteps,
  getFilterTags,
  getFilterGroupings,
  stubDeliverability,
  stubTimeSeries,
} from './helpers';

const TYPE_LABEL = 'Type';
const COMPARE_BY_LABEL = 'Compare By';

describe('Analytics Report filters form', () => {
  beforeEach(() => {
    commonBeforeSteps();
  });

  it('clears current filter values when the user swaps between "compare by" values', () => {
    navigateToForm();

    cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
    cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
    cy.findByLabelText('Sending Domain').type('hello.com world.org ');
    cy.findByText('hello.com').should('be.visible');
    cy.findByText('world.org').should('be.visible');
    cy.findByLabelText(COMPARE_BY_LABEL).select('does not contain');
    cy.findByText('hello.com').should('not.exist');
    cy.findByText('world.org').should('not.exist');
  });

  it('validates the user\'s entry performing a "contains" or "does not contain" filter', () => {
    navigateToForm();

    cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
    cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
    cy.findByLabelText('Sending Domain').type('hello.com ');
    cy.findByText('hello.com').should('be.visible');

    // The error renders until the user resolves the length bug on change
    cy.findByLabelText('Sending Domain').type('h ');
    cy.findByText('3 or more characters required').should('be.visible');
    cy.findByLabelText('Sending Domain').type('e');
    cy.findByText('3 or more characters required').should('be.visible');
    cy.findByLabelText('Sending Domain').type('l');
    cy.findByText('3 or more characters required').should('not.exist');
    cy.findByLabelText('Sending Domain').clear();

    // The error is removed when the user deletes all of their entry
    cy.findByLabelText('Sending Domain').type('he ');
    cy.findByText('3 or more characters required').should('be.visible');
    cy.findByLabelText('Sending Domain').clear();
    cy.findByText('3 or more characters required').should('not.exist');

    // The error also renders on blur when the user's entry violates the requirements
    cy.findByLabelText('Sending Domain')
      .type('he')
      .blur();
    cy.findByText('3 or more characters required').should('be.visible');
    cy.findByLabelText('Sending Domain').type('l');
    cy.findByText('3 or more characters required').should('not.exist');
    cy.findByLabelText('Sending Domain')
      .type('lo.net')
      .blur();
    cy.findByText('hello.net').should('be.visible');
  });

  it('only renders the "is equal to" and "is not equal to" comparison options when the user selects the "Subaccount" filter type', () => {
    navigateToForm();

    cy.findByLabelText(TYPE_LABEL).select('Subaccount');
    cy.findByLabelText(COMPARE_BY_LABEL).within(() => {
      cy.findByRole('option', { name: 'contains' }).should('not.exist');
      cy.findByRole('option', { name: 'does not contain' }).should('not.exist');
      cy.findByRole('option', { name: 'is equal to' }).should('exist');
      cy.findByRole('option', { name: 'is not equal to' }).should('exist');
    });

    cy.findByLabelText(TYPE_LABEL).select('Template');
    cy.findByLabelText(COMPARE_BY_LABEL).within(() => {
      cy.findByRole('option', { name: 'contains' }).should('exist');
      cy.findByRole('option', { name: 'does not contain' }).should('exist');
      cy.findByRole('option', { name: 'is equal to' }).should('exist');
      cy.findByRole('option', { name: 'is not equal to' }).should('exist');
    });
  });

  it('allows the user to control the comparison type via "AND" and "OR" radio buttons', () => {
    navigateToForm();

    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
      cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
      cy.findByLabelText('Sending Domain').type('hello ');
      cy.findByRole('button', { name: 'Add And Filter' }).should('be.visible');
      cy.findAllByText('And').should('have.length', 4); // Two "And" buttons, comparison text, and some screen reader only content
      cy.findByRole('radio', { name: 'Or' }).check({ force: true });
      cy.findByRole('button', { name: 'Add And Filter' }).should('not.exist');
      cy.findByRole('button', { name: 'Add Or Filter' }).click();
      cy.findAllByText('Or').should('have.length', 2); // The button and the comparison text
    });
  });

  it('allows for removal of empty filter groups when no filters are present', () => {
    navigateToForm();

    cy.withinDrawer(() => {
      // Verifying remove button rendering within the first group
      cy.findByLabelText(TYPE_LABEL).select('Campaign');
      cy.findByLabelText(COMPARE_BY_LABEL).select('does not contain');
      cy.findByLabelText('Campaign').type('my-campaign will work well ');
      cy.findByRole('button', { name: 'Add And Filter' }).click();
      getGroupingByIndex(0).within(() => {
        cy.findAllByRole('button', { name: 'Remove Filter' }).should('have.length', 2);
      });

      // Verifying remove button rendering within new groups
      cy.findByRole('button', { name: 'Add And Grouping' }).click();
      getGroupingByIndex(1).within(() => {
        cy.findByRole('button', { name: 'Remove Filter' })
          .should('be.visible')
          .click();
      });
      getGroupingByIndex(0).should('be.visible');
      getGroupingByIndex(1).should('not.exist');

      // Verifying groups are removed appropriately
      cy.findByRole('button', { name: 'Add And Grouping' }).click();
      getGroupingByIndex(1).within(() => {
        cy.findByLabelText(TYPE_LABEL).select('Template');
        cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
        cy.findByLabelText('Template').type('my favorite template ');
      });
      cy.findByRole('button', { name: 'Add And Grouping' }).click();
      getGroupingByIndex(2).within(() => {
        cy.findByRole('button', { name: 'Remove Filter' }).click();
      });
      getGroupingByIndex(2).should('not.exist');
      getGroupingByIndex(1).within(() => {
        cy.findByRole('button', { name: 'Remove Filter' }).click();
      });
      getGroupingByIndex(1).should('not.exist');
    });

    // Verifying the initial state is rendered when all filters are removed
    cy.findAllByRole('button', { name: 'Remove Filter' })
      .eq(0)
      .click();
    cy.findAllByLabelText(TYPE_LABEL).should('have.length', 1);
    cy.findByLabelText(COMPARE_BY_LABEL).should('not.exist');
    cy.findByDataId('grouping').should('have.length', 1);
  });

  it('allows the user to enter multiple, free-form values within the filters field when the comparison is "contains" or "does not contain"', () => {
    navigateToForm();

    cy.withinDrawer(() => {
      cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
      cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
      cy.findByLabelText('Sending Domain').type('tag-number-one tag-number-two tag-number-three ');
      cy.findByText('tag-number-one').should('be.visible');
      cy.findByText('tag-number-two').should('be.visible');
      cy.findByText('tag-number-three').should('be.visible');

      cy.findAllByRole('button', { name: 'Remove' })
        .eq(0)
        .click();
      cy.findByText('tag-number-one').should('not.exist');
      cy.findByText('tag-number-two').should('be.visible');
      cy.findByText('tag-number-three').should('be.visible');

      cy.findAllByRole('button', { name: 'Remove' })
        .eq(0)
        .click();
      cy.findByText('tag-number-two').should('not.exist');
      cy.findByText('tag-number-two').should('not.exist');
      cy.findByText('tag-number-three').should('be.visible');

      cy.findAllByRole('button', { name: 'Remove' })
        .eq(0)
        .click();
      cy.findByText('tag-number-two').should('not.exist');
      cy.findByText('tag-number-two').should('not.exist');
      cy.findByText('tag-number-three').should('not.exist');
    });
  });

  describe('the filters typeahead', () => {
    beforeEach(() => navigateToForm());

    it('requests data according to the selected filter type', () => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');
      cy.findByLabelText('Subaccount').type('Fake Subaccount');

      cy.wait('@getSubaccounts');

      cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).should('be.visible');
      cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).should('be.visible');
      cy.findByRole('option', { name: 'Fake Subaccount 3 (ID 103)' })
        .should('be.visible')
        .click();

      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
      cy.findByRole('radio', { name: 'And' }).should('be.checked');
      cy.findByRole('radio', { name: 'Or' }).should('not.be.checked');
    });

    // This test protects against the re-introduction of a bug - https://sparkpost.atlassian.net/browse/SA-2018
    it('requests data for sending domains successfully when searching for sending domains in the relevant typeahead', () => {
      cy.stubRequest({
        url: '/api/v1/sending-domains',
        fixture: 'sending-domains/200.get.json',
        requestAlias: 'getSendingDomains',
      });
      cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');
      cy.findByLabelText('Sending Domain').type('bounce');

      cy.wait('@getSendingDomains');

      cy.findByRole('option', { name: 'bounce.uat.sparkspam.com' }).should('be.visible');
    });

    it('returns no results when the user has entered fewer than 3 characters', () => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');
      cy.findByLabelText('Subaccount').type('Fa');
      cy.findByText('No Results').should('be.visible');
    });

    it('returns no results when not the server returns no results for that filter type', () => {
      cy.stubRequest({
        url: '/api/v1/subaccounts',
        fixture: '200.get.no-results.json',
        requestAlias: 'getSubaccounts',
      });

      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');
      cy.findByLabelText('Subaccount').type('Fake Subaccount');
      cy.wait('@getSubaccounts');

      cy.findByText('No Results').should('be.visible');
    });

    it('allows the user to enter multiple values as well as remove them after they have been added', () => {
      cy.findByLabelText(TYPE_LABEL).select('Subaccount');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');

      cy.findByLabelText('Subaccount').type('Fake Subaccount');
      cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).click();

      cy.findByLabelText('Subaccount').type('Fake Subaccount');
      cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).should('not.exist');
      cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).click();

      cy.findByLabelText('Subaccount').type('Fake Subaccount');
      cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).should('not.exist');
      cy.findByRole('option', { name: 'Fake Subaccount 3 (ID 103)' }).click();

      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
      cy.findByText('Fake Subaccount 3 (ID 103)').should('be.visible');
    });
  });

  it('handles filter clearing when the user clicks on "Clear Filters"', () => {
    navigateToForm();

    cy.withinDrawer(() => {
      fillOutForm();
      cy.findByRole('button', { name: 'Clear Filters' }).click();
      cy.findAllByLabelText(TYPE_LABEL)
        .should('have.length', 1)
        .should('be.visible')
        .should('have.value', null);
      cy.findAllByLabelText(COMPARE_BY_LABEL).should('not.exist');
      cy.findAllByRole('button', { name: 'Add And Filter' }).should('not.exist');
      cy.findAllByRole('button', { name: 'Add Or Filter' }).should('not.exist');
      cy.findByDataId('grouping').should('have.length', 1);
      cy.findAllByRole('group', { name: 'Filter By' }).should('have.length', 1);
    });
  });

  it('handles applying the form and storing the parameters in the URL', () => {
    navigateToForm();

    // Uses subaccounts to make sure it joins data correctly
    cy.findByLabelText(TYPE_LABEL).select('Subaccount');
    cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'eq');

    cy.findByLabelText('Subaccount').type('Fake Subaccount');
    cy.findByRole('option', { name: 'Fake Subaccount 1 (ID 101)' }).click();

    cy.findByLabelText('Subaccount').type('Fake Subaccount');
    cy.findByRole('option', { name: 'Fake Subaccount 2 (ID 102)' }).click();

    cy.findByRole('button', { name: 'Add And Grouping' }).click();

    getGroupingByIndex(1).within(() => {
      getFilterByIndex(0).within(() => {
        cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
        cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
        cy.findByLabelText('Recipient Domain').type('some tags');
      });
    });

    cy.findByRole('button', { name: 'Apply Filters' }).click();

    // Verify rendered filter tags on the reports page, outside of the drawer
    getFilterTags().within(() => {
      getFilterGroupings()
        .eq(0)
        .within(() => {
          cy.findByText('Subaccount').should('be.visible');
          cy.findByText('is equal to').should('be.visible');
          cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
          cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
        });

      // Comparison between groupings
      cy.findByText('And').should('be.visible');

      getFilterGroupings()
        .eq(1)
        .within(() => {
          cy.findByText('Recipient Domain').should('be.visible');
          cy.findByText('contains').should('be.visible');
          cy.findByText('some').should('be.visible');
          cy.findByText('tags').should('be.visible');
        });
    });

    cy.findByRole('button', { name: 'Add Filters' }).click();

    cy.withinDrawer(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
      cy.findByText('some').should('exist');
      cy.findByText('tags').should('exist');
    });
  });

  it('handles loading form on initial mount from query params', () => {
    cy.visit(
      '/signals/analytics?query_filters=%255B%257B%2522AND%2522%3A%257B%2522subaccounts%2522%3A%257B%2522eq%2522%3A%255B101%2C102%255D%257D%257D%257D%2C%257B%2522AND%2522%3A%257B%2522domains%2522%3A%257B%2522like%2522%3A%255B%2522hello%2522%2C%2522there%2522%2C%2522friend%2522%2C%2522these%2522%2C%2522are%2522%2C%2522some%2522%2C%2522tags%2522%255D%257D%257D%257D%255D',
    );

    cy.wait(['@getSubaccounts', '@getDeliverability', '@getTimeSeries']);

    cy.findByRole('button', { name: 'Add Filters' }).click();

    cy.withinDrawer(() => {
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
    });

    getGroupingByIndex(1).within(() => {
      getFilterByIndex(0).within(() => {
        cy.findByLabelText('Recipient Domain').should('exist');
        cy.findByText('some').should('exist');
        cy.findByText('tags').should('exist');
      });
    });
  });

  it('handles loading a form with old filters', () => {
    cy.visit(
      '/signals/analytics?filters=Subaccount%3AFake Subaccount 1 (ID 101)%3A101&filters=Subaccount%3AFake Subaccount 2 (ID 102)%3A102&filters=Recipient Domain%3Amydomain.com&filters=Template%3Atemplatey',
    );

    cy.wait(['@getSubaccounts', '@getDeliverability', '@getTimeSeries']);

    cy.findByRole('button', { name: 'Add Filters' }).click();

    cy.withinDrawer(() => {
      cy.findAllByLabelText('Subaccount').should('be.visible');
      cy.findByText('Fake Subaccount 1 (ID 101)').should('be.visible');
      cy.findByText('Fake Subaccount 2 (ID 102)').should('be.visible');
      cy.findByLabelText('Recipient Domain').should('exist');
      cy.findByText('mydomain.com').should('exist');
      cy.findByLabelText('Template').should('exist');
      cy.findByText('templatey').should('exist');
    });
  });

  describe('duplicate filter error banner', () => {
    it('renders when the user selects multiple filters of the exact same "Type" and "Compare By" value within any grouping within the form', () => {
      navigateToForm();
      causeDuplicationError();

      cy.withinDrawer(() => {
        cy.findByRole('alert')
          .should('be.visible')
          .should('contain', 'Duplicate filters are not allowed within a group.')
          .should('have.focus');

        cy.verifyLink({
          content: 'API Docs',
          href: 'https://developers.sparkpost.com/api/metrics/#header-groupings-structure',
        });
      });
    });

    it('renders an error within each group that contains a violation', () => {
      navigateToForm();
      causeDuplicationError();
      cy.findByRole('button', { name: 'Add And Grouping' }).click();

      getGroupingByIndex(1).within(() => {
        getFilterByIndex(0).within(() => {
          cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
          cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
          cy.findByLabelText('Recipient Domain').type('hello-there{enter}');
          cy.findByRole('button', { name: 'Add And Filter' }).click();
        });

        getFilterByIndex(1).within(() => {
          cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
          cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
        });
      });

      cy.withinDrawer(() => {
        cy.findByRole('button', { name: 'Apply Filters' }).click();
      });

      cy.findAllByRole('alert')
        .should('have.length', 2)
        .first()
        .should('have.focus');
    });

    it('does not render after the user clears invalid, duplicated filters', () => {
      navigateToForm();
      causeDuplicationError();
      cy.withinDrawer(() => {
        cy.findByRole('alert').should('exist');
      });

      // Fix the error by changing the "Type" on one of the offending filters
      getGroupingByIndex(0).within(() => {
        getFilterByIndex(2).within(() => {
          cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
        });
      });
      cy.withinDrawer(() => {
        cy.findByRole('alert').should('not.exist');
      });

      // Reset the form
      cy.withinDrawer(() => {
        cy.findByRole('button', { name: 'Clear Filters' }).click();
      });

      causeDuplicationError();
      cy.withinDrawer(() => {
        cy.findByRole('alert').should('exist');
      });

      // Fix the error by changing the "Compare By" on one of the offending filters
      getGroupingByIndex(0).within(() => {
        getFilterByIndex(2).within(() => {
          cy.findByLabelText(COMPARE_BY_LABEL).select('is equal to');
        });
      });
      cy.withinDrawer(() => {
        cy.findByRole('alert').should('not.exist');
      });
    });

    it('does not render after the user clears the form entirely', () => {
      navigateToForm();
      causeDuplicationError();
      cy.withinDrawer(() => {
        cy.findByRole('alert')
          .scrollIntoView()
          .should('exist');
      });
      cy.withinDrawer(() => {
        cy.findByRole('button', { name: 'Clear Filters' }).click();
      });

      cy.withinDrawer(() => {
        cy.findByRole('alert').should('not.exist');
      });
    });
  });

  it('submits the form and adds appropriate query params for API requests', () => {
    navigateToForm();
    stubDeliverability('nextGetDeliverability');
    stubTimeSeries('nextGetTimeSeries');
    cy.withinDrawer(() => {
      fillOutForm();
      cy.findByRole('button', { name: 'Apply Filters' }).click();
    });

    cy.wait('@nextGetTimeSeries').then(xhr => {
      cy.wrap(xhr.url).should(
        'include',
        'query_filters={"groupings":[{"AND":{"templates":{"notLike":["template"]}}},{"AND":{"sending_domains":{"like":["thisisasendingdomain"]}}}]}',
      );
    });

    cy.wait('@nextGetDeliverability').then(xhr => {
      cy.wrap(xhr.url).should(
        'include',
        'query_filters={"groupings":[{"AND":{"templates":{"notLike":["template"]}}},{"AND":{"sending_domains":{"like":["thisisasendingdomain"]}}}]}',
      );
    });
  });
});

function navigateToForm() {
  cy.visit(PAGE_URL);
  cy.wait(['@getSubaccounts', '@getDeliverability', '@getTimeSeries']);

  cy.findByRole('button', { name: 'Add Filters' }).click();
}

function fillOutForm() {
  cy.findByLabelText(COMPARE_BY_LABEL).should('not.exist');
  cy.findByLabelText(TYPE_LABEL).select('Recipient Domain');
  cy.findByLabelText('Recipient Domain').should('be.visible');
  cy.findByLabelText(COMPARE_BY_LABEL)
    .should('have.value', 'eq')
    .select('contains');
  cy.findByLabelText('Recipient Domain').type('hello there friend these are some tags');
  cy.findByRole('radio', { name: 'And' })
    .should('exist')
    .should('be.checked');
  cy.findByRole('radio', { name: 'Or' })
    .should('exist')
    .should('not.be.checked');

  getGroupingByIndex(0).within(() => {
    getFilterByIndex(0).within(() => {
      // Adding an "AND" comparison filter within a grouping
      cy.findByRole('button', { name: 'Add And Filter' }).click();
    });

    getFilterByIndex(1).within(() => {
      cy.findByLabelText(TYPE_LABEL).select('Template');
      cy.findByLabelText(COMPARE_BY_LABEL)
        .should('have.value', 'eq')
        .select('does not contain');
      cy.findByLabelText('Template').type('template ');
      cy.findByRole('button', { name: 'Remove Filter' }).should('be.visible');
    });

    getFilterByIndex(0).within(() => {
      cy.findByRole('button', { name: 'Remove Filter' })
        .should('be.visible')
        .click();

      cy.findByLabelText(TYPE_LABEL).should('have.value', 'templates');
      cy.findByLabelText(COMPARE_BY_LABEL).should('have.value', 'notLike');
      cy.findByLabelText('Template').should('be.visible');
      cy.findByRole('radio', { name: 'And' }).should('exist');
      cy.findByRole('radio', { name: 'Or' }).should('exist');
    });
  });

  cy.findByRole('button', { name: 'Add And Grouping' }).click();

  getGroupingByIndex(1).within(() => {
    getFilterByIndex(0).within(() => {
      cy.findByLabelText(TYPE_LABEL).select('Sending Domain');
      cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
      cy.findByLabelText('Sending Domain').type('thisisasendingdomain{enter}');
    });
  });
}

function getGroupingByIndex(index) {
  return cy.findByDataId('grouping').eq(index);
}

function getFilterByIndex(index) {
  // `role="group"` maps to the `<fieldset />` element
  return cy.findAllByRole('group', { name: 'Filter By' }).eq(index);
}

/**
 * Causes a duplication error by adding multiple filters of the same "Type" and "Compare By" value within a grouping
 */
function causeDuplicationError() {
  getGroupingByIndex(0).within(() => {
    getFilterByIndex(0).within(() => {
      cy.findByLabelText(TYPE_LABEL).select('Campaign');
      cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
      cy.findByLabelText('Campaign').type('hello{enter}');
      cy.findByRole('button', { name: 'Add And Filter' }).click();
    });

    // Adds a filter that is *not* a duplicate
    getFilterByIndex(1).within(() => {
      cy.findByLabelText(TYPE_LABEL).select('Campaign');
      cy.findByLabelText(COMPARE_BY_LABEL).select('does not contain');
      cy.findByLabelText('Campaign').type('hello{enter}');
      cy.findByRole('button', { name: 'Add And Filter' }).click();
    });

    // Adds a filter that is a duplicate
    getFilterByIndex(2).within(() => {
      cy.findByLabelText(TYPE_LABEL).select('Campaign');
      cy.findByLabelText(COMPARE_BY_LABEL).select('contains');
    });
  });

  cy.withinDrawer(() => {
    cy.findByRole('button', { name: 'Apply Filters' }).click();
  });
}
