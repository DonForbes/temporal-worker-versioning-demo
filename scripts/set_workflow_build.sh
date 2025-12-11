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
        if temporal --version > /dev/null; then
          echo "maven installed"
        else
          echo "Please ensure you have maven installed and available on the command line."
          exit 1
        fi
	if [ $# -lt 2 ]; then
		echo "You must enter two parameters, a workflow id and a target buildId."
		exit 1
	else
		WORKFLOW_ID=$1
		TARGET_BUILD_ID=$2
	fi
} # end validate

#
# ***** Main processing *****
SCRIPT_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")
source ${SCRIPT_DIR}/setup-env.sh 

validate $*
echo $WORKER_DEPLOYMENT_NAME "-" $WORKFLOW_ID "=" $TARGET_BUILD_ID
temporal --env ${TEMPORAL_CLI_ENV} workflow update-options \
  --workflow-id "${WORKFLOW_ID}" \
  --versioning-override-behavior pinned \
  --versioning-override-deployment-name "${WORKER_DEPLOYMENT_NAME}" \
  --versioning-override-build-id "${TARGET_BUILD_ID}"

