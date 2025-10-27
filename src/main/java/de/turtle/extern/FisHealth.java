package de.turtle.extern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class FisHealth {
    private static final Logger logger = LoggerFactory.getLogger(FisHealth.class);

    @EventListener(ApplicationReadyEvent.class)
    public void checkNativeAtStartup(){
        try {
            FisLib.load();
            logger.info("FIS native library loaded successfully.");
        } catch (Throwable t) {
            logger.error("Failed to load FIS native library", t);
        }
        
    }
}
