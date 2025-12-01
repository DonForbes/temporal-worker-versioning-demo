package io.temporal.demos.worker_versioning.model.rest_interface;

import lombok.Data;

@Data
public class QueryOnboardingWorkflowResponse {
    String workflowId;
    String startTime;
    String workerVersion;
    String step;
}
