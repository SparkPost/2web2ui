import * as helpers from '../abTesting';

describe('A/B testing helper', () => {
  describe('formatFormValues', () => {
    let values;

    beforeEach(() => {
      values = {
        name: 'test_one',
        test_mode: 'bayesian',
        confidence_level: '0.91',
        audience_selection: 'sample_size',
        total_sample_size: 100,
        engagement_timeout: '24',
        dates: {
          from: '2018-08-00T12:00:00.978Z',
          to: '2018-08-09T12:00:00.978Z'
        },
        default_template: {
          template_object: { id: 'template_one', should_not: 'be passed through' },
          sample_size: '200'
        },
        variants: [
          {
            template_object: { id: 'template_two', should_not: 'be passed through' },
            sample_size: '200'
          },
          {
            template_object: { id: 'template_three', should_not: 'be passed through' },
            sample_size: '200'
          }
        ]
      };
    });

    it('should omit total sample size if using percent', () => {
      values.audience_selection = 'percent';
      values.default_template.percent = '50';
      values.variants[0].percent = '25';
      values.variants[1].percent = '25';
      expect(helpers.formatFormValues(values)).toMatchSnapshot();
    });

    it('should omit confidence level if in learning mode', () => {
      values.test_mode = 'learning';
      expect(helpers.formatFormValues(values)).toMatchSnapshot();
    });
  });

  describe('reduceTemplateObject', () => {
    it('should pass through template id', () => {
      expect(helpers.reduceTemplateObject({ template_id: 'template_two', sample_size: 500 })).toMatchSnapshot();
    });

    it('should handle an undefined template', () => {
      expect(helpers.reduceTemplateObject()).toMatchSnapshot();
    });
  });

  describe('findTemplateObject', () => {
    it('should find template objects', () => {
      const templates = [
        { id: 'template_one', full: 'template 1' },
        { id: 'template_two', full: 'template 2' },
        { id: 'template_thre', full: 'template 3' }
      ];
      expect(helpers.findTemplateObject(templates, { template_id: 'template_two', sample_size: 500 })).toMatchSnapshot();
    });
  });

  describe('calculateTotalSampleSize', () => {
    it('should calculate the total sample size of default_template + variants', () => {
      const testMock = { default_template: { sample_size: 100 }, variants: [{ sample_size: 100 },{ sample_size: 100 }]};
      expect(helpers.calculateTotalSampleSize(testMock)).toEqual(300);
    });
  });

  describe('hasTestDelivered', () => {
    it('should return true if a test has delivered messages', () => {
      const testMock = { default_template: { count_accepted: 100 }, variants: [{ count_accepted: 100 },{ count_accepted: 100 }]};
      expect(helpers.hasTestDelivered(testMock)).toEqual(true);
    });

    it('should return false if a test has no delivered messages', () => {
      const testMock = { default_template: { count_accepted: 0 }, variants: [{ count_accepted: 0 },{ count_accepted: 0 }]};
      expect(helpers.hasTestDelivered(testMock)).toEqual(false);
    });

    it('should return false if no test is provided', () => {
      expect(helpers.hasTestDelivered()).toEqual(false);
    });
  });
});
