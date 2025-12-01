package io.temporal.demos.worker_versioning.activities;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;
import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.demos.worker_versioning.model.ApplicationMetaData;
import io.temporal.demos.worker_versioning.model.CreditLimits;
import io.temporal.demos.worker_versioning.model.Email;
import io.temporal.demos.worker_versioning.model.UserData;

import java.time.Duration;
import java.util.List;

@ActivityInterface
public interface OnboardingActivities {

    public static RetryOptions retryOptions = RetryOptions.newBuilder()
            .setInitialInterval(Duration.ofSeconds(1))
            .setMaximumInterval(Duration.ofSeconds(10))
            .build();
    public static ActivityOptions.Builder actOptionsBuilders = ActivityOptions.newBuilder()
                .setStartToCloseTimeout(Duration.ofSeconds(10))
                .setRetryOptions(OnboardingActivities.retryOptions);

    @ActivityMethod
    UserData getUserDetails(UserData user);

    @ActivityMethod
    String generateOnBoardingDocument(UserData user);

    @ActivityMethod
    Boolean signOnBoardingDocument(String documentURL);

    @ActivityMethod
    List<ApplicationMetaData> getAppsForUser(UserData user);

    @ActivityMethod
    Boolean provisionAppAccess(UserData user, ApplicationMetaData appMetaData);

    @ActivityMethod
    Boolean setCreditLimits(CreditLimits creditLimits);

    @ActivityMethod
    Boolean sendEMail(Email onboardingEmail);

}
