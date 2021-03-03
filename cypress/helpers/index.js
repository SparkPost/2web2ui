// see, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
export const toRegex = text => {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
};
