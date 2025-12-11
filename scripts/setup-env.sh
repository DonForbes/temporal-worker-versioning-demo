#!/bin/bash
#
export APP_NAME=temporal-worker-versioning-demo
export K8S_NAMESPACE=temporal-worker-versioning
export GITHUB_ACCOUNT=donforbes
export AUTH_CERT_PATH=$HOME/stuff/source/certificates/temporal-client-leaf.pem
export AUTH_KEY_PATH=$HOME/stuff/source/certificates/temporal-client.key
export WORKER_DEPLOYMENT_NAME=${K8S_NAMESPACE}/${K8S_NAMESPACE}
export TEMPORAL_CLI_ENV=donald-demo
