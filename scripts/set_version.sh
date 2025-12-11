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
        if mvn --version > /dev/null; then
          echo "maven installed"
        else
          echo "Please ensure you have maven installed and available on the command line."
          exit 1
        fi
	if [ $# -lt 1 ]; then
		echo "You must enter a parameter to specify the version you are setting the worker app to."
		exit 1
	else
		NEW_VERSION=$1
	fi
} # end validate

#
# ***** Main processing *****
SCRIPT_DIR=$(dirname "$(realpath "${BASH_SOURCE[0]}")")
source ${SCRIPT_DIR}/setup-env.sh 

validate $*
mvn versions:set -DnewVersion=${NEW_VERSION} -f ${SCRIPT_DIR}/../java/worker-versioning/pom.xml


