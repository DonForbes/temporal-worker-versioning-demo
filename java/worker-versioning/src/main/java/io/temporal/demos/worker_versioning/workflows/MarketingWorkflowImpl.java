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
