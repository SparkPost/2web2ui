import _ from 'lodash';
import { formatBytes } from 'src/helpers/units';
import { getDuration } from 'src/helpers/date';
import { toSentence } from 'src/helpers/array';
import { multilineStringToArray } from 'src/helpers/string';
import { isEmailAddress, isEmailLocalPart, isRecipientEmailAddress } from 'src/helpers/email';
import { domainRegex, slugRegex } from './regex';
import isURL from 'validator/lib/isURL';
import Payment from 'payment';
import moment from 'moment';

export const MAXIMUM_EMAILS_ALLOWED = 10;

// validation gate to only check valiation if string is present
export const ifStringPresent = validator => (str = '') =>
  str.trim() === '' ? undefined : validator(str);

export function required(value) {
  return value ? undefined : 'Required';
}

export function email(value) {
  return isEmailAddress(value) ? undefined : 'Invalid Email';
}

export function emails(str) {
  const values = multilineStringToArray(str);
  return values.length && values.every(isEmailAddress)
    ? undefined
    : 'Must be a comma separated list of valid email addresses';
}

/**
 * Determines if a list of comma delimited strings has a length no larger than the max value
 *
 * @param {String} str comma delimited string
 * @param {Number} max maximum length allowed for validation
 * @returns {(String|undefined)} undefined if the length is less than max, otherwise returns an error string
 */
export const maxItems = max => str => {
  const values = multilineStringToArray(str);
  return values.length > max ? `Must contain no more than ${max} items` : undefined;
};

export const noDuplicateItems = str => {
  const values = multilineStringToArray(str);
  const dedupedValues = [...new Set(values)];
  return values.length !== dedupedValues.length ? "Can't contain duplicate items" : undefined;
};

export function emailLocal(value) {
  return isEmailLocalPart(value) ? undefined : 'Invalid Email';
}

export function recipientEmail(value) {
  return isRecipientEmailAddress(value) ? undefined : 'Invalid Email';
}

export function eventsQuery(filter) {
  if (filter.value && !filter.key) {
    return 'Select a Filter';
  }
  return undefined;
}

export function domain(value) {
  return domainRegex.test(value) ? undefined : 'Invalid Domain';
}

export function slug(value) {
  return slugRegex.test(value)
    ? undefined
    : 'Must contain only lowercase letters, numbers, hyphens, and underscores';
}

export function abTestDefaultTemplate(value, formValues, props) {
  // If a matching template ID is found in the list, then the user's entry is valid
  if (props.templates.some(template => template.id === value.id)) {
    return undefined;
  }

  if (formValues.subaccount) {
    return 'Template not available to selected subaccount';
  }

  return 'Template not available to primary account';
}

export function abTestDuration(value, formValues) {
  const testDuration = getDuration(value) + (parseInt(formValues.engagement_timeout, 10) || 24);
  return testDuration > 720
    ? 'Test duration + engagement timeout must be 30 days or less'
    : undefined;
}

export function abTestDistribution(value, formValues) {
  const { default_template, audience_selection, variants } = formValues;

  // only validate if audience selection is percent and all fields are filled
  if (audience_selection === 'percent') {
    let missingValues;

    _.forEach([default_template, ...variants], (variant = {}) => {
      if (!variant.percent) {
        missingValues = true;
      }
    });

    if (missingValues) {
      return;
    }

    const total = _.reduce(
      variants,
      (sum, variant) => sum + parseFloat(variant.percent),
      parseFloat(default_template.percent),
    );
    return total === 100 ? undefined : `Total distribution must equal 100%. Current: ${total}%`;
  }
}

export function startTimeBeforeEndTime(value) {
  return getDuration(value, 'minutes') > 0 ? undefined : 'Start date must be before end date';
}

export function hasNumber(value) {
  return /\d+/.test(value) ? undefined : 'Must have at least 1 number';
}

export function specialCharacter(value) {
  return /[\W_]+/.test(value) ? undefined : 'Must have at least 1 special character (list)';
}

export function hasLetter(value) {
  return /[A-Za-z]+/.test(value) ? undefined : 'Must have at least 1 letter';
}

export function endsWithWhitespace(value) {
  return /[\S]$/.test(value) ? undefined : "Can't end in a whitespace character";
}

export function nonEmptyFile(file) {
  return !file || file.size > 0 ? undefined : 'File must be non-empty';
}

export const fileExtension = _.memoize(function fileExtension(...extensions) {
  const formattedExtensions = extensions.map(extension => `.${extension.toLowerCase()}`);

  return file => {
    if (!file) {
      return;
    }
    const hasValidExtension = formattedExtensions.some(extension =>
      file.name.toLowerCase().endsWith(extension),
    );

    return hasValidExtension
      ? undefined
      : `Must be a ${toSentence(formattedExtensions, 'or')} file`;
  };
});

export const maxLength = _.memoize(function maxLength(length) {
  return value =>
    value && value.trim().length > length ? `Must be ${length} characters or less` : undefined;
});

export const minLength = _.memoize(function minLength(length) {
  return value =>
    typeof value !== 'undefined' && value.trim().length < length
      ? `Must be at least ${length} characters`
      : undefined;
});

export const integer = value => (/^-?[0-9]+$/.test(value) ? undefined : 'Integers only please');

export const minNumber = _.memoize(function minNumber(min) {
  return value => (value < min ? `Must be at least ${min}` : undefined);
});

export const maxNumber = _.memoize(function maxNumber(max) {
  return value => (value > max ? `Must be less than ${max}` : undefined);
});

export const numberBetween = _.memoize(function numberBetween(min, max) {
  return value => (value > min && value < max ? undefined : `Must be between ${min} and ${max}`);
});

export const numberBetweenInclusive = _.memoize(function numberBetween(min, max) {
  return value => (value >= min && value <= max ? undefined : `Must be between ${min} and ${max}`);
});

export const maxFileSize = _.memoize(function maxFilesSize(maxSize) {
  return file => {
    if (!file) {
      return undefined;
    }
    return file.size < maxSize ? undefined : `Please keep file size under ${formatBytes(maxSize)}`;
  };
});

export function url(value) {
  return isURL(value) ? undefined : 'Must be a valid URL';
}

export const cardExpiry = value =>
  Payment.fns.validateCardExpiry(value) ? undefined : 'Please choose a valid expiration date';

export const json = value => {
  try {
    JSON.parse(value);
  } catch (e) {
    return 'Must be valid JSON';
  }
};

// Date validator for the DatePicker component
export const minDays = _.memoize(function minDays(min) {
  return function(dates) {
    // This checks if the dates meet the minimum, and does not factor in the time of those dates
    // Min is subtracted by 1 to account for up to one 24 hour period excluded from the calculation
    return Math.abs(moment(dates.from).diff(moment(dates.to), 'days')) < min - 1
      ? `Select a range of at least ${min} days`
      : undefined;
  };
});
