import lGet from 'lodash.get';

const compact = a => a.filter(v => v);

const popObject = (obj, field, def) => {
  if (field in obj) {
    const out = obj[field];
    delete obj[field];
    return out;
  }
  return def;
};

export { compact, lGet, popObject };
