const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require("electron");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminOptipng = require("imagemin-optipng");
const slash = require("slash");
const log = require("electron-log");

const Store = require("./Store");
const { createMenuTemplate } = require("./Menu");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;
let compressType = "lossy";

const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      outputPath: path.join(os.homedir(), "imageshrink"),
    },
  },
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: isDev ? 700 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About ImageShrink",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: "#fff",
  });

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

app.on("ready", () => {
  createMainWindow();

  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });

  const mainMenu = Menu.buildFromTemplate(createMenuTemplate(isMac, isDev, app, createAboutWindow));
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));
});

ipcMain.on("image:compress-type", (e, type) => {
  compressType = type ? "lossy" : "lossless";
});

ipcMain.on("image:minimize", (e, options) => {
  shrinkImage(options);
});

ipcMain.on("image:choose-path", async (e) => {
  mainWindow.webContents.send("image:select-output-pending");

  const chosenOutputPath = await dialog.showOpenDialog({
    properties: ["openDirectory", "openFile"],
  });
  if (chosenOutputPath.filePaths[0]) {
    mainWindow.webContents.send("image:selected-output", chosenOutputPath.filePaths[0]);
  } else {
    mainWindow.webContents.send("image:select-output-finished");
  }
});

ipcMain.on("settings:set", (e, settings) => {
  store.set("settings", settings);
  mainWindow.webContents.send("settings:get", store.get("settings"));
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    let plugins;
    if (compressType === "lossy") {
      plugins = [imageminMozjpeg({ quality }), imageminPngquant({ quality: [pngQuality, pngQuality] })];
    } else {
      plugins = [imageminJpegtran(), imageminOptipng()];
    }

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins,
    });
    log.info(files);

    if (files.length) {
      shell.openPath(dest);
      mainWindow.webContents.send("image:optimised");
    } else {
      mainWindow.webContents.send("image:not-optimised");
    }
  } catch (err) {
    log.error(err);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    mainWindow.webContents.on("dom-ready", () => {
      mainWindow.webContents.send("settings:get", store.get("settings"));
    });
  }
});
