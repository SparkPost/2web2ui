import { Linter } from 'eslint';

// note, experimented with RuleTester, too much magic and no easy way to set each test description
// see, https://eslint.org/docs/developer-guide/nodejs-api#ruletester

// Using:
// https://eslint.org/docs/developer-guide/nodejs-api#linter-definerules
// &
// https://eslint.org/docs/developer-guide/nodejs-api#linter-verify
const runner = (title, rule, { valid = {}, invalid = {} } = {}) => {
  describe(title, () => {
    const linter = new Linter();

    linter.defineRules({ [title]: rule });

    Object.keys(valid).forEach(description => {
      it(description, () => {
        const result = linter.verify(
          valid[description].code,
          {
            rules: { [title]: 'error' },
            parserOptions: {
              ecmaVersion: 7,
              sourceType: 'module',
              ecmaFeatures: {
                  jsx: true
              }
            },
          },
          {
            filename: valid[description].filename
          },
        );

        expect(result.length === 0).toEqual(true);
      });
    });

    Object.keys(invalid).forEach(description => {
      it(description, () => {
        const result = linter.verify(
          invalid[description].code,
          {
            rules: { [title]: 'error' },
            parserOptions: {
              ecmaVersion: 7,
              sourceType: 'module',
              ecmaFeatures: {
                  jsx: true
              }
            },
          },
          {
            filename: invalid[description].filename
          },
        );

        // Note: if invalid tests are failing, it means the rule isn't reporting

        expect(result.length).toBeGreaterThan(0); // Test passed, it shouldn't have...
        expect(result[0]).toBeTruthy();
        expect(result[0].message).toEqual(invalid[description].errors[0].message);
      });
    });
  });
};

module.exports = runner;
