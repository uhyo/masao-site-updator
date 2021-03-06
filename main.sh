#! /bin/sh
set -eu

DIST=`echo -n "${BRANCH}" | sed -e 's/\//./g'`

echo "updating branch ${BRANCH}"
date
# update masao repository
cd git
if [ ! -e mc_canvas ]; then
	git clone https://github.com/uhyo/mc_canvas.git
fi

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
cd ../..
mkdir -p public/dist/output/${DIST}/
echo -n $HASH > public/dist/output/${DIST}/HASH

for filename in git/mc_canvas/Outputs/*.js; do
  BN=`basename "${filename}"`
  (echo "/**
  * ${BN}
  * commit hash: ${HASH}
  */";
  cat "$filename") > public/dist/output/${DIST}/${BN}
done
# update file list.
./update-filelist.sh > public/dist/files.json
echo "done"
date
