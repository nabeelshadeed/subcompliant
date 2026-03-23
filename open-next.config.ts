import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Route Cloudflare scheduled events (cron triggers) to the expiry-reminders endpoint.
  // The x-cf-worker header is checked in the route to allow internal invocations
  // without requiring the CRON_SECRET auth header.
  scheduled: {
    async handler(event, env) {
      const appUrl = (env as any).NEXT_PUBLIC_APP_URL ?? "https://subcompliant.com";
      try {
        await fetch(`${appUrl}/api/cron/expiry-reminders`, {
          headers: { "x-cf-worker": "1" },
        });
      } catch (e) {
        console.error("[cron] scheduled handler error:", e);
      }
    },
  },
});
