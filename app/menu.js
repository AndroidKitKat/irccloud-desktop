var Menu = require('menu');
var MenuItem = require('menu-item');

module.exports = {
  setup: function (app, host) {
    var name = app.getName();

    var app_menu = {
      submenu: [
      ]
    };

    if (process.platform == 'darwin') {
        app_menu.label = name;
        app_menu.submenu = [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          label: 'Open in Browser',
          click: function(item, focusedWindow) {
            var url = focusedWindow ? focusedWindow.webContents.getURL() : host;
            require('electron').shell.openExternal(url);
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function(item, focusedWindow) {
            app.quit();
          }
        }];
    } else {
        app_menu.label = 'File';
        app_menu.submenu = [
            {
              label: 'Open in Browser',
              click: function(item, focusedWindow) {
                var url = focusedWindow ? focusedWindow.webContents.getURL() : host;
                require('electron').shell.openExternal(url);
              }
            },
            {
              label: 'Quit',
              accelerator: 'Alt+F4',
              click: function(item, focusedWindow) {
                app.quit();
              }}
        ];
    }

    var edit_menu = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
      ]
    };

    var view_menu = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin') {
              return 'Ctrl+Command+F';
            } else {
              return 'F11';
            }
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin') {
              return 'Command+Alt+I';
            } else {
              return 'Ctrl+Shift+I';
            }
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.toggleDevTools();
            }
          }
        },
      ]
    };

    var history_menu = {
      label: 'History',
      id: 'history',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          enabled: false,
          id: 'backMenu',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          enabled: false,
          id: 'fwdMenu',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.goForward();
            }
          }
        },
      ]
    };

    var window_menu = {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        },
      ]
    };

    var help_menu = {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Github Repository',
          click: function(item, focusedWindow) {
            require('electron').shell.openExternal('https://github.com/irccloud/irccloud-desktop');
          }
        },
      ]
    };

    if (process.platform != 'darwin') {
        help_menu.submenu.push({
          label: 'About',
          role: 'about'
        });
    }

    var menu = Menu.buildFromTemplate([app_menu, edit_menu, view_menu, history_menu, help_menu]);
    Menu.setApplicationMenu(menu);
    return menu;
  }
};
