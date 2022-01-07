const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {Provider, interactionPolicy: {base}} = require('oidc-provider');
const ISSUER = 'http://localhost:3000';
const app = express();
const adapter = require('./utils/redis-adapter');
const loginRoute = require('./routes/login');
const configuration = require('./config/oidc-configuration');
const querystring = require('querystring');
// const IN_PAYLOAD = provider.Grant.IN_PAYLOAD;
// Object.defineProperty(provider.Grant, 'IN_PAYLOAD', {
//     get: () => {
//         return [...IN_PAYLOAD, 'userinfo'];
//     }
// });
const basePolicy = base();
const consentPrompt = basePolicy.get('consent');
consentPrompt.checks.remove('consent_prompt');
consentPrompt.checks.remove('op_scopes_missing');
// console.log(basePolicy);
const provider = new Provider(ISSUER, {adapter, ...configuration, interactions: {policy: basePolicy}});

const IN_PAYLOAD = provider.Session.IN_PAYLOAD;
Object.defineProperty(provider.Session, 'IN_PAYLOAD', {
    get: () => {
        return [...IN_PAYLOAD, 'userinfo'];
    }
});

provider.on('refresh_token.consumed', async (token) => {
    // console.log(token.grantId);
    const grant = await provider.Grant.find(token.grantId);
    const {adapter} = grant;
    const newGrant = new provider.Grant({
        jti: grant.jti,
        openid: grant.openid,
        accountId: grant.accountId,
        clientId: grant.clientId
    });
    await adapter.upsert(token.grantId, newGrant, 20);
});

provider.proxy = true;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/info', (req, res, next) => {
    res.json({});
});

app.get('/auth', (req, res, next) => {
    if (!req.query.prompt) {
        req.url = `${req.path}?${querystring.stringify(req.query)}&prompt=consent`;
    }
    next();
});

loginRoute(app, provider);
app.use(provider.callback());
module.exports = app;
