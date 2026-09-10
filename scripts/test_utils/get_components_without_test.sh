#!/usr/bin/env bash

directory="${1:-.}"

find "$directory" -type f -name '*.component.ts' ! -name '*.component.spec.ts' -print0 |
while IFS= read -r -d '' component; do
  spec="${component%.component.ts}.component.spec.ts"

  if [[ ! -f "$spec" ]]; then
    echo "$component"
  fi
done
