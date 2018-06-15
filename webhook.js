#! /usr/bin/env node

/**
 * Script to handle GitHub webhook (push evengt).
 * Required environment variables:
 * SECRET = secret for hmac digest.
 * DIGEST = message digest sent from GitHub.
 */
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const crypto = require('crypto');

// Read all inputs from stdin.
const input = fs.readFileSync('/dev/stdin', 'utf8');
const payload = input ? JSON.parse(input) : {};

// Check correspondence of digest.
if (process.env.DIGEST !== secureDigest(input)) {
    writeResponse('Digest mismatch');
    process.exit(0);
}

// Check whether this is a push to a branch.
const { ref } = payload;
if (ref == null) {
    // ping?
    writeResponse('Successfully handled ping?');
    process.exit(0);
}
const r = ref.match(/^refs\/heads\/(.+)$/);
if (r == null) {
    // Exit normally.
    writeResponse('Nothing to do');
    process.exit(0);
}


// Throw it to the shell script.
child_process.execFileSync(
    path.resolve(__dirname, 'main.sh'),
    [],
    {
        stdio: ['ignore', process.stdout, process.stderr],
        env: {
            BRANCH: r[1],
        },
    },
);

writeResponse('Successfully handled webhook');

/**
 * Make hmac digest.
 */
function secureDigest(input) {
    // Secret token which should be sent from GitHub.
    const SECRET = process.env.SECRET;

    const hmac = crypto.createHmac('sha1', SECRET);
    hmac.update(input);
    return 'sha1=' + hmac.digest('hex');
}


/**
 * Write a text seponse.
 */
function writeResponse(text) {
  process.stdout.write(`Content-Type: text/plain; charset=utf-8
Content-Length: ${text.length}

${text}
`);
}

