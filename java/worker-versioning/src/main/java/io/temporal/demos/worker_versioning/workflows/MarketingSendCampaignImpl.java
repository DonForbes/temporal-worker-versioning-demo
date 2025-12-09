package io.temporal.demos.worker_versioning.workflows;

import io.temporal.activity.ActivityOptions;
import io.temporal.demos.worker_versioning.activities.MarketingActivities;
import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;

import java.time.Duration;

@WorkflowImpl
public class MarketingSendCampaignImpl implements MarketingSendCampaign{
    @Override
    public Boolean sendMarketingCampaign(MarketingCampaign campaign, String campaignChannel)
    {

        String formattedMessage =
                this.getActivity("FormatFor" + campaignChannel, "MarketingWorkerVersioning").formatCampaignMessage(campaign);

        return this.getActivity("SendTo" + campaignChannel , "MarketingWorkerVersioning").sendMarketingCampaign(campaign, formattedMessage);
    }

    private MarketingActivities getActivity(String activityName, String taskQueue) {

        ActivityOptions.Builder actOptions = ActivityOptions.newBuilder()
                .setStartToCloseTimeout(Duration.ofSeconds(30))
                .setTaskQueue(taskQueue);

        if (activityName != null && !activityName.isEmpty())
            actOptions.setSummary(activityName);

        return Workflow.newActivityStub(
                MarketingActivities.class, actOptions.build());

    } // end getActivity
}
