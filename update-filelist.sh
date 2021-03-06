#! /bin/sh
set -eu

# emit list of currently available distributions in JSON format.

echo "{
  \"branches\": ["

for dir in public/dist/output/*; do
  HASH=`cat ${dir}/HASH`
  echo "    {
      \"name\": \"$(basename "${dir}")\",
      \"hash\": \"${HASH}\",
      \"last-update\": $(stat -c "%Y" ${dir}/HASH),
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
