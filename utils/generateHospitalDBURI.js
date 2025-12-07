import crypto from "crypto";

/**
 * @param {string} clusterURI - Base cluster connection string without DB name
 * @returns {string} - MongoDB URI with prefixed DB name
 */
function generatePrefixedDBURI(clusterURI) {

  // 4 hex chars → ~65k unique names per prefix
  const randomDB = crypto.randomBytes(2).toString("hex");

  const dbName = `${'A'}_${randomDB}`;

  return `${clusterURI}/${dbName}?retryWrites=true&w=majority`;
}

export default generatePrefixedDBURI;
