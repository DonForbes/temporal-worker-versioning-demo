package io.temporal.demos.worker_versioning;


import io.temporal.demos.worker_versioning.model.rest_interface.StartMarketingWFConfig;
import io.temporal.demos.worker_versioning.util.BackgroundMarketingWFStart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.temporal.client.WorkflowClient;


@RestController
@CrossOrigin()
public class WorkerVersioningRESTController {
    private static final Logger logger = LoggerFactory.getLogger(WorkerVersioningRESTController.class);

    @Autowired
    WorkflowClient client;
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
        backgroundMarketingWFStart.startMarketingWFInBackground(config);
        return ResponseEntity.ok("Started " + config.getNumberOfWorkflows() + " marketing workflows");

    } // End startMarketingWorkflows
}
