const account = require('../models/account');

const createGrantObject = async (ctx) => {
    // const session = await ctx.oidc.provider.Session.get(ctx);
    // session['userinfo'] = {li: 'yhooo'};
    // console.log(session);
    // await session.save(2222);

    const grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId
    });
    grant.addOIDCScope('openid email offline_access');
    await grant.save();
    return grant;
};

module.exports = {
    findAccount: account.findAccount,
    clients: [
        {
            client_id: 'q',
            client_secret: 'q',
            redirect_uris: ['https://oidcdebugger.com/debug'],
            grant_types: ['authorization_code', 'refresh_token'],
            scope: 'openid email offline_access'
        },
        {
            client_id: 'qq',
            client_secret: 'qq',
            redirect_uris: ['http://localhost:3001/callback'],
            grant_types: ['authorization_code', 'refresh_token'],
            scope: 'openid email offline_access'
        }
    ],
    interactions: {
        url(ctx, interaction) { // eslint-disable-line no-unused-vars
            return `/interaction/${interaction.uid}`;
        }
    },
    cookies: {
        keys: ['qfdk']
    },
    claims: {
        openid: ['sub'],
        address: ['address'],
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: [
            'email',
            'birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
            'username', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo']
    },
    // scopes: ['openid','offline_access','profile'],
    features: {
        devInteractions: {enabled: false}, // defaults to true
        deviceFlow: {enabled: true}, // defaults to false
        revocation: {enabled: true},// defaults to false
        clientCredentials: {enabled: true},
        introspection: {
            enabled: true
        }
    },
    extraTokenClaims(ctx, token) {
        // throw  new InvalidGrant();
        return {
            'hello': 'word'
        };
    },
    async loadExistingGrant(ctx) {
        const grantId = (ctx.oidc.result
            && ctx.oidc.result.consent
            && ctx.oidc.result.consent.grantId) || ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

        // console.log(ctx.oidc.result);
        console.log('loadExistingGrant', grantId);
        if (grantId) {
            console.log('应该有 grantId');
            const grant = await ctx.oidc.provider.Grant.find(grantId);
            return !grant ? await createGrantObject(ctx) : grant;
        } else if (ctx.oidc.client) {
            console.log('建立新的 grant');
            return await createGrantObject(ctx);
        }
    },
    pkce: {required: () => false},
    jwks: {
        keys: [
            {
                d: 'VEZOsY07JTFzGTqv6cC2Y32vsfChind2I_TTuvV225_-0zrSej3XLRg8iE_u0-3GSgiGi4WImmTwmEgLo4Qp3uEcxCYbt4NMJC7fwT2i3dfRZjtZ4yJwFl0SIj8TgfQ8ptwZbFZUlcHGXZIr4nL8GXyQT0CK8wy4COfmymHrrUoyfZA154ql_OsoiupSUCRcKVvZj2JHL2KILsq_sh_l7g2dqAN8D7jYfJ58MkqlknBMa2-zi5I0-1JUOwztVNml_zGrp27UbEU60RqV3GHjoqwI6m01U7K0a8Q_SQAKYGqgepbAYOA-P4_TLl5KC4-WWBZu_rVfwgSENwWNEhw8oQ',
                dp: 'E1Y-SN4bQqX7kP-bNgZ_gEv-pixJ5F_EGocHKfS56jtzRqQdTurrk4jIVpI-ZITA88lWAHxjD-OaoJUh9Jupd_lwD5Si80PyVxOMI2xaGQiF0lbKJfD38Sh8frRpgelZVaK_gm834B6SLfxKdNsP04DsJqGKktODF_fZeaGFPH0',
                dq: 'F90JPxevQYOlAgEH0TUt1-3_hyxY6cfPRU2HQBaahyWrtCWpaOzenKZnvGFZdg-BuLVKjCchq3G_70OLE-XDP_ol0UTJmDTT-WyuJQdEMpt_WFF9yJGoeIu8yohfeLatU-67ukjghJ0s9CBzNE_LrGEV6Cup3FXywpSYZAV3iqc',
                e: 'AQAB',
                kty: 'RSA',
                n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
                p: '5wC6nY6Ev5FqcLPCqn9fC6R9KUuBej6NaAVOKW7GXiOJAq2WrileGKfMc9kIny20zW3uWkRLm-O-3Yzze1zFpxmqvsvCxZ5ERVZ6leiNXSu3tez71ZZwp0O9gys4knjrI-9w46l_vFuRtjL6XEeFfHEZFaNJpz-lcnb3w0okrbM',
                q: '3I1qeEDslZFB8iNfpKAdWtz_Wzm6-jayT_V6aIvhvMj5mnU-Xpj75zLPQSGa9wunMlOoZW9w1wDO1FVuDhwzeOJaTm-Ds0MezeC4U6nVGyyDHb4CUA3ml2tzt4yLrqGYMT7XbADSvuWYADHw79OFjEi4T3s3tJymhaBvy1ulv8M',
                qi: 'wSbXte9PcPtr788e713KHQ4waE26CzoXx-JNOgN0iqJMN6C4_XJEX-cSvCZDf4rh7xpXN6SGLVd5ibIyDJi7bbi5EQ5AXjazPbLBjRthcGXsIuZ3AtQyR0CEWNSdM7EyM5TRdyZQ9kftfz9nI03guW3iKKASETqX2vh0Z8XRjyU',
                use: 'sig'
            }
        ]
    },
    issueRefreshToken: (ctx, client, token) => {
        return true;
    },
    rotateRefreshToken: (ctx, token, client) => {
        // console.log(ctx.oidc.entities.RefreshToken.isSenderConstrained());
        return true;
    },
    // renderError: (ctx, out, error) => {
    //     // console.log(error);
    //     console.log(out);
    // },
    expiresWithSession: (ctx, token) => {
        return false;
    },
    ttl: {
        AccessToken: 1000,
        RefreshToken: 2000,
        Grant: 2000,
        Session: 2000,
        Interaction: (ctx, a, b) => {
            // console.log(ctx);
            return 2000;
        }
    }
};

