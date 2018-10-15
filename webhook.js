#! /usr/bin/env node

/**
 * Script to handle GitHub webhook (push evengt).
 * Required environment variables:
 * SECRET = secret for hmac digest.
 * DIGEST = message digest sent from GitHub.
 */
const path = require('path');
const child_process = require('child_process');

exports.main = function main(payload, digest, options) {
    // Check correspondence of digest.
    if (options.requestDigest !== digest) {
        return 'Digest mismatch';
    }

    // Check whether this is a push to a branch.
    const { ref } = payload;
    if (ref == null) {
        // ping?
        return 'Successfully handled ping?';
    }
    const r = ref.match(/^refs\/heads\/(.+)$/);
    if (r == null) {
        // Exit normally.
        return 'Nothing to do';
        process.exit(0);
    }


    // Throw it to the shell script.
    return new Promise((resolve, reject) => {
        child_process.execFile(
            path.resolve(__dirname, 'main.sh'),
            [],
            {
                env: {
                    BRANCH: r[1],
                },
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                    throw err;
                }
                console.log(stdout);
                resolve('Successfully handled webhook');
            },
        );
    });
};
