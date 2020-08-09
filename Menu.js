function createMenuTemplate(isMac, isDev, app, createAboutWindow, mainWindow) {
  return [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: "About ImageShrink",
                click: createAboutWindow,
              },
              {
                type: "separator",
              },
              {
                role: "hide",
              },
              {
                role: "hideOthers",
              },
              {
                role: "unhide",
              },
              {
                type: "separator",
              },
              {
                label: "Quit ImageShrink",
                click: () => app.quit(),
                accelerator: "Command+Q",
              },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [isMac ? { role: "close" } : { role: "quit" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        {
          role: "minimize",
        },
        ...(isMac
          ? [
              { role: "close" },
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              {
                label: "ImageShrink",
                click: () => mainWindow.show(),
              },
            ]
          : [{ role: "close" }]),
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "About ImageShrink",
          click: createAboutWindow,
        },
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://github.com/FromZeroToCicero/ImageShrink");
          },
        },
      ],
    },
    ...(isDev
      ? [
          {
            label: "Developer",
            submenu: [
              {
                role: "reload",
              },
              {
                role: "forcereload",
              },
              {
                type: "separator",
              },
              {
                role: "toggledevtools",
              },
            ],
          },
        ]
      : []),
  ];
}

module.exports = { createMenuTemplate };
