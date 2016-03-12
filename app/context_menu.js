const remote = require('electron').remote;
const clipboard = require('electron').clipboard;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

module.exports = {
    build: function(window, target) {
        var template = [];
        if (target.closest('a')) {
            target = target.closest('a');
            template.push({
                label: 'Copy Link Address',
                click: function (e, focusedWindow) {
                  clipboard.writeText(target.href);
                }
            });
        } else {
            if (window.getSelection().toString()) {
                template.push({
                    label: 'Copy',
                    role: 'copy'
                });
            } else {
                template.push({
                    label: 'Back',
                    enabled: remote.getCurrentWebContents().canGoBack(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.goBack();
                        } 
                    }
                });
                template.push({
                    label: 'Forward',
                    enabled: remote.getCurrentWebContents().canGoForward(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.goForward();
                        }
                    }
                });
                template.push({
                    label: 'Reload',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                          focusedWindow.webContents.reloadIgnoringCache();
                        }
                    }
                });
            }
        }

        if (process.platform == 'darwin') {
            template = [...template, {
                type: 'separator'
            }, {
                label: 'Services',
                role: 'services',
                submenu: []
            }];
        }
        return Menu.buildFromTemplate(template);
    }
};
