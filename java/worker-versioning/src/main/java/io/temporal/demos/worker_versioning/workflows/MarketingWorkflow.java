package io.temporal.demos.worker_versioning.workflows;

import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface MarketingWorkflow {

    @WorkflowMethod
    public void runMarketingCampaign(MarketingCampaign campaign);


}
