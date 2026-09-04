#!/usr/bin/env bash

component_ts="$1"
base="${component_ts%.component.ts}"

npm run generate-component-test-skeleton -- --path="$component_ts"

{
  printf 'Component TS:\n```\n'
  cat "$component_ts"
  printf '\n```\n\nComponent HTML:\n```\n'
  cat "${base}.component.html"
  printf '\n```\n\nTest skeleton:\n```\n'
  cat "${base}.component.spec.ts"
  printf '\n```\n'
} | clip.exe

code ${base}.component.spec.ts
