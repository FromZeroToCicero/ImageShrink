function createMenuTemplate(isMac, isDev, app, createAboutWindow) {
  return [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: "About",
                click: createAboutWindow,
              },
              {
                label: "Quit",
                click: () => app.quit(),
              },
            ],
          },
        ]
      : []),
    {
      role: "fileMenu",
    },
    ...(!isMac
      ? [
          {
            label: "Help",
            submenu: [
              {
                label: "About",
                click: createAboutWindow,
              },
            ],
          },
        ]
      : []),
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
