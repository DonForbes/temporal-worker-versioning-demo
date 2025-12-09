package io.temporal.demos.worker_versioning.workflows;


import io.temporal.activity.ActivityOptions;
import io.temporal.demos.worker_versioning.activities.MarketingActivities;
import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Async;
import io.temporal.workflow.Promise;
import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@WorkflowImpl
public class MarketingWorkflowImpl implements MarketingWorkflow {
    public static final Logger logger = Workflow.getLogger(MarketingWorkflowImpl.class);


    @Override
    public void runMarketingCampaign(MarketingCampaign campaign) {

        MarketingBundle bundle =
            this.getActivity(null, "MarketingWorkerVersioning")
                    .getMarketingBundle("TestCampaign");

        // Todo run a few of these concurrently, maybe make a child workflow to be more realistic...
        List<Promise<Void>> promises = new ArrayList<>();

        for (String targetChannel : bundle.getChannels()) {
            // 1. Start the child workflow asynchronously
            MarketingSendCampaign sendCampaign = Workflow.newChildWorkflowStub(MarketingSendCampaign.class);
            Promise<Void> promise = Async.procedure(sendCampaign::sendMarketingCampaign, campaign,targetChannel);
            promises.add(promise);
        }

        // 2. Wait for all promises to complete
        Promise.allOf(promises).get();

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
