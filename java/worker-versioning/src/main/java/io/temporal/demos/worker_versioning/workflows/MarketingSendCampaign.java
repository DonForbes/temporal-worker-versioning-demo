package io.temporal.demos.worker_versioning.workflows;

import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface MarketingSendCampaign {
    @WorkflowMethod
    public Boolean sendMarketingCampaign(MarketingCampaign campaign, String campaignChannel);
}
