package io.temporal.demos.worker_versioning.model.rest_interface;

import lombok.Data;

import java.text.SimpleDateFormat;
import java.util.Calendar;

@Data
public class StartMarketingWFConfig {
    String testPrefix = "Test-" + new SimpleDateFormat("yyyyMMdd-HHmm").format(Calendar.getInstance().getTime());
    int numberOfWorkflows = 400;
    int workflowStartRatePerSecond = 5;
}
