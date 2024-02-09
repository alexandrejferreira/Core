"use strict";

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
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

/* global globalRootUrl, PbxApi, globalTranslate, UserMessage */

/**
 * Monitors the status of module installation.
 *
 * @module installStatusLoopWorker
 */
var installStatusLoopWorker = {
  /**
   * Time in milliseconds before fetching new status request.
   * @type {number}
   */
  timeOut: 1000,

  /**
   * The id of the timer function for the status worker.
   * @type {number}
   */
  timeOutHandle: 0,

  /**
   * The file path of the module being installed.
   * @type {string}
   */
  filePath: '',

  /**
   * The number of iterations performed.
   * @type {number}
   */
  iterations: 0,

  /**
   * The previous progress percentage.
   * @type {string}
   */
  oldPercent: '0',

  /**
   * Flag indicating if enabling is needed after installation.
   * @type {boolean}
   */
  needEnableAfterInstall: false,

  /**
   * The progress bar label element.
   * @type {jQuery}
   */
  $progressBar: $('#upload-progress-bar'),

  /**
   * Module Unique id.
   * @type string
   */
  moduleUniqid: '',

  /**
   * Initializes the installStatusLoopWorker object.
   * @param {string} filePath - The file path of the module being installed.
   * @param {boolean} [needEnable=false] - Flag indicating if enabling is needed after installation.
   */
  initialize: function initialize(filePath) {
    var needEnable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    installStatusLoopWorker.filePath = filePath;
    installStatusLoopWorker.iterations = 0;
    installStatusLoopWorker.needEnableAfterInstall = needEnable;
    installStatusLoopWorker.restartWorker();
  },

  /**
   * Restarts the worker.
   */
  restartWorker: function restartWorker() {
    window.clearTimeout(installStatusLoopWorker.timeoutHandle);
    installStatusLoopWorker.worker();
  },

  /**
   * Worker function for checking the installation status.
   */
  worker: function worker() {
    window.clearTimeout(installStatusLoopWorker.timeoutHandle);
    PbxApi.ModulesGetModuleInstallationStatus(installStatusLoopWorker.filePath, installStatusLoopWorker.cbAfterReceiveNewStatus);
  },

  /**
   * Callback function after receiving the new installation status.
   * @param {boolean} result - The result of the installation status check.
   * @param {object} response - The response object containing the installation status.
   */
  cbAfterReceiveNewStatus: function cbAfterReceiveNewStatus(result, response) {
    installStatusLoopWorker.iterations += 1;
    installStatusLoopWorker.timeoutHandle = window.setTimeout(installStatusLoopWorker.worker, installStatusLoopWorker.timeOut); // Check installation status

    if (result === false && installStatusLoopWorker.iterations < 50) {
      window.clearTimeout(installStatusLoopWorker.timeoutHandle);
    } else if (installStatusLoopWorker.iterations > 50 || response.data.i_status === 'INSTALLATION_ERROR' || response.data.i_status === 'PROGRESS_FILE_NOT_FOUND') {
      window.clearTimeout(installStatusLoopWorker.timeoutHandle);
      UserMessage.showMultiString(response.messages, globalTranslate.ext_InstallationError);
      $('.loading').removeClass('loading');
    } else if (response.data.i_status === 'INSTALLATION_IN_PROGRESS') {
      installStatusLoopWorker.$progressBar.progress({
        percent: parseInt(response.data.i_status_progress, 10)
      });

      if (installStatusLoopWorker.oldPercent !== response.data.i_status_progress) {
        installStatusLoopWorker.iterations = 0;
      }

      installStatusLoopWorker.oldPercent = response.data.i_status_progress;
    } else if (response.data.i_status === 'INSTALLATION_COMPLETE') {
      installStatusLoopWorker.$progressBar.progress({
        percent: 100
      });

      if (installStatusLoopWorker.needEnableAfterInstall) {
        // Enable the installed module and redirect to the module index page
        PbxApi.ModulesEnableModule(response.data.uniqid, function () {
          window.location = "".concat(globalRootUrl, "pbx-extension-modules/index/");
        });
      } else {
        // Redirect to the module index page
        window.location = "".concat(globalRootUrl, "pbx-extension-modules/index/");
      }

      window.clearTimeout(installStatusLoopWorker.timeoutHandle);
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLWluc3RhbGwtc3RhdHVzLXdvcmtlci5qcyJdLCJuYW1lcyI6WyJpbnN0YWxsU3RhdHVzTG9vcFdvcmtlciIsInRpbWVPdXQiLCJ0aW1lT3V0SGFuZGxlIiwiZmlsZVBhdGgiLCJpdGVyYXRpb25zIiwib2xkUGVyY2VudCIsIm5lZWRFbmFibGVBZnRlckluc3RhbGwiLCIkcHJvZ3Jlc3NCYXIiLCIkIiwibW9kdWxlVW5pcWlkIiwiaW5pdGlhbGl6ZSIsIm5lZWRFbmFibGUiLCJyZXN0YXJ0V29ya2VyIiwid2luZG93IiwiY2xlYXJUaW1lb3V0IiwidGltZW91dEhhbmRsZSIsIndvcmtlciIsIlBieEFwaSIsIk1vZHVsZXNHZXRNb2R1bGVJbnN0YWxsYXRpb25TdGF0dXMiLCJjYkFmdGVyUmVjZWl2ZU5ld1N0YXR1cyIsInJlc3VsdCIsInJlc3BvbnNlIiwic2V0VGltZW91dCIsImRhdGEiLCJpX3N0YXR1cyIsIlVzZXJNZXNzYWdlIiwic2hvd011bHRpU3RyaW5nIiwibWVzc2FnZXMiLCJnbG9iYWxUcmFuc2xhdGUiLCJleHRfSW5zdGFsbGF0aW9uRXJyb3IiLCJyZW1vdmVDbGFzcyIsInByb2dyZXNzIiwicGVyY2VudCIsInBhcnNlSW50IiwiaV9zdGF0dXNfcHJvZ3Jlc3MiLCJNb2R1bGVzRW5hYmxlTW9kdWxlIiwidW5pcWlkIiwibG9jYXRpb24iLCJnbG9iYWxSb290VXJsIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLHVCQUF1QixHQUFHO0FBRTVCO0FBQ0o7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLE9BQU8sRUFBRSxJQU5tQjs7QUFRNUI7QUFDSjtB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QyxDQUE4QztBQUMxQ0MsUUFBQUEsT0FBTyxFQUFFQyxRQUFRLENBQUNaLFFBQVEsQ0FBQ0UsSUFBVCxDQUFjVyxpQkFBZixFQUFrQyxFQUFsQztBQUR5QixPQUE5Qzs7QUFHQSxVQUFJbEMsdUJBQXVCLENBQUNLLFVBQXhCLEtBQXVDZ0IsUUFBUSxDQUFDRSxJQUFULENBQWNXLGlCQUF6RCxFQUE0RTtBQUN4RWxDLFFBQUFBLHVCQUF1QixDQUFDSSxVQUF4QixHQUFxQyxDQUFyQztBQUNIOztBQUNESixNQUFBQSx1QkFBdUIsQ0FBQ0ssVUFBeEIsR0FBcUNnQixRQUFRLENBQUNFLElBQVQsQ0FBY1csaUJBQW5EO0FBQ0gsS0FSTSxNQVFBLElBQUliLFFBQVEsQ0FBQ0UsSUFBVCxDQUFjQyxRQUFkLEtBQTJCLHVCQUEvQixFQUF3RDtBQUMzRHhCLE1BQUFBLHVCQUF1QixDQUFDTyxZQUF4QixDQUFxQ3dCLFFBQXJDLENBQThDO0FBQzFDQyxRQUFBQSxPQUFPLEVBQUU7QUFEaUMsT0FBOUM7O0FBR0EsVUFBSWhDLHVCQUF1QixDQUFDTSxzQkFBNUIsRUFBb0Q7QUFDaEQ7QUFDSVcsUUFBQUEsTUFBTSxDQUFDa0IsbUJBQVAsQ0FDQWQsUUFBUSxDQUFDRSxJQUFULENBQWNhLE1BRGQsRUFFQSxZQUFNO0FBQ0Z2QixVQUFBQSxNQUFNLENBQUN3QixRQUFQLGFBQXFCQyxhQUFyQjtBQUNILFNBSkQ7QUFNUCxPQVJELE1BUU87QUFDSDtBQUNBekIsUUFBQUEsTUFBTSxDQUFDd0IsUUFBUCxhQUFxQkMsYUFBckI7QUFDSDs7QUFDRHpCLE1BQUFBLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQmQsdUJBQXVCLENBQUNlLGFBQTVDO0FBQ0g7QUFDSjtBQWpJMkIsQ0FBaEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwgUGJ4QXBpLCBnbG9iYWxUcmFuc2xhdGUsIFVzZXJNZXNzYWdlICovXG5cbi8qKlxuICogTW9uaXRvcnMgdGhlIHN0YXR1cyBvZiBtb2R1bGUgaW5zdGFsbGF0aW9uLlxuICpcbiAqIEBtb2R1bGUgaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXJcbiAqL1xuY29uc3QgaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIgPSB7XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgZmV0Y2hpbmcgbmV3IHN0YXR1cyByZXF1ZXN0LlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGltZU91dDogMTAwMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBpZCBvZiB0aGUgdGltZXIgZnVuY3Rpb24gZm9yIHRoZSBzdGF0dXMgd29ya2VyLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGltZU91dEhhbmRsZTogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaWxlIHBhdGggb2YgdGhlIG1vZHVsZSBiZWluZyBpbnN0YWxsZWQuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBmaWxlUGF0aDogJycsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGl0ZXJhdGlvbnMgcGVyZm9ybWVkLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgaXRlcmF0aW9uczogMCxcblxuICAgIC8qKlxuICAgICAqIFRoZSBwcmV2aW91cyBwcm9ncmVzcyBwZXJjZW50YWdlLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgb2xkUGVyY2VudDogJzAnLFxuXG4gICAgLyoqXG4gICAgICogRmxhZyBpbmRpY2F0aW5nIGlmIGVuYWJsaW5nIGlzIG5lZWRlZCBhZnRlciBpbnN0YWxsYXRpb24uXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgbmVlZEVuYWJsZUFmdGVySW5zdGFsbDogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgcHJvZ3Jlc3MgYmFyIGxhYmVsIGVsZW1lbnQuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkcHJvZ3Jlc3NCYXI6ICQoJyN1cGxvYWQtcHJvZ3Jlc3MtYmFyJyksXG5cbiAgICAvKipcbiAgICAgKiBNb2R1bGUgVW5pcXVlIGlkLlxuICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAqL1xuICAgIG1vZHVsZVVuaXFpZDogJycsXG5cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlciBvYmplY3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gVGhlIGZpbGUgcGF0aCBvZiB0aGUgbW9kdWxlIGJlaW5nIGluc3RhbGxlZC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtuZWVkRW5hYmxlPWZhbHNlXSAtIEZsYWcgaW5kaWNhdGluZyBpZiBlbmFibGluZyBpcyBuZWVkZWQgYWZ0ZXIgaW5zdGFsbGF0aW9uLlxuICAgICAqL1xuICAgIGluaXRpYWxpemUoZmlsZVBhdGgsIG5lZWRFbmFibGUgPSBmYWxzZSkge1xuICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5maWxlUGF0aCA9IGZpbGVQYXRoO1xuICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zID0gMDtcbiAgICAgICAgaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIubmVlZEVuYWJsZUFmdGVySW5zdGFsbCA9IG5lZWRFbmFibGU7XG4gICAgICAgIGluc3RhbGxTdGF0dXNMb29wV29ya2VyLnJlc3RhcnRXb3JrZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIHdvcmtlci5cbiAgICAgKi9cbiAgICByZXN0YXJ0V29ya2VyKCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGluc3RhbGxTdGF0dXNMb29wV29ya2VyLnRpbWVvdXRIYW5kbGUpO1xuICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci53b3JrZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV29ya2VyIGZ1bmN0aW9uIGZvciBjaGVja2luZyB0aGUgaW5zdGFsbGF0aW9uIHN0YXR1cy5cbiAgICAgKi9cbiAgICB3b3JrZXIoKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG4gICAgICAgIFBieEFwaS5Nb2R1bGVzR2V0TW9kdWxlSW5zdGFsbGF0aW9uU3RhdHVzKFxuICAgICAgICAgICAgaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIuZmlsZVBhdGgsXG4gICAgICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5jYkFmdGVyUmVjZWl2ZU5ld1N0YXR1c1xuICAgICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBmdW5jdGlvbiBhZnRlciByZWNlaXZpbmcgdGhlIG5ldyBpbnN0YWxsYXRpb24gc3RhdHVzLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzdWx0IC0gVGhlIHJlc3VsdCBvZiB0aGUgaW5zdGFsbGF0aW9uIHN0YXR1cyBjaGVjay5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGluc3RhbGxhdGlvbiBzdGF0dXMuXG4gICAgICovXG4gICAgY2JBZnRlclJlY2VpdmVOZXdTdGF0dXMocmVzdWx0LCByZXNwb25zZSkge1xuICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zICs9IDE7XG4gICAgICAgIGluc3RhbGxTdGF0dXNMb29wV29ya2VyLnRpbWVvdXRIYW5kbGUgPVxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIud29ya2VyLCBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci50aW1lT3V0KTtcblxuICAgICAgICAvLyBDaGVjayBpbnN0YWxsYXRpb24gc3RhdHVzXG4gICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlXG4gICAgICAgICAgICAmJiBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zIDwgNTApIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIuaXRlcmF0aW9ucyA+IDUwXG4gICAgICAgICAgICB8fCByZXNwb25zZS5kYXRhLmlfc3RhdHVzID09PSAnSU5TVEFMTEFUSU9OX0VSUk9SJ1xuICAgICAgICAgICAgfHwgcmVzcG9uc2UuZGF0YS5pX3N0YXR1cyA9PT0gJ1BST0dSRVNTX0ZJTEVfTk9UX0ZPVU5EJ1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG4gICAgICAgICAgICBVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMsIGdsb2JhbFRyYW5zbGF0ZS5leHRfSW5zdGFsbGF0aW9uRXJyb3IpO1xuICAgICAgICAgICAgJCgnLmxvYWRpbmcnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEuaV9zdGF0dXMgPT09ICdJTlNUQUxMQVRJT05fSU5fUFJPR1JFU1MnKSB7XG4gICAgICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci4kcHJvZ3Jlc3NCYXIucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgIHBlcmNlbnQ6IHBhcnNlSW50KHJlc3BvbnNlLmRhdGEuaV9zdGF0dXNfcHJvZ3Jlc3MsIDEwKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGluc3RhbGxTdGF0dXNMb29wV29ya2VyLm9sZFBlcmNlbnQgIT09IHJlc3BvbnNlLmRhdGEuaV9zdGF0dXNfcHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5pdGVyYXRpb25zID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluc3RhbGxTdGF0dXNMb29wV29ya2VyLm9sZFBlcmNlbnQgPSByZXNwb25zZS5kYXRhLmlfc3RhdHVzX3Byb2dyZXNzO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEuaV9zdGF0dXMgPT09ICdJTlNUQUxMQVRJT05fQ09NUExFVEUnKSB7XG4gICAgICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci4kcHJvZ3Jlc3NCYXIucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgIHBlcmNlbnQ6IDEwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGluc3RhbGxTdGF0dXNMb29wV29ya2VyLm5lZWRFbmFibGVBZnRlckluc3RhbGwpIHtcbiAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIGluc3RhbGxlZCBtb2R1bGUgYW5kIHJlZGlyZWN0IHRvIHRoZSBtb2R1bGUgaW5kZXggcGFnZVxuICAgICAgICAgICAgICAgICAgICBQYnhBcGkuTW9kdWxlc0VuYWJsZU1vZHVsZShcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS51bmlxaWQsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGAke2dsb2JhbFJvb3RVcmx9cGJ4LWV4dGVuc2lvbi1tb2R1bGVzL2luZGV4L2A7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIG1vZHVsZSBpbmRleCBwYWdlXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7Z2xvYmFsUm9vdFVybH1wYngtZXh0ZW5zaW9uLW1vZHVsZXMvaW5kZXgvYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW5zdGFsbFN0YXR1c0xvb3BXb3JrZXIudGltZW91dEhhbmRsZSk7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbiJdfQ==