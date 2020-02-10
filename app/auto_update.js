const electron = require('electron');

const app = electron.app;
const dialog = electron.dialog;
const log = require('electron-log');
const is = require('electron-is');

const pkg = require('../package.json');

var autoUpdater;
var updateAvailable = false;

function isSupported () {
  if (pkg.irccloud.local_build) {
    return false;
  }
  if (is.dev()) {
    return false;
  }
  if (is.linux() && !process.env.APPIMAGE) {
    return false;
  }
  if (is.mas()) {
    return false;
  }
  return true;
}

module.exports = {
  isSupported: isSupported,
  setup: function (menu) {
    if (!isSupported()) {
      return false;
    }
    autoUpdater = require("electron-updater").autoUpdater;
    autoUpdater.logger = log;
    autoUpdater.allowPrerelease = true;
    autoUpdater.fullChangelog = true;
    
    autoUpdater.checkForUpdates().catch(function (exc) {
      // pass
    });
    
    autoUpdater.on('error', function (error, errorMessage) {
      setUpdateCheckMenuEnabled(menu, true);
    });
    autoUpdater.on('checking-for-update', function (event) {
      setUpdateCheckMenuEnabled(menu, false);
    });
    autoUpdater.on('update-available', function (event) {
    });
    autoUpdater.on('update-not-available', function (event) {
      setUpdateCheckMenuEnabled(menu, true);
    });
    autoUpdater.on('update-downloaded', function (info) {
      setUpdateCheckMenuEnabled(menu, true);
      updateAvailable = {
        version: info.releaseName,
        notes: info.releaseNotes
      };
    });
    return true;
  },
  check: function () {
    if (autoUpdater) {
      // TODO show progress dialog
      autoUpdater.checkForUpdates().catch(function (exc) {
        // pass
      });
      autoUpdater.once('error', onUpdateError);
      autoUpdater.once('update-downloaded', onUpdateDownloaded);
      autoUpdater.once('update-not-available', onUpdateNotAvailable);
    }
  }
};


function setUpdateCheckMenuEnabled (menu, value) {
  var appMenu = menu.items.find(function (item) {
    return item.id == 'app';
  });
  if (appMenu) {
    appMenu.submenu.items.forEach(function (appItem) {
      if (appItem.id == 'updateCheck') {
        appItem.enabled = value;
      }
    });
  }
}

function showUpdateDialog() {
  if (!updateAvailable) {
    return;
  }
  
  var message = app.name + ' ' + updateAvailable.version + ' is now available. It will be installed the next time you restart the application.';
  if (updateAvailable.notes) {
    message += '\n\nRelease notes:\n';
    log.info('updateAvailable', updateAvailable);
    if (!Array.isArray(updateAvailable.notes)) {
      updateAvailable.notes = [{
        version: updateAvailable.version,
        note: updateAvailable.notes
      }];
    }
    updateAvailable.notes.forEach(function (release) {
      message += release.version + ':\n\n';
      let noteLines = release.note.split(/[\r\n]/);
      noteLines.forEach(function (noteLine) {
        message += noteLine + '\n';
      });
    });
  }
  var ret = dialog.showMessageBoxSync({
    type: 'info',
    message: 'A new version of ' + app.name + ' has been downloaded',
    detail: message,
    buttons: ['OK', 'Install and Relaunch'],
    cancelId: 0,
    defaultId: 1
  });
  if (ret === 1) {
    autoUpdater.quitAndInstall();
  }
}

function onUpdateDownloaded (info) {
  updateAvailable = {
    version: info.releaseName,
    notes: info.releaseNotes
  };
  showUpdateDialog();
  autoUpdater.removeListener('error', onUpdateError);
  autoUpdater.removeListener('update-not-available', onUpdateNotAvailable);
}
function onUpdateNotAvailable (event) {
  if (updateAvailable) {
    showUpdateDialog();
  } else {
    dialog.showMessageBox({
      type: 'info',
      message: 'You’re up to date!',
      detail: app.name + ' ' + app.getVersion() + ' is currently the newest version available.',
      buttons: ['OK'],
      defaultId: 0
    });
  }
  autoUpdater.removeListener('error', onUpdateError);
  autoUpdater.removeListener('update-downloaded', onUpdateDownloaded);
}
function onUpdateError (error, errorMessage) {
  dialog.showMessageBox({
    type: 'error',
    message: 'Error checking for updates',
    detail: 'Please try again',
    buttons: ['OK'],
    defaultId: 0
  });
  autoUpdater.removeListener('update-downloaded', onUpdateDownloaded);
  autoUpdater.removeListener('update-not-available', onUpdateNotAvailable);
}
