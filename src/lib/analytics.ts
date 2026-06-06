/**
 * Analytic tracking stubs for system monitoring.
 * In production, hook these up to PostHog, Mixpanel, or Segment.
 */

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}`, properties);
  
  // Example:
  // if (window.posthog) window.posthog.capture(eventName, properties);
};

export const TRACK_EVENTS = {
  STARTED_APP: 'started_application',
  VEHICLE_PICKED: 'vehicle_type_selected',
  STEP_COMPLETED: 'step_completed',
  FORM_SUBMITTED: 'form_submitted',
  LEAD_CAPTURE_SUCCESS: 'lead_capture_success',
  LEAD_CAPTURE_FAIL: 'lead_capture_fail',
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETED: 'processing_completed',
  PROCESSING_TIMEOUT_TRIGGERED: 'processing_timeout_triggered',
  RESULT_SHOWN: 'result_shown',
  CTA_CLICKED: 'cta_clicked'
};

export const syncLeadData = async (data: any, type: 'PARTIAL' | 'FINAL') => {
  try {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, leadType: type, timestamp: new Date().toISOString() })
    });
  } catch (e) {
    console.warn("Lead sync failed (non-critical)", e);
  }
};
