#!/bin/bash
#
# Script used to deploy app to kubernetes.  Assumes you have kubectl setup with the context set to use the right cluster!
#
#  *** Subroutines
validate() {
	if mvn --version > /dev/null; then
	  echo "Maven installed"
	else 
	  echo "Please ensure you have Maven installed and available on the command line."
	  exit 1
        fi
	
	if ytt --version > /dev/null; then
          echo "ytt installed."
	else
	  echo "YTT is not installed please install and make availabe.  (Mac - brew install ytt)"
	  exit 1
        fi
}
setup_context() {
	# Get from git the most recent version of files
        git pull
	kubectl config set-context --current --namespace=${K8S_NAMESPACE}
	SCRIPT_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")
	export WORKER_VERSION_image__version=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout -f ${SCRIPT_DIR}/../java/worker-versioning/pom.xml)
	export WORKER_VERSION_image__url="ghcr.io/${GITHUB_ACCOUNT}/temporal-worker-versioning-demo:${WORKER_VERSION_image__version}"
}
create_secrets() {
	SECRET_NAME=temporal-auth-tls
        kubectl delete secret ${SECRET_NAME}
	kubectl create secret tls ${SECRET_NAME} --cert=${AUTH_CERT_PATH} --key=${AUTH_KEY_PATH}
}
#
source setup-env.sh
validate
setup_context

#create_secrets

env | grep WORKER_VERSION
ytt -f ${SCRIPT_DIR}/../k8s/deployment.yaml  -f ${SCRIPT_DIR}/../k8s/worker-versioning-values.yaml --data-values-env WORKER_VERSION | kubectl apply -f -
kubectl apply -f ${SCRIPT_DIR}/../k8s/temporal-connection.yaml
kubectl apply -f ${SCRIPT_DIR}/../k8s/ingress-route.yaml
kubectl apply -f ${SCRIPT_DIR}/../k8s/service.yaml
kubectl get pods
kubectl get secrets 

