import React from 'react';
import PropTypes from 'prop-types';
import { shrinkToFit } from 'src/helpers/string';

const Subaccount = ({ id, name, all, receiveAll, master, isDefault, shrinkLength }) => {
  let content = null;
  let defaultContent = null;
  let noNameButId = `Subaccount ${id}`;

  if (name && shrinkLength) {
    name = shrinkToFit(name, shrinkLength);
  }

  if (id && shrinkLength) {
    noNameButId = shrinkToFit(noNameButId, shrinkLength);
  }

  // already shrunk, then add id if we have it
  if (name && id) {
    content = `${name} (${id})`;
  } else if (name) {
    content = name;
  } else if (id) {
    content = noNameButId;
  }

  // override name/id if any of these flags are present
  if (all) {
    content = 'Shared with all';
  } else if (receiveAll) {
    content = 'All';
  } else if (master) {
    content = 'Primary Account';
  }

  if (!content && !defaultContent) {
    return null;
  }

  return (
    <span>
      {content}
      {isDefault ? ' (Default)' : ''}
    </span>
  );
};

Subaccount.propTypes = {
  // 'Subaccount ${id}'
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // 'Shared with all'
  all: PropTypes.bool,

  // 'Primary account'
  master: PropTypes.bool,

  // 'All'
  receiveAll: PropTypes.bool,

  // Makes the tag orange and appends '(Default)'
  isDefault: PropTypes.bool,
};

Subaccount.defaultProps = {
  id: null,
  all: false,
  master: false,
  isDefault: false,
  receiveAll: false,
};

export default Subaccount;
