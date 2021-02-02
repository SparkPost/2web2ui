import runner from '../utils/eslintTestRunner';
import rule from '../no-matchbox-import';

runner('no-matchbox-import', rule, {
  valid: {
    'allows matchbox-icons import from outside the matchbox component folder': {
      code: "import { OpenInNew } from '@sparkpost/matchbox-icons'",
      filename: '2web2ui/src/components/example',
    },
    'allows matchbox-icons import from within the matchbox component folder': {
      code: "import { OpenInNew } from '@sparkpost/matchbox-icons'",
      filename: '2web2ui/src/components/matchbox',
    },
    'allows the matchbox import from inside the matchbox component folder': {
      code: "import { ComboBox as OGComboBox } from '@sparkpost/matchbox'",
      filename: '2web2ui/src/components/matchbox',
    },
    'allows the matchbox-hibana import from inside the matchbox component folder': {
      code: "import { ComboBox as HibanaComboBox } from '@sparkpost/matchbox-hibana'",
      filename: '2web2ui/src/components/matchbox',
    },
  },
  invalid: {
    'does not allow matchbox import outside the matchbox component folder': {
      code: "import { ComboBox as OGComboBox } from '@sparkpost/matchbox'",
      filename: '2web2ui/src/components/not-in-matchbox-wrapper-directory',
      errors: [{ message: 'Do not allow direct matchbox imports.' }],
    },
    'does not allow matchbox-hibana import outside the matchbox component folder': {
      code: "import { ComboBox as HibanaComboBox } from '@sparkpost/matchbox-hibana'",
      filename: '2web2ui/src/components/not-in-matchbox-wrapper-directory',
      errors: [{ message: 'Do not allow direct matchbox imports.' }],
    },
  },
});
