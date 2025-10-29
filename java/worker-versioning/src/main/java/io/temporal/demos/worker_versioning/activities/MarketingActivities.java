package io.temporal.demos.worker_versioning.activities;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;
import io.temporal.demos.worker_versioning.model.MarketingBundle;
import org.checkerframework.checker.units.qual.A;
import org.springframework.stereotype.Component;

@Component
@ActivityInterface
public interface MarketingActivities {

    @ActivityMethod
    public MarketingBundle getMarketingBundle(String campaignName);

    @ActivityMethod
    public int sendMarketingBlast(MarketingBundle bundle);

    @ActivityMethod
    public MarketingBundle getMarketingResults(MarketingBundle bundle)
}
