package io.temporal.demos.worker_versioning.util;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.demos.worker_versioning.model.CampaignTarget;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.demos.worker_versioning.model.rest_interface.StartMarketingWFConfig;
import io.temporal.demos.worker_versioning.workflows.MarketingWorkflow;
import io.temporal.spring.boot.autoconfigure.properties.TemporalProperties;
import io.temporal.spring.boot.autoconfigure.properties.WorkerProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BackgroundMarketingWFStart {
    private static final Logger logger = LoggerFactory.getLogger(BackgroundMarketingWFStart.class);

    @Autowired
    WorkflowClient client;
    @Autowired
    private ApplicationContext ctx;

    @Async("taskExecutor")
    public void startMarketingWFInBackground(StartMarketingWFConfig config) {
        logger.info("Starting background task on thread: {}",
                Thread.currentThread().getName());

        // Hard wiring a campaign for the input data.
        MarketingCampaign campaign = new MarketingCampaign();
        campaign.setCampaignName("TestCampaign");
        CampaignTarget target = new CampaignTarget();
        target.setTargetUsers(new ArrayList<>(List.of("Bob", "Jane", "Fred")));
        target.setTargetUserGroups(new ArrayList<>(List.of("VIP", "SocialDaemons", "email-luddites")));
        campaign.setTarget(target);


        try {
            for (int wfNumber = 1; wfNumber <= config.getNumberOfWorkflows(); wfNumber++) {
                MarketingWorkflow workflow = client.newWorkflowStub(
                        MarketingWorkflow.class,
                        WorkflowOptions.newBuilder()
                                .setTaskQueue(this.getMarketingWorkflowTaskQueueName())
                                .setWorkflowId(config.getTestPrefix() + "-" + wfNumber)
                                .build()
                );

                WorkflowClient.start(workflow::runMarketingCampaign, campaign);

                // Assuming the start workflow is about 50ms so work out a sleep that will match the requested rate
                // Approx!!!
                int sleepTime = Math.max(0, (1000 / config.getWorkflowStartRatePerSecond()) - 50);
                if (sleepTime > 0) {
                    Thread.sleep(sleepTime);
                }
            }


            logger.info("Background task completed");
        } catch (Exception e) {
            logger.error("Error in background task", e);
        }
    }

    private String getMarketingWorkflowTaskQueueName() {
        // Parse the config to pick out the task queue for the activity. (Will be simpler once issue #1647 implemented)
        TemporalProperties props = ctx.getBean(TemporalProperties.class);
        Optional<WorkerProperties> wp =
                props.getWorkers().stream().filter(w -> w.getName().equals("MarketingWorker")).findFirst();
        return wp.get().getTaskQueue();
    }
}