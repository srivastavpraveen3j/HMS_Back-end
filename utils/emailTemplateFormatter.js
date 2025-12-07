

export const formatTemplate = (template, variables) => {
  let result = template;
  for (const key in variables) {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(pattern, variables[key]);
  }
  return result;
};
