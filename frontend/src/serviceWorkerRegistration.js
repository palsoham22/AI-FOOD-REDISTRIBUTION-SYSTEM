// src/serviceWorkerRegistration.js

export function register() {

  if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

      try {

        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );

        console.log("✅ Service Worker Registered:", registration);

        // Background Sync Supported
        if ("SyncManager" in window) {

          console.log("✅ Background Sync Supported");

          await registration.sync.register("foodbridge-sync");

          console.log("✅ Background Sync Registered");

        } else {

          console.log("❌ Background Sync Not Supported");

        }

      } catch (error) {

        console.log("❌ Service Worker Registration Failed:", error);

      }

    });

  }

}