package io.temporal.demos.worker_versioning.model.rest_interface;

import lombok.Data;

@Data
public class QueryMarketingWorkflowsRequest {
    String workflowPrefix;
    int workflowSearchWindow = 30;
}
