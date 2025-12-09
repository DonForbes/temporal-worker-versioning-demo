#!/bin/bash
#
# This script will output the status of ramping versions and drainage.
#
PURPLE="\033[0;35m"
RESET="\033[0m"

clear
while true 
do
        echo "---"
	echo -e "${PURPLE}Ramping status of new versions.${RESET}"
	kubectl -n temporal-worker-versioning get temporalworkerdeployments
	echo "---"
	temporal --env donald-demo worker deployment describe --name "temporal-worker-versioning/temporal-worker-versioning"
	sleep 3
	clear
done
