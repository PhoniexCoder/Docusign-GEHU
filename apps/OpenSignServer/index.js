import './env-loader.js';
import express from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import AWS from 'aws-sdk';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { exec } from 'child_process';
import { createTransport } from 'nodemailer';
import { ParseServer } from 'parse-server';
import S3Adapter from '@parse/s3-files-adapter';
import FSFilesAdapter from '@parse/fs-files-adapter';
import { ApiPayloadConverter } from 'parse-server-api-mail-adapter';
import maintenance_mode_message from 'aws-sdk/lib/maintenance_mode_message.js';
import { createRouteHandler } from 'uploadthing/express';

import { app as customRoute } from './cloud/customRoute/customApp.js';
import { uploadRouter } from './uploadthing.js';
import { validateSignedLocalUrl } from './cloud/parsefunction/getSignedUrl.js';
import runDbMigrations from './migrationdb/index.js';
import { SSOAuth } from './auth/authadapter.js';
import {
  appName,
  cloudServerUrl,
  serverAppId,
  smtpenable,
  smtpsecure,
  useLocal
} from './Utils.js';

maintenance_mode_message.suppress = true;
const __dirname = path.resolve();

/* ------------------------------------------------------------------ */
/*  EXPRESS APP (FAST, NO BLOCKING)                                    */
/* ------------------------------------------------------------------ */

export const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, _, next) => {
  req.headers['x-real-ip'] = getUserIP(req);
  req.headers['public_url'] = `https://${req.get('host')}`;
  next();
});

function getUserIP(req) {
  const fwd = req.headers['x-forwarded-for'];
  return fwd ? fwd.split(',')[0] : req.socket.remoteAddress;
}

app.use(async (req, res, next) => {
  if (req.method === 'GET' && req.path.includes('files')) {
    const params = req.originalUrl.split('?')[1];
    if (!params) return res.status(400).json({ message: 'unauthorized' });

    const serverUrl = process.env.SERVER_URL.replace(/\/app$/, '');
    const fileRes = await validateSignedLocalUrl(
      `${serverUrl}${req.originalUrl}`
    );

    if (fileRes === 'Unauthorized') {
      return res.status(400).json({ message: 'unauthorized' });
    }
  }
  next();
});

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/api/uploadthing',
  createRouteHandler({
    router: uploadRouter,
    config: {
      uploadthingSecret: process.env.UPLOADTHING_SECRET,
      uploadthingId: process.env.UPLOADTHING_APP_ID
    }
  })
);

app.use('/', customRoute);

app.get('/', (_, res) =>
  res.status(200).send('gehudocsi-server is running !!!')
);

/* ------------------------------------------------------------------ */
/*  START SERVER IMMEDIATELY                                           */
/* ------------------------------------------------------------------ */

const port = process.env.PORT || 8080;
const httpServer = http.createServer(app);

httpServer.keepAliveTimeout = 100000;
httpServer.headersTimeout = 100000;

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`docusign-server running on port ${port}.`);

  // 🔥 IMPORTANT: EVERYTHING BELOW RUNS ASYNC, NON-BLOCKING
  initBackend().catch(console.error);
});

/* ------------------------------------------------------------------ */
/*  BACKGROUND INITIALIZATION                                          */
/* ------------------------------------------------------------------ */

async function initBackend() {
  const filesAdapter = initFilesAdapter();
  const mailAdapter = await initMailAdapter();

  const parseConfig = {
    databaseURI:
      process.env.DATABASE_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/dev',

    cloud: () => import('./cloud/main.js'),

    appId: serverAppId,
    serverURL: cloudServerUrl,
    publicServerURL: process.env.SERVER_URL || cloudServerUrl,
    masterKey: process.env.MASTER_KEY,
    masterKeyIps: ['0.0.0.0/0', '::/0'],

    appName,
    filesAdapter,
    auth: { google: { enabled: true }, sso: SSOAuth },

    maxLimit: 500,
    maxUploadSize: '100mb',
    allowClientClassCreation: false,
    logLevel: ['error'],

    ...(mailAdapter && { emailAdapter: mailAdapter })
  };

  const parseServer = new ParseServer(parseConfig);
  await parseServer.start();
  app.use(process.env.PARSE_MOUNT || '/app', parseServer.app);

  console.log('Parse Server mounted');

  runDbMigrations();
  runParseDbTool();
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

function initFilesAdapter() {
  if (useLocal === 'true') {
    return new FSFilesAdapter({ filesSubDirectory: 'files' });
  }

  try {
    const endpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);
    return new S3Adapter({
      bucket: process.env.DO_SPACE,
      baseUrl: process.env.DO_BASEURL,
      region: process.env.DO_REGION,
      directAccess: true,
      preserveFileName: true,
      presignedUrl: true,
      presignedUrlExpires: 900,
      s3overrides: {
        credentials: {
          accessKeyId: process.env.DO_ACCESS_KEY_ID,
          secretAccessKey: process.env.DO_SECRET_ACCESS_KEY
        },
        endpoint
      }
    });
  } catch {
    return new FSFilesAdapter({ filesSubDirectory: 'files' });
  }
}

async function initMailAdapter() {
  if (smtpenable && process.env.NODE_ENV !== 'development') {
    try {
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: smtpsecure,
        auth: process.env.SMTP_USERNAME && process.env.SMTP_PASS
          ? {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASS
          }
          : undefined
      });

      await transporter.verify();

      return {
        module: 'parse-server-api-mail-adapter',
        options: {
          sender: `${appName} <${process.env.SMTP_USER_EMAIL}>`,
          apiCallback: async ({ payload }) =>
            transporter.sendMail(payload)
        }
      };
    } catch {
      return null;
    }
  }

  if (process.env.MAILGUN_API_KEY) {
    const mg = new Mailgun(formData).client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY
    });

    return {
      module: 'parse-server-api-mail-adapter',
      options: {
        sender: `${appName} <${process.env.MAILGUN_SENDER}>`,
        apiCallback: async ({ payload }) =>
          mg.messages.create(
            process.env.MAILGUN_DOMAIN,
            ApiPayloadConverter.mailgun(payload)
          )
      }
    };
  }

  return null;
}

function runParseDbTool() {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows
    ? `set APPLICATION_ID=${serverAppId}&& set SERVER_URL=${cloudServerUrl}&& set MASTER_KEY=${process.env.MASTER_KEY}&& npx parse-dbtool migrate`
    : `APPLICATION_ID=${serverAppId} SERVER_URL=${cloudServerUrl} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;

  exec(cmd, (err, stdout, stderr) => {
    if (err || stderr) return;
    console.log(stdout);
  });
}
