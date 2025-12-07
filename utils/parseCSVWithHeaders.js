import Papa from 'papaparse';

export const parseCSVWithHeaders = (csvString) => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length) {
    throw new Error(`CSV Parsing Error: ${result.errors[0].message}`);
  }

  const headers = result.meta.fields;
  const rows = result.data;

  return { headers, rows };
};