// testTypesense.js
import Typesense from "typesense";

const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost",
      port: process.env.TYPESENSE_PORT || 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "xyz",
  connectionTimeoutSeconds: 2,
});

async function testTypesenseConnection() {
  try {
    await typesense.health.retrieve()
    console.log("Typesense connection successful!");
  } catch (err) {
    console.error("Typesense connection failed:", err.message);
  }
}

testTypesenseConnection();

