#!/usr/bin/env bash
./scripts/test_utils/get_components_without_test.sh | while IFS= read -r path; do npm run generate-component-test-skeleton -- --path=\"$path\"; done
