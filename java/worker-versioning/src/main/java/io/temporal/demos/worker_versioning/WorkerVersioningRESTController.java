package io.temporal.demos.worker_versioning;


import io.temporal.client.WorkflowExecutionMetadata;
import io.temporal.client.WorkflowOptions;
import io.temporal.client.WorkflowStub;
import io.temporal.common.SearchAttributeKey;
import io.temporal.common.SearchAttributes;
import io.temporal.demos.worker_versioning.model.UserData;
import io.temporal.demos.worker_versioning.model.rest_interface.QueryMarketingWorkflowResponse;
import io.temporal.demos.worker_versioning.model.rest_interface.QueryMarketingWorkflowsRequest;
import io.temporal.demos.worker_versioning.model.rest_interface.QueryOnboardingWorkflowResponse;
import io.temporal.demos.worker_versioning.model.rest_interface.StartMarketingWFConfig;
import io.temporal.demos.worker_versioning.util.BackgroundMarketingWFStart;
import io.temporal.demos.worker_versioning.workflows.MarketingWorkflow;
import io.temporal.demos.worker_versioning.workflows.OnboardingWorkflow;
import io.temporal.spring.boot.autoconfigure.properties.TemporalProperties;
import io.temporal.spring.boot.autoconfigure.properties.WorkerProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.temporal.client.WorkflowClient;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@RestController
public class WorkerVersioningRESTController {
    private static final Logger logger = LoggerFactory.getLogger(WorkerVersioningRESTController.class);

    @Autowired
    private WorkflowClient client;
    @Autowired
    BackgroundMarketingWFStart backgroundMarketingWFStart;
    @Autowired
    private ApplicationContext ctx;

    @GetMapping("hello")
    public ResponseEntity<String> hello() {
        
        return ResponseEntity.ok("Hello World");
    }

    @PostMapping("start-marketing-workflows")
    public ResponseEntity<String> startMarketingWorkflows(@RequestBody StartMarketingWFConfig config)
    {
        // This method is used to kick of an async thread that will simply start n workflows at a rate provided by the request.
        //  Will have the data for the workflow fairly hardwired at least initially.
        if (config.getNumberOfWorkflows() > 2000) {
            return ResponseEntity.badRequest().body("{ \"message\": \"Number of workflows must be less than 2000\" }");
        }

        logger.debug("Received request to start " + config.getNumberOfWorkflows() + " marketing workflows");
        backgroundMarketingWFStart.startMarketingWFInBackground(config);
        logger.debug("Background task started");
        return ResponseEntity.ok("{ \"message\": \"Started " + config.getNumberOfWorkflows() + " marketing workflows\" }");

    } // End startMarketingWorkflows

    @PostMapping("query-marketing-workflows")
    public ResponseEntity<QueryMarketingWorkflowResponse> queryMarketingWorkflows(@RequestBody QueryMarketingWorkflowsRequest request)
    {
        // Note - assuming that all workflows in test are for the same worker deployment.  May need to improve this...
        Stream<WorkflowExecutionMetadata> workflowMetadata;
        if (!request.getGetRunning())
           workflowMetadata = client.listExecutions(
                    "WorkflowId STARTS_WITH \"" + request.getWorkflowPrefix() + "\" AND StartTime >= \"" + this.getStartTime(request.getWorkflowSearchWindow()) + "\"" );
        else
           workflowMetadata = client.listExecutions(
                    "WorkflowId STARTS_WITH \"" + request.getWorkflowPrefix() + "\" AND ExecutionStatus =\"Running\"" );

        List<WorkflowExecutionMetadata> wfList = (List<WorkflowExecutionMetadata>)workflowMetadata.toList();
        WorkerVersioningRESTController.logger.info("Workflow Execution Metadata: " + wfList);

        QueryMarketingWorkflowResponse response = new QueryMarketingWorkflowResponse(wfList);

        return ResponseEntity.of(Optional.of(response));

    } // End queryMarketingWorkflows

    /**
     * Gets the start time by subtracting the specified number of seconds from the current time.
     * @param seconds Number of seconds to subtract from current time
     * @return ISO-8601 formatted date string (e.g., "2025-11-10T14:58:43.409Z")
     */
    private String getStartTime(int seconds) {
        Instant startTime = Instant.now().minusSeconds(seconds);
        return DateTimeFormatter.ISO_INSTANT.format(startTime);
    }


    @PostMapping("start-onboarding-workflow")
    public ResponseEntity<String> startOnboardingWorkflow(@RequestBody UserData user) {
        String workflowId = user.getUserName() + "-" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyMMdd-HHss"));
        OnboardingWorkflow workflow = client.newWorkflowStub(
                OnboardingWorkflow.class,
                WorkflowOptions.newBuilder()
                        .setTaskQueue(this.getOnboardingWorkflowTaskQueueName())
                        .setWorkflowId(workflowId)
                        .build());
        WorkflowClient.start(workflow::onboardingUser, user);
        return ResponseEntity.ok("{ \"message\": \"Started workflow " + workflowId + "\" }");
    }
    @GetMapping("onboarding-workflows")
    public ResponseEntity<List<QueryOnboardingWorkflowResponse>> getOnboardingWorkflows() {
        String query = "ExecutionStatus = 'Running' AND `WorkflowType`=\"OnboardingWorkflow\"";
        List<QueryOnboardingWorkflowResponse> response = new ArrayList<QueryOnboardingWorkflowResponse>();

        client.listExecutions(query).forEach((wfMeta -> {
            QueryOnboardingWorkflowResponse queryResponse = new QueryOnboardingWorkflowResponse();
            queryResponse.setWorkflowId(wfMeta.getExecution().getWorkflowId());
            queryResponse.setStartTime(wfMeta.getStartTime().toString());
            SearchAttributes typedSearchAttributes = wfMeta.getTypedSearchAttributes();
            queryResponse.setStep(typedSearchAttributes.get(SearchAttributeKey.forKeyword("Step")));
            queryResponse.setWorkerVersion(typedSearchAttributes.get(SearchAttributeKey.forKeyword("TemporalWorkerDeploymentVersion")));
            response.add(queryResponse);
        }));

        return ResponseEntity.of(Optional.of(response));
    }

    @PostMapping("sign-documentation/{workflowID}")
    public ResponseEntity<String> approveWorkflow(@PathVariable String workflowID) {
        WorkflowStub onboardingWF = client.newUntypedWorkflowStub(workflowID);

        onboardingWF.signal("signalDocumentationSigned");
        return ResponseEntity.ok("{ \"message\": \"Workflow " + workflowID + " approved\" }");
    } // End signalWorkflow

    private String getOnboardingWorkflowTaskQueueName() {
        // Parse the config to pick out the task queue for the activity. (Will be simpler once issue #1647 implemented)
        TemporalProperties props = ctx.getBean(TemporalProperties.class);
        Optional<WorkerProperties> wp =
                props.getWorkers().stream().filter(w -> w.getName().equals("OnboardingWorker")).findFirst();
        return wp.get().getTaskQueue();
    }  // End GetOnboardingWorkflowTaskQueueName

    @RequestMapping(method = RequestMethod.OPTIONS, path = "start-marketing-workflows")
    public ResponseEntity<Void> optionsStartMarketingWorkflows() {
        System.out.println("In optionsStartMarketingWorkflows");
        return ResponseEntity.ok().build();
    }

    @RequestMapping(method = RequestMethod.OPTIONS, path = "query-marketing-workflows")
    public ResponseEntity<Void> optionsQueryMarketingWorkflows() {
        System.out.println("In optionsQueryMarketingWorkflows");
        return ResponseEntity.ok().build();
    }
}
