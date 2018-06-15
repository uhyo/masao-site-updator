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
const payload = JSON.parse(input);

// Check correspondence of digest.
if (process.env.DIGEST !== secureDigest(payload)) {
    console.error('payload mismatch');
    process.exit(1);
}

// Check whether this is a push to a branch.
const { ref } = payload;
const r = ref.match(/^refs\/heads\/(.+)$/);
if (r == null) {
    // Exit normally.
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

/**
 * Make hmac digest.
 */
function secureDigest(payload) {
    // Secret token which should be sent from GitHub.
    const SECRET = process.env.SECRET;

    const hmac = crypto.createHmac('sha1', SECRET);
    hmac.update(payload);
    return 'sha1=' + hmac.digest('hex');
}

