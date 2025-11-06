package io.temporal.demos.worker_versioning.model.rest_interface;

import io.temporal.client.WorkflowExecutionMetadata;
import io.temporal.common.SearchAttributeKey;
import io.temporal.common.SearchAttributes;
import io.temporal.common.WorkerDeploymentVersion;
import lombok.Data;
import lombok.ToString;

import java.util.HashMap;
import java.util.List;

@Data
public class QueryMarketingWorkflowResponse {
    String workerDeployment;
    int workflowTotal;
    HashMap<String, QueryMarketingWorkerVersion> workers = new HashMap<String,QueryMarketingWorkerVersion>();

    private static SearchAttributeKey<String> deploymentName = SearchAttributeKey.forKeyword("TemporalWorkerDeployment");
    private static SearchAttributeKey<String> deploymentVersion = SearchAttributeKey.forKeyword("TemporalWorkerDeploymentVersion");

    public  QueryMarketingWorkflowResponse(List<WorkflowExecutionMetadata> workflows)
    {
        // Translates an array of workflows to pick out the version of the worker and count up the numbers of each.
        workflowTotal = workflows.size();
        for (WorkflowExecutionMetadata workflow : workflows) {

            if (this.workerDeployment == null)
                this.workerDeployment = workflow.getTypedSearchAttributes().get(deploymentName);

            incrementWorkerVersion(workflow.getTypedSearchAttributes().get(deploymentVersion));

        }
    } // End constructor
    private void incrementWorkerVersion(String workerDeploymentVersion)
    {
        // Method called for each workflow in the query and this will increment the counter in the hashmap.
        System.out.println("Worker Version: " + workerDeploymentVersion);
        QueryMarketingWorkerVersion versionDetails = workers.get(workerDeploymentVersion);
        if (versionDetails == null) {
            workers.put(workerDeploymentVersion, new QueryMarketingWorkerVersion(workerDeploymentVersion, 1));
            System.out.println("New worker version found: " + workerDeploymentVersion);
        }
        else {
            int currentCounter = versionDetails.getNumberOfWorkflows();
            workers.replace(workerDeploymentVersion, new QueryMarketingWorkerVersion(workerDeploymentVersion, ++currentCounter));
        }
    }
}
