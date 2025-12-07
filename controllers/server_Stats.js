import os from 'os';
import fs from 'fs';

const isDocker = () => {
  try {
    return fs.existsSync('/.dockerenv');
  } catch {
    return false;
  }
};

export const getServerStats = (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const cpus = os.cpus();
  const loadAvg = os.loadavg(); // [1min, 5min, 15min]
  const platform = os.platform();
  const arch = os.arch();
  const nodeVersion = process.version;
  const hostname = os.hostname();
  const currentTime = new Date();
  const envVars = process.env;

  const html = `
    <html>
      <head>
        <title>Server Stats</title>
        <style>
          body { font-family: sans-serif; background: #f4f4f4; padding: 20px; }
          h1 { color: #333; }
          .card { background: #fff; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          pre { background: #eee; padding: 10px; overflow: auto; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Server Stats</h1>
        <div class="card"><strong>Hostname:</strong> ${hostname}</div>
        <div class="card"><strong>Platform:</strong> ${platform} (${arch})</div>
        <div class="card"><strong>Node.js Version:</strong> ${nodeVersion}</div>
        <div class="card"><strong>Docker Container:</strong> ${isDocker() ? 'Yes' : 'No'}</div>
        <div class="card"><strong>App Uptime:</strong> ${Math.floor(uptime)} seconds</div>
        <div class="card"><strong>Memory Usage:</strong> ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB</div>
        <div class="card"><strong>Free Memory:</strong> ${(freeMem / 1024 / 1024).toFixed(2)} MB</div>
        <div class="card"><strong>Total Memory:</strong> ${(totalMem / 1024 / 1024).toFixed(2)} MB</div>
        <div class="card"><strong>CPU Cores:</strong> ${cpus.length}</div>
        <div class="card"><strong>CPU Model:</strong> ${cpus[0].model}</div>
        <div class="card"><strong>Load Average:</strong> ${loadAvg.map(avg => avg.toFixed(2)).join(', ')}</div>
        <div class="card"><strong>Server Time:</strong> ${currentTime.toUTCString()}</div>
        <div class="card">
          <strong>Environment Variables:</strong>
          <pre>${JSON.stringify({
            NODE_ENV: envVars.NODE_ENV,
            PORT: envVars.PORT,
            TZ: envVars.TZ,
            APP_VERSION: envVars.APP_VERSION
          }, null, 2)}</pre>
        </div>
      </body>
    </html>
  `;

  res.send(html);
};
