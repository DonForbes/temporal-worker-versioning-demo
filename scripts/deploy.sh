#!/bin/bash
#
# Script used to deploy app to kubernetes.  Assumes you have kubectl setup with the context set to use the right cluster!
#
#  *** Subroutines
validate() {
	echo "Validation - NoOp"
}
setup_context() {
	kubectl config set-context --current --namespace=${K8S_NAMESPACE}
	SCRIPT_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")
}
create_secrets() {
	SECRET_NAME=temporal-auth-tls
        kubectl delete secret ${SECRET_NAME}
	kubectl create secret tls ${SECRET_NAME} --cert=${AUTH_CERT_PATH} --key=${AUTH_KEY_PATH}
}
#
source setup-env.sh
# 
setup_context
create_secrets

env | grep K8S
echo ${SCRIPT_DIR}
kubectl apply -f ${SCRIPT_DIR}/../k8s
kubectl get pods
kubectl get secrets 

