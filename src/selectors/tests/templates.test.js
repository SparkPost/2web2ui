import cases from 'jest-in-case';
import * as selector from '../templates';

describe('Templates selectors', () => {
  let store;
  beforeEach(() => {
    store = {
      account: {
        // yuck
        options: {
          click_tracking: true,
          rest_tracking_default: true,
          transactional_default: false,
        },
      },
      templates: {
        list: [
          {
            name: 'unpublished',
            has_published: false,
            shared_with_subaccounts: false,
            subaccount_id: 101,
          },
          {
            name: 'publishedSubaccount',
            has_published: true,
            shared_with_subaccounts: false,
            subaccount_id: 101,
          },
          {
            name: 'publishedPrimary',
            has_published: true,
            shared_with_subaccounts: false,
            subaccount_id: 0,
            published: true,
          },
          {
            name: 'publishedShared',
            has_published: true,
            shared_with_subaccounts: true,
            subaccount_id: 0,
          },
        ],
        testData: { test: 'data' },
        byId: {
          ape: {
            draft: {
              name: 'Ape',
              id: 'ape',
              published: false,
            },
            published: {
              name: 'Ape',
              id: 'ape',
              published: true,
            },
          },
          lion: {
            draft: {
              id: 'lion',
              name: 'Lion',
              published: false,
              options: {
                click_tracking: false,
                open_tracking: false,
                transactional: false,
              },
            },
            published: {
              id: 'lion',
              name: 'Lion',
              published: true,
              options: {
                click_tracking: false,
                open_tracking: false,
                transactional: false,
              },
            },
          },
          bear: {
            draft: {
              name: 'Bear',
              id: 'bear',
              published: true,
              content: {
                text: 'Hello, world',
                amp_html: null,
              },
            },
            published: {
              name: 'Bear',
              id: 'bear',
              published: true,
              content: {
                text: 'Hello, world',
                amp_html: null,
              },
            },
          },
        },
        contentPreview: {
          draft: {
            ape: {
              html: '<h1>Southeastern Asia</h1>',
              subject: 'New Location: Come visit me',
            },
          },
          published: {
            ape: {
              html: '<h1>Baltimore Zoo</h1>.',
              subject: 'Come visit me',
            },
          },
        },
      },
      sendingDomains: {
        list: [
          {
            domain: 'shared.com',
            shared_with_subaccounts: true,
            status: { ownership_verified: true, compliance_status: 'valid' },
          },
          {
            domain: 'primaryOnly.com',
            status: { ownership_verified: true, compliance_status: 'valid' },
          },
          {
            domain: 'assignedToSub.com',
            subaccount_id: 101,
            status: { ownership_verified: true, compliance_status: 'valid' },
          },
          {
            domain: 'notvalid.com',
            status: { ownership_verified: false, compliance_status: 'valid' },
          },
        ],
      },
      currentUser: {
        has_subaccounts: true,
      },
      subaccounts: {
        list: [
          { name: 'sub 1', id: 101 },
          { name: 'sub 2', id: 501 },
        ],
      },
      form: { testform: { values: {} } },
    };
  });

  describe('getDraftTemplateById', () => {
    it('returns draft template', () => {
      expect(selector.getDraftTemplateById(store, 'ape')).toEqual({
        name: 'Ape',
        id: 'ape',
        published: false,
      });
    });

    it('returns undefined when not present', () => {
      expect(selector.getDraftTemplateById(store, 'unknown')).toBeUndefined();
    });
  });

  describe('getPublishedTemplateById', () => {
    it('returns draft template', () => {
      expect(selector.getPublishedTemplateById(store, 'ape')).toEqual({
        name: 'Ape',
        id: 'ape',
        published: true,
      });
    });

    it('returns undefined when not present', () => {
      expect(selector.getPublishedTemplateById(store, 'unknown')).toBeUndefined();
    });
  });

  describe('selectDraftTemplateById', () => {
    it('returns template', () => {
      expect(selector.selectDraftTemplateById(store, 'lion')).toEqual({
        id: 'lion',
        name: 'Lion',
        options: {
          click_tracking: false,
          open_tracking: false,
          transactional: false,
        },
        published: false,
      });
    });

    it('returns template with default options', () => {
      expect(selector.selectDraftTemplateById(store, 'ape')).toEqual({
        id: 'ape',
        name: 'Ape',
        options: {
          click_tracking: true,
          open_tracking: true,
          transactional: false,
        },
        published: false,
      });
    });

    it('returns undefined when template is not present', () => {
      expect(selector.selectDraftTemplateById(store, 'unknown')).toBeUndefined();
    });

    it('does not return keys with falsy values in the content object', () => {
      expect(selector.selectDraftTemplateById(store, 'bear')).toEqual({
        id: 'bear',
        name: 'Bear',
        options: {
          click_tracking: true,
          open_tracking: true,
          transactional: false,
        },
        content: {
          text: 'Hello, world',
        },
        published: true,
      });
    });
  });

  describe('selectPublishedTemplateById', () => {
    it('returns template', () => {
      expect(selector.selectPublishedTemplateById(store, 'lion')).toEqual({
        id: 'lion',
        name: 'Lion',
        options: {
          click_tracking: false,
          open_tracking: false,
          transactional: false,
        },
        published: true,
      });
    });

    it('returns template with default options', () => {
      expect(selector.selectPublishedTemplateById(store, 'ape')).toEqual({
        id: 'ape',
        name: 'Ape',
        options: {
          click_tracking: true,
          open_tracking: true,
          transactional: false,
        },
        published: true,
      });
    });

    it('returns undefined when template is not present', () => {
      expect(selector.selectPublishedTemplateById(store, 'unknown')).toBeUndefined();
    });

    it('does not return keys with falsy values in the content object', () => {
      expect(selector.selectPublishedTemplateById(store, 'bear')).toEqual({
        id: 'bear',
        name: 'Bear',
        options: {
          click_tracking: true,
          open_tracking: true,
          transactional: false,
        },
        content: {
          text: 'Hello, world',
        },
        published: true,
      });
    });
  });

  cases(
    '.selectDraftTemplatePreview',
    ({ defaultValue, id }) => {
      expect(selector.selectDraftTemplatePreview(store, id, defaultValue)).toMatchSnapshot();
    },
    {
      'returns preview of draft template': { id: 'ape' },
      'returns undefined when unknown': { id: 'unknown' },
      'returns default value when unknown': { id: 'unknown', defaultValue: {} },
    },
  );

  cases(
    '.selectPublishedTemplatePreview',
    ({ defaultValue, id }) => {
      expect(selector.selectPublishedTemplatePreview(store, id, defaultValue)).toMatchSnapshot();
    },
    {
      'returns preview of draft template': { id: 'ape' },
      'returns undefined when unknown': { id: 'unknown' },
      'returns default value when unknown': { id: 'unknown', defaultValue: {} },
    },
  );

  describe('selectAndCloneDraftById', () => {
    it('returns clone of draft with updated name and id', () => {
      expect(selector.selectAndCloneDraftById(store, 'ape')).toEqual({
        id: 'ape-copy',
        name: 'Ape Copy',
        options: {
          click_tracking: true,
          open_tracking: true,
          transactional: false,
        },
        published: false,
      });
    });

    it('returns undefined when draft is not present', () => {
      expect(selector.selectAndCloneDraftById(store, 'unknown')).toBeUndefined();
    });
  });

  describe('selectTemplates', () => {
    it('should return a list', () => {
      expect(selector.selectTemplates(store)).toMatchSnapshot();
    });
  });

  describe('selectPublishedTemplates', () => {
    it('should return a list', () => {
      expect(selector.selectPublishedTemplates(store)).toMatchSnapshot();
    });
  });

  describe('selectDefaultTestData', () => {
    it('should return default test data', () => {
      expect(selector.selectDefaultTestData(store)).toMatchSnapshot();
    });
  });

  describe('selectTemplateTestData', () => {
    it('should return test data', () => {
      expect(selector.selectTemplateTestData(store)).toMatchSnapshot();
    });

    it('should return default data', () => {
      expect(selector.selectTemplateTestData({ templates: {} })).toMatchSnapshot();
    });
  });

  describe('selectDomainsBySubaccount', () => {
    it('should return domains with no subaccount filter', () => {
      expect(selector.selectDomainsBySubaccount(store, {})).toMatchSnapshot();
    });

    it('should return domains for a specific subaccount', () => {
      expect(selector.selectDomainsBySubaccount(store, { subaccountId: 101 })).toMatchSnapshot();
    });
  });

  describe('selectPublishedTemplatesBySubaccount', () => {
    it('should return published templates for primary account', () => {
      expect(selector.selectPublishedTemplatesBySubaccount(store)).toMatchSnapshot();
    });

    it('should return published templates for a specific subaccount', () => {
      expect(selector.selectPublishedTemplatesBySubaccount(store, 101)).toMatchSnapshot();
    });

    it('should return published templates if no subaccounts exist', () => {
      store.currentUser.has_subaccounts = false;
      expect(selector.selectPublishedTemplatesBySubaccount(store)).toMatchSnapshot();
    });
  });

  describe('selectPreviewLineErrors', () => {
    it('should return an empty ', () => {
      expect(selector.selectPreviewLineErrors(store)).toEqual([]);
    });

    it('should return an array of errors', () => {
      const errors = [
        { line: 1, message: 'Oh no!' },
        { line: 2, message: 'Oh no!' },
      ];

      store.templates.contentPreview.error = { response: { data: { errors } } };

      expect(selector.selectPreviewLineErrors(store)).toEqual(errors);
    });
  });

  describe('selectTemplatesForListTable', () => {
    it('returns template(s) with published version only', () => {
      expect(selector.selectTemplatesForListTable(store)).toMatchSnapshot();
    });

    it('returns template(s) with draft version only', () => {
      store.templates.list = store.templates.list.map(template => ({
        ...template,
        has_published: false,
      }));
      store.templates.list[1].has_draft = true;
      expect(selector.selectTemplatesForListTable(store)).toMatchSnapshot();
    });

    it('returns template(s) correctly having both published and draft version', () => {
      store.templates.list[2].has_draft = true;
      expect(selector.selectTemplatesForListTable(store)).toMatchSnapshot();
    });
  });

  describe('selectDomainsBySubaccountWithDefault', () => {
    it('returns verified domains when exist', () => {
      expect(
        selector.selectDomainsBySubaccountWithDefault(store, {}).map(dom => dom.domain),
      ).toEqual(['shared.com', 'primaryOnly.com']);
    });

    it('returns subaccount verified domains when exist', () => {
      const expectedDomains = ['shared.com', 'assignedToSub.com'];
      expect(
        selector
          .selectDomainsBySubaccountWithDefault(store, { subaccountId: 101 })
          .map(dom => dom.domain),
      ).toEqual(expectedDomains);
    });

    it('returns sandbox domain when no verified sending domain exists', () => {
      expect(
        selector
          .selectDomainsBySubaccountWithDefault({ ...store, sendingDomains: { list: [] } }, {})
          .map(dom => dom.domain),
      ).toEqual(['sparkpostbox.com']);
    });
  });
});
