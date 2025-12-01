package io.temporal.demos.worker_versioning.activities;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.demos.worker_versioning.model.ApplicationMetaData;
import io.temporal.demos.worker_versioning.model.CreditLimits;
import io.temporal.demos.worker_versioning.model.Email;
import io.temporal.demos.worker_versioning.model.UserData;
import io.temporal.spring.boot.ActivityImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
@ActivityImpl
public class OnboardingActivitiesImpl implements OnboardingActivities{
    private static final Logger logger = LoggerFactory.getLogger(OnboardingActivitiesImpl.class);

    @Override
    public UserData getUserDetails(UserData user) {
        logger.debug("getUserData - Just using what was passed in.");
        this.sleep(ThreadLocalRandom.current().nextInt(1000, 2001));
        return user;
    }

    @Override
    public String generateOnBoardingDocument(UserData user) {
        this.sleep(ThreadLocalRandom.current().nextInt(3000, 6001));
        return "s3://donald-demo-wf-export/temporal-workflow-history/export/donald-demo.sdvdw/2024/12/12/16/00/a3642624-0465-46b5-acf0-200f5290683c";
    }

    @Override
    public Boolean signOnBoardingDocument(String documentURL) {
        sleep(3000);
        return true;
    }

    @Override
    public List<ApplicationMetaData> getAppsForUser(UserData user) {
        List<ApplicationMetaData> appList = new ArrayList<ApplicationMetaData>();
        ApplicationMetaData app1MetaData = new ApplicationMetaData();
        app1MetaData.setUserID(user.getUserName());
        app1MetaData.setApplicationName("Fraud Check");
        app1MetaData.setApplicationURL("https://fraud.com");
        app1MetaData.setRoles(List.of("Developer", "Billing_User"));
        appList.add(app1MetaData);

        ApplicationMetaData app2MetaData = new ApplicationMetaData();
        app2MetaData.setUserID(user.getUserName());
        app2MetaData.setApplicationName("Credit");
        app2MetaData.setApplicationURL("https://credit.com");
        app2MetaData.setRoles(List.of("VIP", "UK_User", "Credit_Officer"));
        appList.add(app2MetaData);

        ApplicationMetaData app3MetaData = new ApplicationMetaData();
        app3MetaData.setUserID(user.getUserName());
        app3MetaData.setApplicationName("Mortgage");
        app3MetaData.setApplicationURL("https://mortgages.com");
        app3MetaData.setRoles(List.of("User", "City_of_London"));
        appList.add(app3MetaData);
        this.sleep(ThreadLocalRandom.current().nextInt(2000, 4001));

        return appList;
    }

    @Override
    public Boolean provisionAppAccess(UserData user, ApplicationMetaData appMetaData) {
        this.sleep(ThreadLocalRandom.current().nextInt(2000, 4001));
        return true;
    }

    @Override
    public Boolean setCreditLimits(CreditLimits creditLimits) {
        this.sleep(ThreadLocalRandom.current().nextInt(2000, 4001));
        return true;
    }

    @Override
    public Boolean sendEMail(Email onboardingEmail) {

        sleep(2000);
        return true;
    }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            logger.debug("Exception waiting in an activity -- {}", e.getMessage());
        }
    }
}
