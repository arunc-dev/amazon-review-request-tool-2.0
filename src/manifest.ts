import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

//@ts-ignore
const isDev = process.env.NODE_ENV == "development";

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ""}`,
  description: packageData.description,
  version: packageData.version,
  short_name: packageData.short_name || packageData.name,
  manifest_version: 3,
  icons: {
    16: "img/logo-16.png",
    32: "img/logo-32.png",
    48: "img/logo-48.png",
    128: "img/logo-128.png",
  },
  action: {
    // default_popup: 'popup.html',
    default_icon: "img/logo-48.png",
  },
  options_page: "options.html",
  devtools_page: "devtools.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  // content_scripts: [
  //   {
  //     matches: ["http://*/*", "https://*/*"],
  //     js: ["src/contentScript/index.ts"],
  //   },
  // ],
  // side_panel: {
  //   default_path: "sidepanel.html",
  // },
  web_accessible_resources: [
    {
      resources: [
        "img/logo-16.png",
        "img/logo-32.png",
        "img/logo-48.png",
        "img/logo-128.png",
      ],
      matches: [],
    },
  ],
  permissions: ["storage"],
  host_permissions: [
    "https://*/sellercentral.amazon.*/",
    "https://*/amazon.*/",
  ],

  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk/qx6Yqigt2LZin29U8uEo4vAWu/mdl6wLRBeQ1KsZRX4/WbOVfwhzxdfIxqxcyIbmqUdWE98Zi6mMGG61YyomJzkZF1Xu0XAuEYC/9dvd8L5Yu6HZnXCh4O7S5ZzCvihjiAEGk3BSL148szoD/JwJlvceUE6cHVe4WcmhkyeB8hFNf0nPkQcuEqzT5yDkQ14zdwOEU82GJHRj20WlN72u1Mv/oauJCz7diC3FX6PORT0vrAFoTdWcmkstvNFg6VQgdY8CFO3owLSGKYHv2q3kAYjgxFz5rsidaZRQGkdwruUuawyovm59y2GbYYxfcEVu3JpFJGMl+zvNGgBUOoUQIDAQAB",
  // chrome_url_overrides: {
  //   newtab: 'newtab.html',
  // },
});
