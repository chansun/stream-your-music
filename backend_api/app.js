import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import debug from 'debug';
import bearerToken from "express-bearer-token";

require('dotenv').config();

// Loggers used. Environment variables used to limit output
const debugAutoWire = debug('auto-wire');
const debugAutoWireWarning = debug('auto-wire-warning');

const app = express();

//===CORS Policy 고친거 (아니면 사파리메뉴 수동으로 고칠수도있음. 근데 비추. 그럼 외부 유저는 못씀)
var cors = require('cors');
app.use(cors());
//===CORS Policy 고친거

app.use(require('morgan')('dev'));
require('./data/DataStore');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bearerToken());
app.use(cookieParser());

// auto-wire routes. Must export default router, and a prefix.
const files = fs.readdirSync(path.join(__dirname, 'routes'));
files.forEach(file => {
  const router = require(path.join(__dirname, './routes', file));

  if (!router.router) {
    debugAutoWireWarning(`'${file}' did not export a 'router'. Skipped`);
    return;
  }
  if (!router.prefix) {
    debugAutoWireWarning(`'${file}' did not export a 'prefix' path. Defaulting to '/'`);
  }

  app.use(router.prefix || '/', router.router);
  debugAutoWire(`registered '${file}' to route '${router.prefix || '/'}'`);
});

export default app;
