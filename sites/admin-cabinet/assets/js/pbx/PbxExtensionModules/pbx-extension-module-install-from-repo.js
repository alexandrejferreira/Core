"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2024 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/* global globalRootUrl, PbxApi, globalPBXLicense, globalTranslate, UserMessage, globalPBXVersion, installStatusLoopWorker, marketplace */

/**
 * Manages the installation and updating of PBX extension modules from a repository.
 * It provides functionality to update individual modules or all modules at once,
 * and displays progress information to the user.
 *
 * @class installationFromRepo
 * @memberof module:PbxExtensionModules
 */
var installationFromRepo = {
  /**
   * The current version of the PBX system, with development version identifiers removed.
   * @type {string}
   */
  pbxVersion: globalPBXVersion.replace(/-dev/i, ''),

  /**
   * The license key for the PBX system, trimmed of any leading or trailing whitespace.
   * @type {string}
   */
  pbxLicense: globalPBXLicense.trim(),

  /**
   * jQuery object for the button responsible for updating all installed modules.
   * @type {jQuery}
   */
  $btnUpdateAllModules: $('#update-all-modules-button'),

  /**
   * jQuery object for the block that contains the progress bar, used to indicate
   * the progress of module installation or updating processes.
   * @type {jQuery}
   */
  $progressBarBlock: $('#upload-progress-bar-block'),

  /**
   * jQuery object for the installation module modal form.
   * @type {jQuery}
   */
  $installModuleModalForm: $('#install-modal-form'),

  /**
   * Initializes the installationFromRepo module. Sets up event handlers for UI interactions
   * and hides UI elements that are not immediately needed.
   */
  initialize: function initialize() {
    installationFromRepo.initializeButtonEvents();
    installationFromRepo.$progressBarBlock.hide();
    installationFromRepo.$btnUpdateAllModules.hide(); // Until at least one update available
  },

  /**
   * Sets up event handlers for button clicks within the module.
   * This includes handling the installation and update of individual
   * modules as well as the bulk update functionality.
   */
  initializeButtonEvents: function initializeButtonEvents() {
    /**
     * Event handler for the download link click event.
     * @param {Event} e - The click event object.
     */
    $(document).on('click', 'a.download, a.update', function (e) {
      e.preventDefault();
      var $currentButton = $(e.target).closest('a.button');

      if (installationFromRepo.pbxLicense === '') {
        window.location = "".concat(globalRootUrl, "pbx-extension-modules/index#/licensing");
      } else {
        installationFromRepo.openInstallModuleModal($currentButton);
      }
    });
    installationFromRepo.$btnUpdateAllModules.on('click', installationFromRepo.updateAllModules);
  },

  /**
   * Opens the modal form for installing a module. This modal provides the user with information
   * about the module they are about to install, and confirms their action.
   *
   * @param {jQuery} $currentButton - The jQuery object of the button that was clicked to trigger this modal.
   */
  openInstallModuleModal: function openInstallModuleModal($currentButton) {
    var moduleUniqueId = $currentButton.data('uniqid');
    var releaseId = $currentButton.data('releaseid');
    installationFromRepo.$installModuleModalForm.modal({
      closable: false,
      onShow: function onShow() {
        var moduleName = $currentButton.closest('tr').data('name');
        var theForm = installationFromRepo.$installModuleModalForm;
        theForm.find('span.module-name').text(moduleName);
        var $installedModuleRow = $("tr.module-row[data-id=".concat(moduleUniqueId, "]"));

        if ($installedModuleRow.length > 0) {
          var _$currentButton$data;

          var installedVersion = $installedModuleRow.data('version');
          var newVersion = (_$currentButton$data = $currentButton.data('version')) !== null && _$currentButton$data !== void 0 ? _$currentButton$data : installedVersion;

          if (marketplace.versionCompare(newVersion, installedVersion) > 0) {
            theForm.find('span.action').text(globalTranslate.ext_UpdateModuleTitle);
            theForm.find('div.description').html(globalTranslate.ext_ModuleUpdateDescription);
          } else {
            theForm.find('span.action').text(globalTranslate.ext_DowngradeModuleTitle);
            theForm.find('div.description').html(globalTranslate.ext_ModuleDowngradeDescription);
          }
        } else {
          theForm.find('span.action').text(globalTranslate.ext_InstallModuleTitle);
          theForm.find('div.description').html(globalTranslate.ext_ModuleInstallDescription);
        }
      },
      onDeny: function onDeny() {
        $('a.button').removeClass('disabled');
        return true;
      },
      onApprove: function onApprove() {
        $('a.button').addClass('disabled');
        var params = {
          uniqid: moduleUniqueId,
          releaseId: releaseId,
          channelId: installStatusLoopWorker.channelId
        };
        $("#modal-".concat(params.uniqid)).modal('hide');
        var $moduleButtons = $("a[data-uniqid=".concat(params.uniqid));
        $moduleButtons.removeClass('disabled');
        $moduleButtons.find('i').removeClass('download').removeClass('redo').addClass('spinner loading');
        $('tr.table-error-messages').remove();
        $('tr.error').removeClass('error');
        PbxApi.ModulesInstallFromRepo(params, function (response) {
          console.debug(response);

          if (response.result === true) {
            $('html, body').animate({
              scrollTop: installationFromRepo.$progressBarBlock.offset().top
            }, 2000);
          }
        });
        return true;
      }
    }).modal('show');
  },

  /**
   * Initiates the process of updating all installed modules. This function is triggered by the user
   * clicking the 'Update All' button. It first disables UI elements to prevent further user actions
   * and then calls the API to start the update process.
   *
   * @param {Event} e - The click event object associated with the 'Update All' button click.
   */
  updateAllModules: function updateAllModules(e) {
    e.preventDefault();
    $('a.button').addClass('disabled');
    var $currentButton = $(e.target).closest('a');
    installationFromRepo.openUpdateAllModulesModal($currentButton);
  },

  /**
   * Opens a modal confirmation dialog when updating all modules. This dialog informs the user about
   * the update process and asks for confirmation to proceed with updating all installed modules.
   *
   * @param {jQuery} $currentButton - The jQuery object of the button that was clicked to trigger this modal.
   */
  openUpdateAllModulesModal: function openUpdateAllModulesModal($currentButton) {
    installationFromRepo.$installModuleModalForm.modal({
      closable: false,
      onShow: function onShow() {
        var theForm = installationFromRepo.$installModuleModalForm;
        theForm.find('span.action').text(globalTranslate.ext_UpdateAllModulesTitle);
        theForm.find('span.module-name').text('');
        theForm.find('div.description').html(globalTranslate.ext_UpdateAllModulesDescription);
      },
      onDeny: function onDeny() {
        $('a.button').removeClass('disabled');
        return true;
      },
      onApprove: function onApprove() {
        $('a.button').addClass('disabled');
        $currentButton.removeClass('disabled');
        $currentButton.closest('i.icon').removeClass('redo').addClass('spinner loading');
        var uniqueModulesForUpdate = new Set();
        $('a.update').each(function (index, $button) {
          uniqueModulesForUpdate.add($($button).data('uniqid'));
        });
        var params = {
          channelId: installStatusLoopWorker.channelId,
          modulesForUpdate: _toConsumableArray(uniqueModulesForUpdate)
        };
        PbxApi.ModulesUpdateAll(params, function (response) {
          console.debug(response);
        });
        $('tr.table-error-messages').remove();
        $('tr.error').removeClass('error');
        return true;
      }
    }).modal('show');
  }
}; // Initializes the installationFromRepo module when the document is ready,
// preparing the extension modules management UI.

$(document).ready(function () {
  installationFromRepo.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLWluc3RhbGwtZnJvbS1yZXBvLmpzIl0sIm5hbWVzIjpbImluc3RhbGxhdGlvbkZyb21SZXBvIiwicGJ4VmVyc2lvbiIsImdsb2JhbFBCWFZlcnNpb24iLCJyZXBsYWNlIiwicGJ4TGljZW5zZSIsImdsb2JhbFBCWExpY2Vuc2UiLCJ0cmltIiwiJGJ0blVwZGF0ZUFsbE1vZHVsZXMiLCIkIiwiJHByb2dyZXNzQmFyQmxvY2siLCIkaW5zdGFsbE1vZHVsZU1vZGFsRm9ybSIsImluaXRpYWxpemUiLCJpbml0aWFsaXplQnV0dG9uRXZlbnRzIiwiaGlkZSIsImRvY3VtZW50Iiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCIkY3VycmVudEJ1dHRvbiIsInRhcmdldCIsImNsb3Nlc3QiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImdsb2JhbFJvb3RVcmwiLCJvcGVuSW5zdGFsbE1vZHVsZU1vZGFsIiwidXBkYXRlQWxsTW9kdWxlcyIsIm1vZHVsZVVuaXF1ZUlkIiwiZGF0YSIsInJlbGVhc2VJZCIsIm1vZGFsIiwiY2xvc2FibGUiLCJvblNob3ciLCJtb2R1bGVOYW1lIiwidGhlRm9ybSIsImZpbmQiLCJ0ZXh0IiwiJGluc3RhbGxlZE1vZHVsZVJvdyIsImxlbmd0aCIsImluc3RhbGxlZFZlcnNpb24iLCJuZXdWZXJzaW9uIiwibWFya2V0cGxhY2UiLCJ2ZXJzaW9uQ29tcGFyZSIsImdsb2JhbFRyYW5zbGF0ZSIsImV4dF9VcGRhdGVNb2R1bGVUaXRsZSIsImh0bWwiLCJleHRfTW9kdWxlVXBkYXRlRGVzY3JpcHRpb24iLCJleHRfRG93bmdyYWRlTW9kdWxlVGl0bGUiLCJleHRfTW9kdWxlRG93bmdyYWRlRGVzY3JpcHRpb24iLCJleHRfSW5zdGFsbE1vZHVsZVRpdGxlIiwiZXh0X01vZHVsZUluc3RhbGxEZXNjcmlwdGlvbiIsIm9uRGVueSIsInJlbW92ZUNsYXNzIiwib25BcHByb3ZlIiwiYWRkQ2xhc3MiLCJwYXJhbXMiLCJ1bmlxaWQiLCJjaGFubmVsSWQiLCJpbnN0YWxsU3RhdHVzTG9vcFdvcmtlciIsIiRtb2R1bGVCdXR0b25zIiwicmVtb3ZlIiwiUGJ4QXBpIiwiTW9kdWxlc0luc3RhbGxGcm9tUmVwbyIsInJlc3BvbnNlIiwiY29uc29sZSIsImRlYnVnIiwicmVzdWx0IiwiYW5pbWF0ZSIsInNjcm9sbFRvcCIsIm9mZnNldCIsInRvcCIsIm9wZW5VcGRhdGVBbGxNb2R1bGVzTW9kYWwiLCJleHRfVXBkYXRlQWxsTW9kdWxlc1RpdGxlIiwiZXh0X1VwZGF0ZUFsbE1vZHVsZXNEZXNjcmlwdGlvbiIsInVuaXF1ZU1vZHVsZXNGb3JVcGRhdGUiLCJTZXQiLCJlYWNoIiwiaW5kZXgiLCIkYnV0dG9uIiwiYWRkIiwibW9kdWxlc0ZvclVwZGF0ZSIsIk1vZHVsZXNVcGRhdGVBbGwiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxvQkFBb0IsR0FBRztBQUV6QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxVQUFVLEVBQUVDLGdCQUFnQixDQUFDQyxPQUFqQixDQUF5QixPQUF6QixFQUFrQyxFQUFsQyxDQU5hOztBQVF6QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxVQUFVLEVBQUVDLGdCQUFnQixDQUFDQyxJQUFqQixFQVphOztBQWN6QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxvQkFBb0IsRUFBRUMsQ0FBQyxDQUFDLDRCQUFELENBbEJFOztBQW9CekI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLDRCQUFELENBekJLOztBQTJC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O0FBQ0gsU0FGRDtBQUdBLFlBQU0yQixNQUFNLEdBQUc7QUFDWEUsVUFBQUEsU0FBUyxFQUFFQyx1QkFBdUIsQ0FBQ0QsU0FEeEI7QUFFWHVCLFVBQUFBLGdCQUFnQixxQkFBTU4sc0JBQU47QUFGTCxTQUFmO0FBSUFiLFFBQUFBLE1BQU0sQ0FBQ29CLGdCQUFQLENBQXdCMUIsTUFBeEIsRUFBZ0MsVUFBQ1EsUUFBRCxFQUFjO0FBQzFDQyxVQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBY0YsUUFBZDtBQUNILFNBRkQ7QUFJQXRELFFBQUFBLENBQUMsQ0FBQyx5QkFBRCxDQUFELENBQTZCbUQsTUFBN0I7QUFDQW5ELFFBQUFBLENBQUMsQ0FBQyxVQUFELENBQUQsQ0FBYzJDLFdBQWQsQ0FBMEIsT0FBMUI7QUFFQSxlQUFPLElBQVA7QUFDSDtBQXBDRSxLQURYLEVBdUNLdEIsS0F2Q0wsQ0F1Q1csTUF2Q1g7QUF3Q0g7QUF6TXdCLENBQTdCLEMsQ0E2TUE7QUFDQTs7QUFDQXJCLENBQUMsQ0FBQ00sUUFBRCxDQUFELENBQVltRSxLQUFaLENBQWtCLFlBQU07QUFDcEJqRixFQUFBQSxvQkFBb0IsQ0FBQ1csVUFBckI7QUFDSCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjQgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIFBieEFwaSwgZ2xvYmFsUEJYTGljZW5zZSwgZ2xvYmFsVHJhbnNsYXRlLCBVc2VyTWVzc2FnZSwgZ2xvYmFsUEJYVmVyc2lvbiwgaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIsIG1hcmtldHBsYWNlICovXG5cbi8qKlxuICogTWFuYWdlcyB0aGUgaW5zdGFsbGF0aW9uIGFuZCB1cGRhdGluZyBvZiBQQlggZXh0ZW5zaW9uIG1vZHVsZXMgZnJvbSBhIHJlcG9zaXRvcnkuXG4gKiBJdCBwcm92aWRlcyBmdW5jdGlvbmFsaXR5IHRvIHVwZGF0ZSBpbmRpdmlkdWFsIG1vZHVsZXMgb3IgYWxsIG1vZHVsZXMgYXQgb25jZSxcbiAqIGFuZCBkaXNwbGF5cyBwcm9ncmVzcyBpbmZvcm1hdGlvbiB0byB0aGUgdXNlci5cbiAqXG4gKiBAY2xhc3MgaW5zdGFsbGF0aW9uRnJvbVJlcG9cbiAqIEBtZW1iZXJvZiBtb2R1bGU6UGJ4RXh0ZW5zaW9uTW9kdWxlc1xuICovXG5jb25zdCBpbnN0YWxsYXRpb25Gcm9tUmVwbyA9IHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgdGhlIFBCWCBzeXN0ZW0sIHdpdGggZGV2ZWxvcG1lbnQgdmVyc2lvbiBpZGVudGlmaWVycyByZW1vdmVkLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgcGJ4VmVyc2lvbjogZ2xvYmFsUEJYVmVyc2lvbi5yZXBsYWNlKC8tZGV2L2ksICcnKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBsaWNlbnNlIGtleSBmb3IgdGhlIFBCWCBzeXN0ZW0sIHRyaW1tZWQgb2YgYW55IGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHBieExpY2Vuc2U6IGdsb2JhbFBCWExpY2Vuc2UudHJpbSgpLFxuXG4gICAgLyoqXG4gICAgICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGJ1dHRvbiByZXNwb25zaWJsZSBmb3IgdXBkYXRpbmcgYWxsIGluc3RhbGxlZCBtb2R1bGVzLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJGJ0blVwZGF0ZUFsbE1vZHVsZXM6ICQoJyN1cGRhdGUtYWxsLW1vZHVsZXMtYnV0dG9uJyksXG5cbiAgICAvKipcbiAgICAgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgYmxvY2sgdGhhdCBjb250YWlucyB0aGUgcHJvZ3Jlc3MgYmFyLCB1c2VkIHRvIGluZGljYXRlXG4gICAgICogdGhlIHByb2dyZXNzIG9mIG1vZHVsZSBpbnN0YWxsYXRpb24gb3IgdXBkYXRpbmcgcHJvY2Vzc2VzLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJHByb2dyZXNzQmFyQmxvY2s6ICQoJyN1cGxvYWQtcHJvZ3Jlc3MtYmFyLWJsb2NrJyksXG5cbiAgICAvKipcbiAgICAgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgaW5zdGFsbGF0aW9uIG1vZHVsZSBtb2RhbCBmb3JtLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJGluc3RhbGxNb2R1bGVNb2RhbEZvcm06ICQoJyNpbnN0YWxsLW1vZGFsLWZvcm0nKSxcblxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIGluc3RhbGxhdGlvbkZyb21SZXBvIG1vZHVsZS4gU2V0cyB1cCBldmVudCBoYW5kbGVycyBmb3IgVUkgaW50ZXJhY3Rpb25zXG4gICAgICogYW5kIGhpZGVzIFVJIGVsZW1lbnRzIHRoYXQgYXJlIG5vdCBpbW1lZGlhdGVseSBuZWVkZWQuXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVJlcG8uaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpO1xuICAgICAgICBpbnN0YWxsYXRpb25Gcm9tUmVwby4kcHJvZ3Jlc3NCYXJCbG9jay5oaWRlKCk7XG4gICAgICAgIGluc3RhbGxhdGlvbkZyb21SZXBvLiRidG5VcGRhdGVBbGxNb2R1bGVzLmhpZGUoKTsgLy8gVW50aWwgYXQgbGVhc3Qgb25lIHVwZGF0ZSBhdmFpbGFibGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBldmVudCBoYW5kbGVycyBmb3IgYnV0dG9uIGNsaWNrcyB3aXRoaW4gdGhlIG1vZHVsZS5cbiAgICAgKiBUaGlzIGluY2x1ZGVzIGhhbmRsaW5nIHRoZSBpbnN0YWxsYXRpb24gYW5kIHVwZGF0ZSBvZiBpbmRpdmlkdWFsXG4gICAgICogbW9kdWxlcyBhcyB3ZWxsIGFzIHRoZSBidWxrIHVwZGF0ZSBmdW5jdGlvbmFsaXR5LlxuICAgICAqL1xuICAgIGluaXRpYWxpemVCdXR0b25FdmVudHMoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCBoYW5kbGVyIGZvciB0aGUgZG93bmxvYWQgbGluayBjbGljayBldmVudC5cbiAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZSAtIFRoZSBjbGljayBldmVudCBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYS5kb3dubG9hZCwgYS51cGRhdGUnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgJGN1cnJlbnRCdXR0b24gPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdhLmJ1dHRvbicpO1xuICAgICAgICAgICAgaWYgKGluc3RhbGxhdGlvbkZyb21SZXBvLnBieExpY2Vuc2UgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7Z2xvYmFsUm9vdFVybH1wYngtZXh0ZW5zaW9uLW1vZHVsZXMvaW5kZXgjL2xpY2Vuc2luZ2A7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluc3RhbGxhdGlvbkZyb21SZXBvLm9wZW5JbnN0YWxsTW9kdWxlTW9kYWwoJGN1cnJlbnRCdXR0b24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgICBpbnN0YWxsYXRpb25Gcm9tUmVwby4kYnRuVXBkYXRlQWxsTW9kdWxlcy5vbignY2xpY2snLCBpbnN0YWxsYXRpb25Gcm9tUmVwby51cGRhdGVBbGxNb2R1bGVzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3BlbnMgdGhlIG1vZGFsIGZvcm0gZm9yIGluc3RhbGxpbmcgYSBtb2R1bGUuIFRoaXMgbW9kYWwgcHJvdmlkZXMgdGhlIHVzZXIgd2l0aCBpbmZvcm1hdGlvblxuICAgICAqIGFib3V0IHRoZSBtb2R1bGUgdGhleSBhcmUgYWJvdXQgdG8gaW5zdGFsbCwgYW5kIGNvbmZpcm1zIHRoZWlyIGFjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkY3VycmVudEJ1dHRvbiAtIFRoZSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBidXR0b24gdGhhdCB3YXMgY2xpY2tlZCB0byB0cmlnZ2VyIHRoaXMgbW9kYWwuXG4gICAgICovXG4gICAgb3Blbkluc3RhbGxNb2R1bGVNb2RhbCgkY3VycmVudEJ1dHRvbikge1xuICAgICAgICBjb25zdCBtb2R1bGVVbmlxdWVJZCA9ICRjdXJyZW50QnV0dG9uLmRhdGEoJ3VuaXFpZCcpO1xuICAgICAgICBjb25zdCByZWxlYXNlSWQgPSAkY3VycmVudEJ1dHRvbi5kYXRhKCdyZWxlYXNlaWQnKTtcbiAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVJlcG8uJGluc3RhbGxNb2R1bGVNb2RhbEZvcm1cbiAgICAgICAgICAgIC5tb2RhbCh7XG4gICAgICAgICAgICAgICAgY2xvc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2hvdzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gJGN1cnJlbnRCdXR0b24uY2xvc2VzdCgndHInKS5kYXRhKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoZUZvcm0gPSAgaW5zdGFsbGF0aW9uRnJvbVJlcG8uJGluc3RhbGxNb2R1bGVNb2RhbEZvcm07XG4gICAgICAgICAgICAgICAgICAgIHRoZUZvcm0uZmluZCgnc3Bhbi5tb2R1bGUtbmFtZScpLnRleHQobW9kdWxlTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgJGluc3RhbGxlZE1vZHVsZVJvdyA9ICQoYHRyLm1vZHVsZS1yb3dbZGF0YS1pZD0ke21vZHVsZVVuaXF1ZUlkfV1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRpbnN0YWxsZWRNb2R1bGVSb3cubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFsbGVkVmVyc2lvbiA9ICRpbnN0YWxsZWRNb2R1bGVSb3cuZGF0YSgndmVyc2lvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmVyc2lvbiA9ICRjdXJyZW50QnV0dG9uLmRhdGEoJ3ZlcnNpb24nKT8/aW5zdGFsbGVkVmVyc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZXRwbGFjZS52ZXJzaW9uQ29tcGFyZShuZXdWZXJzaW9uLCBpbnN0YWxsZWRWZXJzaW9uKT4wKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVGb3JtLmZpbmQoJ3NwYW4uYWN0aW9uJykudGV4dChnbG9iYWxUcmFuc2xhdGUuZXh0X1VwZGF0ZU1vZHVsZVRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVGb3JtLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoZ2xvYmFsVHJhbnNsYXRlLmV4dF9Nb2R1bGVVcGRhdGVEZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZUZvcm0uZmluZCgnc3Bhbi5hY3Rpb24nKS50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfRG93bmdyYWRlTW9kdWxlVGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZUZvcm0uZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbChnbG9iYWxUcmFuc2xhdGUuZXh0X01vZHVsZURvd25ncmFkZURlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUZvcm0uZmluZCgnc3Bhbi5hY3Rpb24nKS50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfSW5zdGFsbE1vZHVsZVRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUZvcm0uZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbChnbG9iYWxUcmFuc2xhdGUuZXh0X01vZHVsZUluc3RhbGxEZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRGVueTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkKCdhLmJ1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQXBwcm92ZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkKCdhLmJ1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFpZDogbW9kdWxlVW5pcXVlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSWQ6IHJlbGVhc2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxJZDogaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIuY2hhbm5lbElkXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgJChgI21vZGFsLSR7cGFyYW1zLnVuaXFpZH1gKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCAkbW9kdWxlQnV0dG9ucyA9ICQoYGFbZGF0YS11bmlxaWQ9JHtwYXJhbXMudW5pcWlkfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICRtb2R1bGVCdXR0b25zLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAkbW9kdWxlQnV0dG9ucy5maW5kKCdpJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnZG93bmxvYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdyZWRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc3Bpbm5lciBsb2FkaW5nJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgndHIudGFibGUtZXJyb3ItbWVzc2FnZXMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgndHIuZXJyb3InKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcblxuICAgICAgICAgICAgICAgICAgICBQYnhBcGkuTW9kdWxlc0luc3RhbGxGcm9tUmVwbyhwYXJhbXMsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UucmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IGluc3RhbGxhdGlvbkZyb21SZXBvLiRwcm9ncmVzc0JhckJsb2NrLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAubW9kYWwoJ3Nob3cnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIHRoZSBwcm9jZXNzIG9mIHVwZGF0aW5nIGFsbCBpbnN0YWxsZWQgbW9kdWxlcy4gVGhpcyBmdW5jdGlvbiBpcyB0cmlnZ2VyZWQgYnkgdGhlIHVzZXJcbiAgICAgKiBjbGlja2luZyB0aGUgJ1VwZGF0ZSBBbGwnIGJ1dHRvbi4gSXQgZmlyc3QgZGlzYWJsZXMgVUkgZWxlbWVudHMgdG8gcHJldmVudCBmdXJ0aGVyIHVzZXIgYWN0aW9uc1xuICAgICAqIGFuZCB0aGVuIGNhbGxzIHRoZSBBUEkgdG8gc3RhcnQgdGhlIHVwZGF0ZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSAtIFRoZSBjbGljayBldmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSAnVXBkYXRlIEFsbCcgYnV0dG9uIGNsaWNrLlxuICAgICAqL1xuICAgIHVwZGF0ZUFsbE1vZHVsZXMoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJ2EuYnV0dG9uJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIGNvbnN0ICRjdXJyZW50QnV0dG9uID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYScpO1xuICAgICAgICBpbnN0YWxsYXRpb25Gcm9tUmVwby5vcGVuVXBkYXRlQWxsTW9kdWxlc01vZGFsKCRjdXJyZW50QnV0dG9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3BlbnMgYSBtb2RhbCBjb25maXJtYXRpb24gZGlhbG9nIHdoZW4gdXBkYXRpbmcgYWxsIG1vZHVsZXMuIFRoaXMgZGlhbG9nIGluZm9ybXMgdGhlIHVzZXIgYWJvdXRcbiAgICAgKiB0aGUgdXBkYXRlIHByb2Nlc3MgYW5kIGFza3MgZm9yIGNvbmZpcm1hdGlvbiB0byBwcm9jZWVkIHdpdGggdXBkYXRpbmcgYWxsIGluc3RhbGxlZCBtb2R1bGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRjdXJyZW50QnV0dG9uIC0gVGhlIGpRdWVyeSBvYmplY3Qgb2YgdGhlIGJ1dHRvbiB0aGF0IHdhcyBjbGlja2VkIHRvIHRyaWdnZXIgdGhpcyBtb2RhbC5cbiAgICAgKi9cbiAgICBvcGVuVXBkYXRlQWxsTW9kdWxlc01vZGFsKCRjdXJyZW50QnV0dG9uKSB7XG4gICAgICAgIGluc3RhbGxhdGlvbkZyb21SZXBvLiRpbnN0YWxsTW9kdWxlTW9kYWxGb3JtXG4gICAgICAgICAgICAubW9kYWwoe1xuICAgICAgICAgICAgICAgIGNsb3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNob3c6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhlRm9ybSA9ICBpbnN0YWxsYXRpb25Gcm9tUmVwby4kaW5zdGFsbE1vZHVsZU1vZGFsRm9ybTtcbiAgICAgICAgICAgICAgICAgICAgdGhlRm9ybS5maW5kKCdzcGFuLmFjdGlvbicpLnRleHQoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGRhdGVBbGxNb2R1bGVzVGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGVGb3JtLmZpbmQoJ3NwYW4ubW9kdWxlLW5hbWUnKS50ZXh0KCcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhlRm9ybS5maW5kKCdkaXYuZGVzY3JpcHRpb24nKS5odG1sKGdsb2JhbFRyYW5zbGF0ZS5leHRfVXBkYXRlQWxsTW9kdWxlc0Rlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRGVueTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkKCdhLmJ1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQXBwcm92ZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAkKCdhLmJ1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICRjdXJyZW50QnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAkY3VycmVudEJ1dHRvbi5jbG9zZXN0KCdpLmljb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdyZWRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc3Bpbm5lciBsb2FkaW5nJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHVuaXF1ZU1vZHVsZXNGb3JVcGRhdGUgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICQoJ2EudXBkYXRlJykuZWFjaCgoaW5kZXgsICRidXR0b24pPT57XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVNb2R1bGVzRm9yVXBkYXRlLmFkZCgkKCRidXR0b24pLmRhdGEoJ3VuaXFpZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxJZDogaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIuY2hhbm5lbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc0ZvclVwZGF0ZTogWy4uLnVuaXF1ZU1vZHVsZXNGb3JVcGRhdGVdLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBQYnhBcGkuTW9kdWxlc1VwZGF0ZUFsbChwYXJhbXMsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJ3RyLnRhYmxlLWVycm9yLW1lc3NhZ2VzJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoJ3RyLmVycm9yJykucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAubW9kYWwoJ3Nob3cnKTtcbiAgICB9LFxuXG59O1xuXG4vLyBJbml0aWFsaXplcyB0aGUgaW5zdGFsbGF0aW9uRnJvbVJlcG8gbW9kdWxlIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5LFxuLy8gcHJlcGFyaW5nIHRoZSBleHRlbnNpb24gbW9kdWxlcyBtYW5hZ2VtZW50IFVJLlxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGluc3RhbGxhdGlvbkZyb21SZXBvLmluaXRpYWxpemUoKTtcbn0pOyJdfQ==