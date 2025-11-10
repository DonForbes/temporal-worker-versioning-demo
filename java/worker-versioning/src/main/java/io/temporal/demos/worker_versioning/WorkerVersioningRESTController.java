package io.temporal.demos.worker_versioning;


import io.temporal.client.WorkflowExecutionMetadata;
import io.temporal.demos.worker_versioning.model.rest_interface.QueryMarketingWorkflowResponse;
import io.temporal.demos.worker_versioning.model.rest_interface.QueryMarketingWorkflowsRequest;
import io.temporal.demos.worker_versioning.model.rest_interface.StartMarketingWFConfig;
import io.temporal.demos.worker_versioning.util.BackgroundMarketingWFStart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.temporal.client.WorkflowClient;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
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
        logger.debug("Received request to start " + config.getNumberOfWorkflows() + " marketing workflows");
        backgroundMarketingWFStart.startMarketingWFInBackground(config);
        logger.debug("Background task started");
        return ResponseEntity.ok("{ message: Started " + config.getNumberOfWorkflows() + " marketing workflows }");

    } // End startMarketingWorkflows

    @PostMapping("query-marketing-workflows")
    public ResponseEntity<QueryMarketingWorkflowResponse> queryMarketingWorkflows(@RequestBody QueryMarketingWorkflowsRequest request)
    {
        // Note - assuming that all workflows in test are for the same worker deployment.  May need to improve this...
        Stream<WorkflowExecutionMetadata> workflowMetadata = client.listExecutions(
                "WorkflowId STARTS_WITH \"" + request.getWorkflowPrefix() + "\" AND StartTime >= \"" + this.getStartTime(request.getWorkflowSearchWindow()) + "\"" );
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
