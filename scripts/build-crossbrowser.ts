import fs from "fs";
import path from "path";
import { getManifestForTarget, BrowserEngine } from "../src/services/crossBrowser";

const TARGETS: BrowserEngine[] = ["chrome", "firefox", "edge", "safari"];

function buildTarget(engine: BrowserEngine) {
  const outputDir = path.join(process.cwd(), ".output", `${engine}-mv3`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write manifest.json
  const manifest = getManifestForTarget(engine);
  fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  // Create assets directory
  const assetsDir = path.join(outputDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Copy brand assets if available
  const publicAssetsDir = path.join(process.cwd(), "public", "assets");
  if (fs.existsSync(publicAssetsDir)) {
    const files = fs.readdirSync(publicAssetsDir);
    for (const file of files) {
      const srcPath = path.join(publicAssetsDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, path.join(assetsDir, file));
      }
    }
  }

  // For Safari, generate Info.plist wrapper template
  if (engine === "safari") {
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>OrderFlow for WhatsApp Web</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>app.omniflow.orderflow.safari-extension</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>OrderFlow Extension</string>
    <key>CFBundlePackageType</key>
    <string>XPC!</string>
    <key>CFBundleShortVersionString</key>
    <string>2.5.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.Safari.web-extension</string>
        <key>NSExtensionPrincipalClass</key>
        <string>SafariWebExtensionHandler</string>
    </dict>
</dict>
</plist>`;
    fs.writeFileSync(path.join(outputDir, "Info.plist"), plistContent, "utf-8");
  }

  console.log(`[CrossBrowser Build] Successfully generated .output/${engine}-mv3 with target manifest & assets.`);
}

const targetArg = process.argv[2] as BrowserEngine | "all";

if (!targetArg || targetArg === "all") {
  console.log("[CrossBrowser Build] Building all browser targets: Chrome, Firefox, Edge, Safari...");
  TARGETS.forEach(buildTarget);
} else if (TARGETS.includes(targetArg as BrowserEngine)) {
  buildTarget(targetArg as BrowserEngine);
} else {
  console.error(`Unknown target: ${targetArg}. Expected: chrome, firefox, edge, safari, all`);
  process.exit(1);
}
