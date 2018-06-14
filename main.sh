#! /bin/sh
set -eu

DIST=`echo -n "${BRANCH}" | sed -e 's/\//./g'`

echo "updating branch ${BRANCH}"
date
# update masao repository
cd mc_canvas
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

if [ ! -d Outputs ]; then
  # build latest masao
  npm ci
  npm run build-all
fi

# copy the result to dist
HASH=`git rev-parse "${BRANCH}"`
cd ..
mkdir -p dist/${DIST}/
for filename in mc_canvas/Outputs/*.js; do
  BN=`basename "${filename}"`
  (echo "/**
  * ${BN}
  * commit hash: ${HASH}
  */";
  cat "$filename") > dist/${DIST}/${BN}
done
echo "done"
date
