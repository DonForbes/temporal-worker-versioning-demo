#!/bin/bash
#
# Script accepts a couple of parameters the worklowID and the worker version that it is to use.
#
####
TARGET_DEPLOYMENT="temporal-worker-versioning/temporal-worker-versioning"
#### Routines ####
validate() {
if [ $# -lt 2 ]; then
	echo "You must enter two parameters, the workflow ID and the build ID to migrate to"
	exit 1
fi
# Could add validation to ensure that these are valid values
WORKFLOW_ID=$1
TARGET_BUILD_ID=$2
} # End Validate
####

validate $1 $2
echo "Migrating workflow ${WORKFLOW_ID} to versioning build  ${TARGET_BUILD_ID}"
temporal --env donald-demo workflow update-options \
  --workflow-id "$WORKFLOW_ID" \
  --versioning-override-behavior pinned \
  --versioning-override-deployment-name "$TARGET_DEPLOYMENT" \
  --versioning-override-build-id "$TARGET_BUILD_ID"
