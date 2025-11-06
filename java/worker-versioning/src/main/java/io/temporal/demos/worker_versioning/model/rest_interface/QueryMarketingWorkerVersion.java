package io.temporal.demos.worker_versioning.model.rest_interface;

import lombok.Data;
import lombok.ToString;

@Data
public class QueryMarketingWorkerVersion {

    String workerVersion;
    int numberOfWorkflows = 0;

    public QueryMarketingWorkerVersion(String pWorkerVersion, int pNumberOfWorkflows) {
        this.workerVersion = pWorkerVersion;
        this.numberOfWorkflows = pNumberOfWorkflows;
    }
}
