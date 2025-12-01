package io.temporal.demos.worker_versioning.workflows;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.SearchAttributeKey;
import io.temporal.demos.worker_versioning.activities.MarketingActivities;
import io.temporal.demos.worker_versioning.activities.OnboardingActivities;
import io.temporal.demos.worker_versioning.activities.OnboardingActivitiesImpl;
import io.temporal.demos.worker_versioning.model.*;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Async;
import io.temporal.workflow.Promise;
import io.temporal.workflow.Workflow;
import org.slf4j.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@WorkflowImpl
public class OnboardingWorkflowImpl implements OnboardingWorkflow {
    public static final Logger logger = Workflow.getLogger(OnboardingWorkflowImpl.class);
    private boolean signed = false;


    @Override
    public void onboardingUser(UserData pUser) {

        UserData user = this.getActivity("Get User Information", this.getOnboardingTaskQueueName()).getUserDetails(pUser);
        Email emailDetails = new Email();
        emailDetails.setToEmailAddress(Collections.singletonList(user.getUserEmail()));
        this.updateStepSA("Gathering User Details");

        String boardingDocURL = this.getActivity("Generate Onboarding Document", this.getOnboardingTaskQueueName()).generateOnBoardingDocument(user);
        this.updateStepSA("Generating Onboarding Document");
        Promise<Void> workflowCompletePromise = Workflow.newTimer(Duration.ofMinutes(30));

        // Loop to check timer to see if WF should just finish
        while (true) {
            // Check the timer and if it has fired then stop the workflow.  (To stop actions happening in this case!)
            if (workflowCompletePromise.isCompleted()) {
                emailDetails.setEmailSubject("Workflow to provision user [" + user.getUserName() + "] has timed out and exited");
                emailDetails.setEmailBody("Workflow timed out and completed. Resubmit if you need to onboard.");
                this.getActivity("e-mail notification of workflow timeout.", this.getOnboardingTaskQueueName()).sendEMail(emailDetails);
                return;
            }

            // Loop to keep sending e-mail reminders
            int counter = 0;
            while (!signed) {
                if (Workflow.await(Duration.ofSeconds(10), () -> signed))
                    break;
                else {
                    counter++;
                    logger.info("Still waiting for documentation to be signed.  Sending email reminder");
                    emailDetails.setEmailSubject("Reminder [" + counter + "] to sign documentation");
                    emailDetails.setEmailBody("Please sign the documentation that can be found at: " + boardingDocURL);
                    this.updateStepSA("Sending reminder - [" + counter +"]");
                    this.getActivity("Send e-mail reminder to sign", this.getOnboardingTaskQueueName()).sendEMail(emailDetails);
                    if (workflowCompletePromise.isCompleted())
                        break;
                    }
            } // End signing loop
            this.updateStepSA("Signing completed");
            List<ApplicationMetaData> appList = this.getActivity("Gather list of apps to provision for user", this.getOnboardingTaskQueueName()).getAppsForUser(user);

            List<Promise<Boolean>> appProvisioningPromises = new ArrayList<>();
            for (ApplicationMetaData app : appList) {
                appProvisioningPromises.add(
                        Async.function(
                                this.getActivity("Provisioning app " + app.getApplicationName(), this.getOnboardingTaskQueueName())::provisionAppAccess, user, app)
                        );
            }
            Promise.allOf(appProvisioningPromises).get();
            this.updateStepSA("Provisioning complete");
            Workflow.sleep(Duration.ofSeconds(2));

            CreditLimits limits = new CreditLimits();
            CreditLimit creditLimit = new CreditLimit();
            creditLimit.setUserID(user.getUserName());
            creditLimit.setCreditLimit(1000000);
            creditLimit.setApplicationName("Credit");
            limits.setCreditLimits(List.of(creditLimit));

            this.getActivity("Set Credit limit", this.getOnboardingTaskQueueName()).setCreditLimits(limits);
            this.updateStepSA("Credit limit set");
            emailDetails.setEmailSubject("Onboarding provisioning complete");
            emailDetails.setEmailBody("Go fill your boots on these wonderful systems.");
            this.updateStepSA("Onboarding complete");
            this.getActivity("Send e-mail for onboarding completion", this.getOnboardingTaskQueueName()).sendEMail(emailDetails);
            break;

        } // end timeout loop
    } // End onboarding User

    @Override
    public void signalDocumentationSigned() {
        this.signed = true;
    }

    private String getOnboardingTaskQueueName() {
        // Return the task queue to use.  Might make this more dynamis in the future...
        return "OnboardingWorkerVersioning";
    } //End getOnboardingTaskQueueName

    private void updateStepSA(String update) {
        Workflow.upsertTypedSearchAttributes(SearchAttributeKey.forKeyword("Step").valueSet(update) );
    }  // End updateStepSA

    private OnboardingActivities getActivity(String activityName, String taskQueue) {

        ActivityOptions.Builder actOptions = OnboardingActivities.actOptionsBuilders;
        actOptions.setTaskQueue(taskQueue);

        if (activityName != null && !activityName.isEmpty())
            actOptions.setSummary(activityName);

        return Workflow.newActivityStub(
                OnboardingActivities.class, actOptions.build());

    }
}
