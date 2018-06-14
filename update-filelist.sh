#! /bin/sh
set -eu

# emit list of currently available distributions in JSON format.

echo "{
  branches: ["

for dir in dist/output/*; do
  HASH=`cat ${dir}/HASH`
  echo "    {
      \"hash\": \"${HASH}\",
      \"files\": ["
  for file in ${dir}/*.js; do
    echo "        \"$(basename "${file}")\","
  done
  echo "        null
      ]
    },"
done
echo "    null
  ]
}"
