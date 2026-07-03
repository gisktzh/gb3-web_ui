#!/usr/bin/env bash

set -euo pipefail

apt-get -yqq install openssh-client
install -m 600 -D /dev/null ~/.ssh/id_rsa

mkdir -p ~/.ssh

SSH_KEY_VAR=$(echo "SSH_KEY_${TARGET_ENV}_FRONTEND" | tr '[:lower:]' '[:upper:]')

printf '%s' "${!SSH_KEY_VAR}" | base64 -d > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

SSH_HOST_VAR=$(echo "SSH_HOST_${TARGET_ENV}_FRONTEND" | tr '[:lower:]' '[:upper:]')
export SSH_HOST="${!SSH_HOST_VAR}"

ssh-keyscan "$SSH_HOST" >> ~/.ssh/known_hosts

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
