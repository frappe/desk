import { ref } from "vue";
import { call, createResource } from "frappe-ui";
import "../../../frappe/frappe/public/js/lib/posthog.js";

const APP = "helpdesk";
const SITENAME = window.location.hostname;

// extend window object to add posthog
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    posthog: any;
  }
}
type PosthogSettings = {
  posthog_project_id: string;
  posthog_host: string;
  enable_telemetry: boolean;
  telemetry_site_age: number;
};

const telemetry = ref({
  enabled: false,
  project_id: "",
  host: "",
});

let posthogSettings = createResource({
  url: "helpdesk.api.telemetry.get_posthog_settings",
  auto: true,
  cache: "posthog_settings",
  onSuccess: (ps: PosthogSettings) => init(ps),
});

function isTelemetryEnabled() {
  if (!posthogSettings.data) return false;

  return (
    posthogSettings.data.enable_telemetry &&
    posthogSettings.data.posthog_project_id &&
    posthogSettings.data.posthog_host
  );
}

export async function init(ps: PosthogSettings) {
  if (!isTelemetryEnabled()) return;
  try {
    window.posthog.init(ps.posthog_project_id, {
      api_host: ps.posthog_host,
      autocapture: false,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      loaded: (posthog) => {
        window.posthog = posthog;
        window.posthog.identify(SITENAME);
      },
    });
  } catch (e) {
    console.trace("Failed to initialize telemetry", e);
  }
}

interface CaptureOptions {
  data: {
    user: string;
    [key: string]: string | number | boolean | object;
  };
}

export function capture(
  event: string,
  options: CaptureOptions = { data: { user: "" } }
) {
  if (!telemetry.value.enabled) return;
  window.posthog.capture(`${APP}_${event}`, options);
}

export function recordSession() {
  if (!telemetry.value.enabled) return;
  if (window.posthog && window.posthog.__loaded) {
    window.posthog.startSessionRecording();
  }
}

export function stopSession() {
  if (!telemetry.value.enabled) return;
  if (
    window.posthog &&
    window.posthog.__loaded &&
    window.posthog.sessionRecordingStarted()
  ) {
    window.posthog.stopSessionRecording();
  }
}
