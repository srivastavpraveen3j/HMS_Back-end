// utils/queryFilterBuilder.js
const buildQueryFilters = (query, schema) => {
    const filters = {};
  
    for (const key in query) {
      if (!schema.path(key)) continue; // skip if not in schema
  
      const type = schema.path(key).instance;
  
      if (type === 'String') {
        filters[key] = { $regex: query[key], $options: 'i' };
      } else if (type === 'Number') {
        filters[key] = Number(query[key]);
      } else if (type === 'Date') {
        filters[key] = new Date(query[key]);
      } else {
        filters[key] = query[key]; // fallback
      }
    }
  
    return filters;
  };
  
  export default buildQueryFilters;