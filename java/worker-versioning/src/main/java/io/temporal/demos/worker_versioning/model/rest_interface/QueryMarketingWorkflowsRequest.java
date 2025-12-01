package io.temporal.demos.worker_versioning.model.rest_interface;

import lombok.Data;

@Data
public class QueryMarketingWorkflowsRequest {
    String workflowPrefix;
    int workflowSearchWindow = 30; // If getRunning is false then this limits to WFs in started in the last n secs.
    Boolean getRunning = false;  // If set to true then the query will get all running workflows for the prefix
}
