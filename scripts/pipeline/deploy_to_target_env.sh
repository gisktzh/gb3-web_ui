#!/usr/bin/env bash

set -euo pipefail

echo "$CI_REGISTRY_PASSWORD" | ssh "$SSH_USER@$SSH_HOST" "docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY"
REMOTE_DIR="/home/$SSH_USER/$WORK_DIR"
ssh "$SSH_USER@$SSH_HOST" "mkdir -p '$REMOTE_DIR'"
scp docker-compose.ktzh.yml "$SSH_USER@$SSH_HOST:$REMOTE_DIR/docker-compose.yml"
ssh "$SSH_USER@$SSH_HOST" "
  export IMAGE_TAG=$(printf '%q' "$IMAGE_TAG") &&
  cd $(printf '%q' "$REMOTE_DIR") &&
  docker compose -f docker-compose.yml pull &&
  docker compose -f docker-compose.yml up -d --force-recreate
"
