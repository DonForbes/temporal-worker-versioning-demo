package io.temporal.demos.worker_versioning.activities;

import io.temporal.demos.worker_versioning.model.MarketingBundle;
import io.temporal.demos.worker_versioning.model.MarketingCampaign;
import io.temporal.spring.boot.ActivityImpl;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ActivityImpl
public class MarketingActivitiesImpl implements MarketingActivities{

    @Override
    public MarketingBundle getMarketingBundle(String campaignName) {
        // Return a hardwired bundle.
        MarketingBundle marketingBundle = new MarketingBundle();

        marketingBundle.setBundleLocation("s3://Someplace");
        marketingBundle.setBundleName("January Campaign");
        marketingBundle.setChannels(List.of("email", "instagram","facebook"));

        return marketingBundle;
    }

    @Override
    public int sendMarketingBlast(MarketingBundle bundle) {
        return 0;
    }

    @Override
    public MarketingBundle getMarketingResults(MarketingBundle bundle) {
        sleep(1000);
        return null;
    }

    @Override
    public String formatCampaignMessage(MarketingCampaign campaign) {
        sleep(2000);
        return "Message to be sent out.";
    }

    @Override
    public Boolean sendMarketingCampaign(MarketingCampaign campaign, String formattedMessage) {
        sleep(500);
        return null;
    }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            logger.debug("Exception waiting in an activity -- {}", e.getMessage());
        }
    } // End sleep to make it a little more realistic
}
