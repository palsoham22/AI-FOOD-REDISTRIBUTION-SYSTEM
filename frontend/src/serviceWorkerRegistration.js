// src/serviceWorkerRegistration.js

export function register() {
  if ("serviceWorker" in navigator) {
    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          { updateViaCache: "none" }
        );

        console.log("✅ Service Worker Registered:", registration);

        // Check for updates to the service worker
        if (typeof registration.update === "function") {
          registration.update().catch((err) => {
            console.warn("Service worker update check skipped:", err);
          });
        }

        // Background Sync Supported
        if ("SyncManager" in window && registration.sync) {
          console.log("✅ Background Sync Supported");
          await registration.sync.register("foodbridge-sync");
          console.log("✅ Background Sync Registered");
        } else {
          console.log("❌ Background Sync Not Supported");
        }
      } catch (error) {
        console.log("❌ Service Worker Registration Failed:", error);
      }
    };

    if (document.readyState === "complete") {
      registerWorker();
    } else {
      window.addEventListener("load", registerWorker);
    }
  }
}
