import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.8f1a8f5461b243ec8770512d46df1e27",
  appName: "iot-switchboard-92052",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    url: "https://8f1a8f54-61b2-43ec-8770-512d46df1e27.lovableproject.com?forceHideBadge=true",
    cleartext: true,
    // اجازه می‌دهد WebView به آدرس‌های لوکال/شبکه داخلی هم دسترسی داشته باشد
    allowNavigation: ["*"],
  },
};

export default config;
