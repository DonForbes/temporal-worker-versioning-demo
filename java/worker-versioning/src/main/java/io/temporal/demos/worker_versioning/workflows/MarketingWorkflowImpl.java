package io.temporal.demos.worker_versioning.workflows;


import io.temporal.activity.ActivityOptions;
import io.temporal.demos.worker_versioning.activities.MarketingActivities;
import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.time.Duration;

public class MarketingWorkflowImpl implements MarketingWorkflow {
    public static final Logger logger = Workflow.getLogger(MarketingWorkflowImpl.class);


    @Override
    public void runMarketingCampaign(MarketingCampaign campaign) {

        MarketingBundle bundle =
            this.getActivity(null, "MarketingWorkerVersioning")
                    .getMarketingBundle("TestCampaign");

        // Todo run a few of these concurrently, maybe make a child workflow to be more realistic...
        this.getActivity("e-mail campaign", "MarketingWorkerVersioning").sendMarketingBlast(bundle);

        // Waiting a bit to show waiting on marketing results coming in.
        Workflow.sleep(Duration.ofSeconds(30));

        MarketingBundle resultsBundle =
            this.getActivity(null, "MarketingWorkerVersioning").getMarketingResults(bundle);

  }  // End runMarketingCampaign

    private MarketingActivities getActivity(String activityName, String taskQueue) {

        ActivityOptions.Builder actOptions = ActivityOptions.newBuilder()
                .setStartToCloseTimeout(Duration.ofSeconds(30))
                .setTaskQueue(taskQueue);

        if (activityName != null && !activityName.isEmpty())
            actOptions.setSummary(activityName);

        return Workflow.newActivityStub(
                MarketingActivities.class, actOptions.build());

    }
}
