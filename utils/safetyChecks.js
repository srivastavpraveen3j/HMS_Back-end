// utils/safetyChecks.js
export function isValidString(value) {
  return value && typeof value === 'string' && value.trim().length > 0;
}

export function hasProperty(obj, prop) {
  return obj && typeof obj === 'object' && obj.hasOwnProperty(prop) && obj[prop] != null;
}

export function safeStringIncludes(str, searchString) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  return str.includes(searchString);
}

export function safeAccess(obj, path, defaultValue = null) {
  try {
    return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
  } catch (error) {
    console.warn('Safe access failed:', error.message);
    return defaultValue;
  }
}
