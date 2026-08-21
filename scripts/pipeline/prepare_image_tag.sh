#!/usr/bin/env bash

export NORMALIZED_CI_COMMIT_TAG=$(
  echo "$CI_COMMIT_TAG" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E '
      s/[^a-z0-9._-]/-/g;
      s/-+/-/g;
      s/^-//;
      s/-$//
    '
)

export IMAGE_TAG=${NORMALIZED_CI_COMMIT_TAG}-${TARGET_ENV}
