/**
 * HTTP server which handles webhook from GitHub.
 */
const path = require('path');
const crypto = require('crypto');
const fastify = require('fastify');

const {
    main,
} = require('./webhook.js');

/**
 * port to listen.
 */
const serverPort = parseInt(process.env.SERVER_PORT || 8080);
/**
 * secret to check digest.
 */
const SECRET = process.env.SECRET || '';

// HTTP server
const srv = fastify({
    logger: true,
});

// register static middleware
srv.register(require('fastify-static'), {
    root: path.join(__dirname, 'public/static'),
    prefix: '/static/',
});

// customize the parser to calculate digest.
srv.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const payload = JSON.parse(body);
    done(null, {
        payload,
        digest: secureDigest(body),
    });
  } catch (err) {
    err.statusCode = 400;
    done(err, undefined);
  }
})

srv.get('/', async (request, reply) => {
    reply.type('text/plain').code(200);
    return 'server';
});
srv.post('/webhook', async (request, reply) => {
    // request.body should be given as JSON object.
    const {
        payload,
        digest,
    } = request.body;
    const requestDelivery = request.headers['x-github-delivery'];
    srv.log.info(`delivery ${requestDelivery}`);
    const requestDigest = request.headers['x-hub-signature'];

    reply.type('text/plain').code(200);
    return main(payload, digest, {
        requestDigest,
    });
});

srv.listen(serverPort, '0.0.0.0', (err, address) => {
    if (err) {
        throw err;
    }
    srv.log.info(`server listening on ${address}`)
});

/**
 * Make hmac digest.
 */
function secureDigest(input) {
    const hmac = crypto.createHmac('sha1', SECRET);
    hmac.update(input);
    return 'sha1=' + hmac.digest('hex');
}

