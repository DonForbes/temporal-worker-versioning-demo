#!/bin/bash
#
# This is just a tidy up script to allow us to remove old worker version so that the output of the monitoring scripts is
# a little tidier.  (And might be useful to have anyway.)
#
# ***** Local variables *****
#
# ***** Routines  *****
#
validate() {
    	# Validate any input parameters and environment setup.
	echo "validation"
        if jq --version > /dev/null; then
          echo "jq installed installed"
        else
          echo "Please ensure you have jq installed and available on the command line."
          exit 1
        fi

        if temporal --version > /dev/null; then
          echo "temporal cli installed."
        else
          echo "temporal is not installed please install and make available.  (Mac - brew install temporal)"
          exit 1
        fi
} # end validate

delete_drained_version() {
	DRAINED_JSON=$1
	worker_deployment=$(echo "${DRAINED_JSON}" | jq -r '.deploymentName') 
	worker_deployment_build=$(echo "${DRAINED_JSON}" | jq -r '.BuildID') 

	echo "deleting worker deployment " $worker_deployment " for build "  $worker_deployment_build
	temporal --env ${TEMPORAL_CLI_ENV} worker deployment delete-version --deployment-name "${WORKER_DEPLOYMENT_NAME}" --build-id ${worker_deployment_build}
}
#
# ***** Main processing *****
SCRIPT_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")
source ${SCRIPT_DIR}/setup-env.sh 

validate $*

WORKER_VERSIONS=$(temporal --env ${TEMPORAL_CLI_ENV}  worker deployment describe --name "${WORKER_DEPLOYMENT_NAME}" -o json | jq '.versionSummaries[] | select(.drainageStatus=="drained")')

echo $WORKER_VERSIONS | jq -c '.' | while IFS= read -r item; do
	delete_drained_version $item
done

