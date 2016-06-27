const electron = require('electron');

const app = electron.app;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const autoUpdater = electron.autoUpdater;
const dialog = electron.dialog;

function showUpdateDialog() {
    if (!app.updateAvailable) {
        return;
    }
    
    var message = app.getName() + ' ' + app.updateAvailable.version + ' is now available. It will be installed the next time you restart the application.';
    if (app.updateAvailable.notes) {
        splitNotes = app.updateAvailable.notes.split(/[^\r]\n/);
        message += '\n\nRelease notes:\n';
        splitNotes.forEach(function (notes) {
            message += notes + '\n\n';
        });
    }
    var ret = dialog.showMessageBox({
        type: 'info',
        message: 'A new version of ' + app.getName() + ' has been downloaded',
        detail: message,
        buttons: ['OK', 'Install and Relaunch'],
        cancelId: 0,
        defaultId: 1
    });
    if (ret === 1) {
        autoUpdater.quitAndInstall();
    }
}

module.exports = {
  setup: function (host) {
    var name = app.getName();

    var app_menu = {
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          label: 'Check for Updates…',
          click: function (item, focusedWindow) {
            autoUpdater.once('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateURL) {
                app.updateAvailable = {
                    version: releaseName,
                    notes: releaseNotes
                };
                showUpdateDialog();
            });
            autoUpdater.once('update-not-available', function (event) {
                dialog.showMessageBox({
                    type: 'info',
                    message: 'You’re up to date!',
                    detail: app.getName() + ' ' + app.getVersion() + ' is currently the newest version available.',
                    buttons: ['OK'],
                    defaultId: 0
                });
            });
            autoUpdater.checkForUpdates();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences…',
          accelerator: 'Cmd+,',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.executeJavaScript('SESSIONVIEW.openSettings()', true);
            }
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
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Cmd+Alt+H',
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
          accelerator: 'Cmd+Q',
          click: function(item, focusedWindow) {
            app.userInitiatedQuit = true;
            app.quit();
          }
        }
      ]
    };
    var file_menu = {
        label: 'File',
        submenu: [
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
              label: 'Add a Network…',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.addNetwork()', true);
                }
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Jump to…',
              accelerator: 'CmdOrCtrl+K',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.channelSwitcher.toggle()', true);
                }
              }
            },
            {
              label: 'Select Next in List',
              accelerator: 'Alt+Down',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.sidebar.bufferList.selectNextBuffer()', true);
                }
              }
            },
            {
              label: 'Select Previous in List',
              accelerator: 'Alt+Up',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.sidebar.bufferList.selectPreviousBuffer()', true);
                }
              }
            },
            {
              label: 'Select Next Unread in List',
              accelerator: 'Alt+Shift+Down',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.sidebar.bufferList.selectNextUnreadBuffer()', true);
                }
              }
            },
            {
              label: 'Select Previous Unread in List',
              accelerator: 'Alt+Shift+Up',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSIONVIEW.sidebar.bufferList.selectPreviousUnreadBuffer()', true);
                }
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Mark Current as Read',
              accelerator: 'Esc',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('if (SESSION.currentBuffer) SESSION.currentBuffer.read()', true);
                }
              }
            },
            {
              label: 'Mark All as Read',
              accelerator: 'Shift+Esc',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('SESSION.markAllAsRead()', true);
                }
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Upload a File…',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('if (cb()) cb().trigger("uploadPrompt");', true);
                }
              }
            },
            {
              label: 'Start a Pastebin…',
              click: function (item, focusedWindow) {
                if (focusedWindow) {
                  focusedWindow.webContents.executeJavaScript('if (cb()) cb().trigger("pastePrompt");', true);
                }
              }
            }
        ]
    };
    if (process.platform != 'darwin') {
      file_menu.submenu.push({
        type: 'separator'
      });
      file_menu.submenu.push({
        label: 'Preferences…',
        accelerator: 'Ctrl+,',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.executeJavaScript('SESSIONVIEW.openSettings()', true);
          }
        }
      });
      file_menu.submenu.push({
        type: 'separator'
      });
      file_menu.submenu.push({
        label: 'Show in Tray',
        type:  'checkbox',
        checked: Boolean(app.config.get('tray')),
        click: function(item, focusedWindow){
            app.config.set('tray', item.checked);
            app.toggleTray();
        }
      });
      file_menu.submenu.push({
        label: 'Quit',
        accelerator: (function() {
            if (process.platform == 'win32') {
                return 'Alt+F4';
            } else {
                return 'Ctrl+Q';
            }
        })(),
        click: function(item, focusedWindow) {
          app.quit();
        }
      });
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
      id: 'view',
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
          type: 'separator'
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin') {
              return 'Ctrl+Cmd+F';
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
          label: 'Actual Size',
          id: 'zoomReset',
          enabled: false,
          accelerator: 'CmdOrCtrl+0',
          click: function(item, focusedWindow) {
            app.resetZoom();
          }
        },
        {
          label: 'Zoom In',
          id: 'zoomIn',
          enabled: false,
          accelerator: 'CmdOrCtrl+=',
          click: function(item, focusedWindow) {
            app.zoomIn();
          }
        },
        {
          label: 'Zoom Out',
          id: 'zoomOut',
          enabled: false,
          accelerator: 'CmdOrCtrl+-',
          click: function(item, focusedWindow) {
            app.zoomOut();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin') {
              return 'Cmd+Alt+I';
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
    if (process.platform != 'darwin') {
        view_menu.submenu.splice(2, 0, {
            label: 'Toggle Menu Bar',
            accelerator: 'Ctrl+Shift+M',
            click: function(item, focusedWindow) {
                if (focusedWindow.isMenuBarAutoHide()) {
                    app.config.set('menu-bar', true);
                    app.toggleMenuBar(focusedWindow);
                } else {
                    app.config.set('menu-bar', false);
                    app.toggleMenuBar(focusedWindow);
                }
            }
        });
    }

    var go_menu = {
      label: 'Go',
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
        {
          type: 'separator'
        },
        {
          label: 'File Uploads',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.executeJavaScript('SESSIONVIEW.files.show();', true);
            }
          }
        },
        {
          label: 'Pastebins',
          click: function (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.executeJavaScript('SESSIONVIEW.pastebins.show();', true);
            }
          }
        }
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
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    };

    var help_menu = {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: function (item, focusedWindow) {
            focusedWindow.webContents.executeJavaScript('SESSIONVIEW.navigate("?/shortcuts", {trigger: true});', true);
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Known Issues',
          click: function(item, focusedWindow) {
            require('electron').shell.openExternal('https://github.com/irccloud/irccloud-desktop/issues');
          }
        },
      ]
    };

    var menu;
    if (process.platform == 'darwin') {
      menu = Menu.buildFromTemplate([app_menu, file_menu, edit_menu, view_menu, go_menu, window_menu, help_menu]);
    } else {
      menu = Menu.buildFromTemplate([file_menu, edit_menu, view_menu, go_menu, help_menu]);
    }
    Menu.setApplicationMenu(menu);
    return menu;
  },
  setup_tray: function(app){
    var menu;
    menu = Menu.buildFromTemplate([
        {
          label: 'Quit',
          click: function(item, focusedWindow) {
            app.userInitiatedQuit = true;
            app.quit();
          }
        }
    ]);
    return menu;
  }
};
