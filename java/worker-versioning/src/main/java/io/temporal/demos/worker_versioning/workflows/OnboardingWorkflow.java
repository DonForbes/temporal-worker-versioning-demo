package io.temporal.demos.worker_versioning.workflows;

import io.temporal.demos.worker_versioning.model.UserData;
import io.temporal.workflow.QueryMethod;
import io.temporal.workflow.SignalMethod;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface OnboardingWorkflow {

    @WorkflowMethod
    public void onboardingUser(UserData user);

    @SignalMethod
    public void signalDocumentationSigned();

}
