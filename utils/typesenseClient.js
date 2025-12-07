// utils/typesenseClient.js
import Typesense from 'typesense';

const typesense = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',        // 🔁 Change to your Typesense Cloud host if needed
      port: 8108,               // Default port
      protocol: 'http',         // Use 'https' for secure connections (e.g. Cloud)
    },
  ],
  apiKey: 'xyz',                // 🔑 Replace with your real Typesense Admin API Key
  connectionTimeoutSeconds: 5,  // Optional timeout config
});

export default typesense;
