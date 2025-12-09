package io.temporal.demos.worker_versioning.activities;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;
import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;


@ActivityInterface
public interface MarketingActivities {

    @ActivityMethod
    public MarketingBundle getMarketingBundle(String campaignName);

    @ActivityMethod
    public int sendMarketingBlast(MarketingBundle bundle);

    @ActivityMethod
    public MarketingBundle getMarketingResults(MarketingBundle bundle);

    @ActivityMethod
    public String formatCampaignMessage(MarketingCampaign campaign);

    @ActivityMethod
    public Boolean sendMarketingCampaign(MarketingCampaign campaign, String formattedMessage);

}
