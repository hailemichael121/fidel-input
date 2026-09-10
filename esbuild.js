import * as esbuild from "esbuild";
import * as fs from "node:fs";
import * as path from "node:path";

const watch = process.argv.includes("--watch");
const target = process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] || "all";

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy static assets for browser extension
function copyBrowserStaticAssets() {
  ensureDir("dist/browser");
  ensureDir("dist/browser/icons");

  // Copy manifest
  fs.copyFileSync("src/browser/manifest.json", "dist/browser/manifest.json");

  // Copy popup & options HTML/CSS
  fs.copyFileSync("src/browser/popup/popup.html", "dist/browser/popup.html");
  fs.copyFileSync("src/browser/popup/popup.css", "dist/browser/popup.css");
  fs.copyFileSync("src/browser/options/options.html", "dist/browser/options.html");
  fs.copyFileSync("src/browser/options/options.css", "dist/browser/options.css");

  // Copy landing/showcase page HTML/CSS
  fs.copyFileSync("src/browser/landing/index.html", "dist/browser/landing.html");
  fs.copyFileSync("src/browser/landing/landing.css", "dist/browser/landing.css");

  if (fs.existsSync("media/fidel.png")) {
    fs.copyFileSync("media/fidel.png", "dist/browser/icons/icon-16.png");
    fs.copyFileSync("media/fidel.png", "dist/browser/icons/icon-32.png");
    fs.copyFileSync("media/fidel.png", "dist/browser/icons/icon-48.png");
    fs.copyFileSync("media/fidel.png", "dist/browser/icons/icon-128.png");
    fs.copyFileSync("media/fidel.png", "dist/browser/favicon.png");
  }
  if (fs.existsSync("media/fidel.svg")) {
    fs.copyFileSync("media/fidel.svg", "dist/browser/favicon.svg");
  }
}

function copyNetlifySite() {
  ensureDir("dist/site");

  fs.copyFileSync("src/browser/landing/index.html", "dist/site/index.html");
  fs.copyFileSync("src/browser/landing/landing.css", "dist/site/landing.css");
  if (fs.existsSync("dist/browser/landing.js")) {
    fs.copyFileSync("dist/browser/landing.js", "dist/site/landing.js");
  }
  if (fs.existsSync("dist/browser/landing.js.map")) {
    fs.copyFileSync("dist/browser/landing.js.map", "dist/site/landing.js.map");
  }

  fs.copyFileSync("src/browser/options/options.html", "dist/site/options.html");
  fs.copyFileSync("src/browser/options/options.css", "dist/site/options.css");
  if (fs.existsSync("dist/browser/options.js")) {
    fs.copyFileSync("dist/browser/options.js", "dist/site/options.js");
  }

  if (fs.existsSync("media/fidel.svg")) {
    fs.copyFileSync("media/fidel.svg", "dist/site/favicon.svg");
  }
  if (fs.existsSync("media/fidel.png")) {
    fs.copyFileSync("media/fidel.png", "dist/site/favicon.png");
  }
}

// 1. VS Code Extension Build Options
const vscodeOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.cjs",
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: ["vscode"],
  minify: false,
};

// 2. Browser Extension Build Options
const browserBackgroundOptions = {
  entryPoints: ["src/browser/background/serviceWorker.ts"],
  bundle: true,
  outfile: "dist/browser/background.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  minify: false,
};

const browserContentOptions = {
  entryPoints: ["src/browser/content/index.ts"],
  bundle: true,
  outfile: "dist/browser/content.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  minify: false,
};

const browserPopupOptions = {
  entryPoints: ["src/browser/popup/popup.ts"],
  bundle: true,
  outfile: "dist/browser/popup.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  minify: false,
};

const browserOptionsPageOptions = {
  entryPoints: ["src/browser/options/options.ts"],
  bundle: true,
  outfile: "dist/browser/options.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  minify: false,
};

const browserLandingOptions = {
  entryPoints: ["src/browser/landing/landing.ts"],
  bundle: true,
  outfile: "dist/browser/landing.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  minify: false,
};

async function buildAll() {
  if (target === "all" || target === "vscode") {
    if (watch) {
      const ctx = await esbuild.context(vscodeOptions);
      await ctx.watch();
      console.log("Fidel [VS Code]: watching for changes...");
    } else {
      await esbuild.build(vscodeOptions);
      console.log("Fidel [VS Code]: build complete.");
    }
  }

  if (target === "all" || target === "browser") {
    copyBrowserStaticAssets();

    if (watch) {
      const ctxs = await Promise.all([
        esbuild.context(browserBackgroundOptions),
        esbuild.context(browserContentOptions),
        esbuild.context(browserPopupOptions),
        esbuild.context(browserOptionsPageOptions),
        esbuild.context(browserLandingOptions),
      ]);
      await Promise.all(ctxs.map((ctx) => ctx.watch()));
      copyNetlifySite();
      console.log("Fidel [Browser]: watching for changes...");
    } else {
      await Promise.all([
        esbuild.build(browserBackgroundOptions),
        esbuild.build(browserContentOptions),
        esbuild.build(browserPopupOptions),
        esbuild.build(browserOptionsPageOptions),
        esbuild.build(browserLandingOptions),
      ]);
      copyNetlifySite();
      console.log("Fidel [Browser]: build complete.");
    }
  }
}

await buildAll();
