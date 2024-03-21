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

/* global UserMessage, globalTranslate, PbxApi, installStatusLoopWorker */

/**
 * Handles the process of installing new PBX extensions from a ZIP file.
 * This includes managing file uploads, displaying upload progress, and initiating the installation process.
 *
 * @module addNewExtension
 */
var installationFromZip = {
  /**
   * The jQuery object representing the upload button element in the DOM.
   * Users interact with this button to select and upload ZIP files containing new extensions.
   * @type {jQuery}
   */
  $uploadButton: $('#add-new-button'),

  /**
   * The jQuery object for the block element that contains the progress bar.
   * This element is shown during the file upload process to provide visual feedback to the user.
   * @type {jQuery}
   */
  $progressBarBlock: $('#upload-progress-bar-block'),

  /**
   * The jQuery object for the actual progress bar element.
   * It visually represents the progress of the file upload operation to the user.
   * @type {jQuery}
   */
  $progressBar: $('#upload-progress-bar'),

  /**
   * The jQuery object for the label element associated with the progress bar.
   * This label provides textual feedback about the upload status (e.g., percentage completed, errors).
   * @type {jQuery}
   */
  $progressBarLabel: $('#upload-progress-bar-label'),

  /**
   * A flag indicating whether a file upload is currently in progress.
   * This helps manage the UI state and prevent multiple concurrent uploads.
   * @type {boolean}
   */
  uploadInProgress: false,

  /**
   * A unique identifier for the PUB/SUB channel used to monitor the installation process.
   * This allows the system to receive updates about the installation status.
   */
  channelId: 'install-module',

  /**
   * Initializes the installationFromZip module by setting up the necessary UI elements
   * and attaching event listeners for file uploads.
   */
  initialize: function initialize() {
    installationFromZip.$progressBar.hide();
    PbxApi.SystemUploadFileAttachToBtn('add-new-button', ['zip'], installationFromZip.cbResumableUploadFile);
  },

  /**
   * Handles the various stages of the file upload process, including starting the upload,
   * tracking progress, and handling success or error events.
   *
   * @param {string} action - The current action or stage of the file upload process.
   * @param {object} params - Additional parameters related to the current upload action,
   *                          such as progress percentage or response data on completion.
   */
  cbResumableUploadFile: function cbResumableUploadFile(action, params) {
    switch (action) {
      case 'fileSuccess':
        installationFromZip.checkStatusFileMerging(params.response);
        break;

      case 'uploadStart':
        installationFromZip.uploadInProgress = true;
        installationFromZip.$uploadButton.addClass('loading');
        installationFromZip.$progressBar.show();
        installationFromZip.$progressBarBlock.show();
        installationFromZip.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
        break;

      case 'progress':
        installationFromZip.$progressBar.progress({
          percent: Math.max(Math.round(parseInt(params.percent, 10) / 2) - 2, 1)
        });
        break;

      case 'error':
        installationFromZip.$progressBarLabel.text(globalTranslate.ext_UploadError);
        installationFromZip.$uploadButton.removeClass('loading');
        UserMessage.showMultiString(globalTranslate.ext_UploadError);
        break;

      default:
    }
  },

  /**
   * Checks the status of the file merging process on the server after a successful upload.
   * This step is necessary to ensure that the uploaded ZIP file is properly processed
   * and ready for installation.
   *
   * @param {string} response - The server's response from the file upload process,
   *                            containing information necessary to proceed with the installation.
   */
  checkStatusFileMerging: function checkStatusFileMerging(response) {
    if (response === undefined || PbxApi.tryParseJSON(response) === false) {
      UserMessage.showMultiString("".concat(globalTranslate.ext_UploadError));
      return;
    }

    var json = JSON.parse(response);

    if (json === undefined || json.data === undefined) {
      UserMessage.showMultiString("".concat(globalTranslate.ext_UploadError));
      return;
    }

    var params = {
      fileId: json.data.upload_id,
      filePath: json.data.filename,
      channelId: installationFromZip.channelId
    };
    PbxApi.ModulesInstallFromPackage(params, function (response) {
      console.debug(response);

      if (response.result === true) {
        $('html, body').animate({
          scrollTop: installationFromZip.$progressBarBlock.offset().top
        }, 2000);
      }
    });
  }
}; // Initializes the installationFromZip module when the DOM is fully loaded,
// allowing users to upload and install extensions from ZIP files.

$(document).ready(function () {
  installationFromZip.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLWluc3RhbGwtZnJvbS16aXAuanMiXSwibmFtZXMiOlsiaW5zdGFsbGF0aW9uRnJvbVppcCIsIiR1cGxvYWRCdXR0b24iLCIkIiwiJHByb2dyZXNzQmFyQmxvY2siLCIkcHJvZ3Jlc3NCYXIiLCIkcHJvZ3Jlc3NCYXJMYWJlbCIsInVwbG9hZEluUHJvZ3Jlc3MiLCJjaGFubmVsSWQiLCJpbml0aWFsaXplIiwiaGlkZSIsIlBieEFwaSIsIlN5c3RlbVVwbG9hZEZpbGVBdHRhY2hUb0J0biIsImNiUmVzdW1hYmxlVXBsb2FkRmlsZSIsImFjdGlvbiIsInBhcmFtcyIsImNoZWNrU3RhdHVzRmlsZU1lcmdpbmciLCJyZXNwb25zZSIsImFkZENsYXNzIiwic2hvdyIsInRleHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJleHRfVXBsb2FkSW5Qcm9ncmVzcyIsInByb2dyZXNzIiwicGVyY2VudCIsIk1hdGgiLCJtYXgiLCJyb3VuZCIsInBhcnNlSW50IiwiZXh0X1VwbG9hZEVycm9yIiwicmVtb3ZlQ2xhc3MiLCJVc2VyTWVzc2FnZSIsInNob3dNdWx0aVN0cmluZyIsInVuZGVmaW5lZCIsInRyeVBhcnNlSlNPTiIsImpzb24iLCJKU09OIiwicGFyc2UiLCJkYXRhIiwiZmlsZUlkIiwidXBsb2FkX2lkIiwiZmlsZVBhdGgiLCJmaWxlbmFtZSIsIk1vZHVsZXNJbnN0YWxsRnJvbVBhY2thZ2UiLCJjb25zb2xlIiwiZGVidWciLCJyZXN1bHQiLCJhbmltYXRlIiwic2Nyb2xsVG9wIiwib2Zmc2V0IiwidG9wIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFJLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXcEIsUUFBWCxDQUFiOztBQUNBLFFBQUlrQixJQUFJLEtBQUtGLFNBQVQsSUFBc0JFLElBQUksQ0FBQ0csSUFBTCxLQUFjTCxTQUF4QyxFQUFtRDtBQUMvQ0YsTUFBQUEsV0FBVyxDQUFDQyxlQUFaLFdBQStCWCxlQUFlLENBQUNRLGVBQS9DO0FBQ0E7QUFDSDs7QUFDRCxRQUFNZCxNQUFNLEdBQUc7QUFDWHdCLE1BQUFBLE1BQU0sRUFBRUosSUFBSSxDQUFDRyxJQUFMLENBQVVFLFNBRFA7QUFFWEMsTUFBQUEsUUFBUSxFQUFFTixJQUFJLENBQUNHLElBQUwsQ0FBVUksUUFGVDtBQUdYbEMsTUFBQUEsU0FBUyxFQUFFUCxtQkFBbUIsQ0FBQ087QUFIcEIsS0FBZjtBQUtBRyxJQUFBQSxNQUFNLENBQUNnQyx5QkFBUCxDQUFpQzVCLE1BQWpDLEVBQTBDLFVBQUNFLFFBQUQsRUFBYztBQUNwRDJCLE1BQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFjNUIsUUFBZDs7QUFDQSxVQUFJQSxRQUFRLENBQUM2QixNQUFULEtBQW9CLElBQXhCLEVBQThCO0FBQzFCM0MsUUFBQUEsQ0FBQyxDQUFDLFlBQUQsQ0FBRCxDQUFnQjRDLE9BQWhCLENBQXdCO0FBQ3BCQyxVQUFBQSxTQUFTLEVBQUUvQyxtQkFBbUIsQ0FBQ0csaUJBQXBCLENBQXNDNkMsTUFBdEMsR0FBK0NDO0FBRHRDLFNBQXhCLEVBRUcsSUFGSDtBQUdIO0FBQ0osS0FQRDtBQVFIO0FBckh1QixDQUE1QixDLENBeUhBO0FBQ0E7O0FBQ0EvQyxDQUFDLENBQUNnRCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3BCbkQsRUFBQUEsbUJBQW1CLENBQUNRLFVBQXBCO0FBQ0gsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBVc2VyTWVzc2FnZSwgZ2xvYmFsVHJhbnNsYXRlLCBQYnhBcGksIGluc3RhbGxTdGF0dXNMb29wV29ya2VyICovXG5cbi8qKlxuICogSGFuZGxlcyB0aGUgcHJvY2VzcyBvZiBpbnN0YWxsaW5nIG5ldyBQQlggZXh0ZW5zaW9ucyBmcm9tIGEgWklQIGZpbGUuXG4gKiBUaGlzIGluY2x1ZGVzIG1hbmFnaW5nIGZpbGUgdXBsb2FkcywgZGlzcGxheWluZyB1cGxvYWQgcHJvZ3Jlc3MsIGFuZCBpbml0aWF0aW5nIHRoZSBpbnN0YWxsYXRpb24gcHJvY2Vzcy5cbiAqXG4gKiBAbW9kdWxlIGFkZE5ld0V4dGVuc2lvblxuICovXG5jb25zdCBpbnN0YWxsYXRpb25Gcm9tWmlwID0ge1xuICAgIC8qKlxuICAgICAqIFRoZSBqUXVlcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgdXBsb2FkIGJ1dHRvbiBlbGVtZW50IGluIHRoZSBET00uXG4gICAgICogVXNlcnMgaW50ZXJhY3Qgd2l0aCB0aGlzIGJ1dHRvbiB0byBzZWxlY3QgYW5kIHVwbG9hZCBaSVAgZmlsZXMgY29udGFpbmluZyBuZXcgZXh0ZW5zaW9ucy5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICR1cGxvYWRCdXR0b246ICQoJyNhZGQtbmV3LWJ1dHRvbicpLFxuXG5cbiAgICAvKipcbiAgICAgKiBUaGUgalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGJsb2NrIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgcHJvZ3Jlc3MgYmFyLlxuICAgICAqIFRoaXMgZWxlbWVudCBpcyBzaG93biBkdXJpbmcgdGhlIGZpbGUgdXBsb2FkIHByb2Nlc3MgdG8gcHJvdmlkZSB2aXN1YWwgZmVlZGJhY2sgdG8gdGhlIHVzZXIuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkcHJvZ3Jlc3NCYXJCbG9jazogJCgnI3VwbG9hZC1wcm9ncmVzcy1iYXItYmxvY2snKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgYWN0dWFsIHByb2dyZXNzIGJhciBlbGVtZW50LlxuICAgICAqIEl0IHZpc3VhbGx5IHJlcHJlc2VudHMgdGhlIHByb2dyZXNzIG9mIHRoZSBmaWxlIHVwbG9hZCBvcGVyYXRpb24gdG8gdGhlIHVzZXIuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkcHJvZ3Jlc3NCYXI6ICQoJyN1cGxvYWQtcHJvZ3Jlc3MtYmFyJyksXG5cbiAgICAvKipcbiAgICAgKiBUaGUgalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxhYmVsIGVsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm9ncmVzcyBiYXIuXG4gICAgICogVGhpcyBsYWJlbCBwcm92aWRlcyB0ZXh0dWFsIGZlZWRiYWNrIGFib3V0IHRoZSB1cGxvYWQgc3RhdHVzIChlLmcuLCBwZXJjZW50YWdlIGNvbXBsZXRlZCwgZXJyb3JzKS5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICRwcm9ncmVzc0JhckxhYmVsOiAkKCcjdXBsb2FkLXByb2dyZXNzLWJhci1sYWJlbCcpLFxuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBhIGZpbGUgdXBsb2FkIGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzcy5cbiAgICAgKiBUaGlzIGhlbHBzIG1hbmFnZSB0aGUgVUkgc3RhdGUgYW5kIHByZXZlbnQgbXVsdGlwbGUgY29uY3VycmVudCB1cGxvYWRzLlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHVwbG9hZEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIFBVQi9TVUIgY2hhbm5lbCB1c2VkIHRvIG1vbml0b3IgdGhlIGluc3RhbGxhdGlvbiBwcm9jZXNzLlxuICAgICAqIFRoaXMgYWxsb3dzIHRoZSBzeXN0ZW0gdG8gcmVjZWl2ZSB1cGRhdGVzIGFib3V0IHRoZSBpbnN0YWxsYXRpb24gc3RhdHVzLlxuICAgICAqL1xuICAgIGNoYW5uZWxJZDogJ2luc3RhbGwtbW9kdWxlJyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBpbnN0YWxsYXRpb25Gcm9tWmlwIG1vZHVsZSBieSBzZXR0aW5nIHVwIHRoZSBuZWNlc3NhcnkgVUkgZWxlbWVudHNcbiAgICAgKiBhbmQgYXR0YWNoaW5nIGV2ZW50IGxpc3RlbmVycyBmb3IgZmlsZSB1cGxvYWRzLlxuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGluc3RhbGxhdGlvbkZyb21aaXAuJHByb2dyZXNzQmFyLmhpZGUoKTtcbiAgICAgICAgUGJ4QXBpLlN5c3RlbVVwbG9hZEZpbGVBdHRhY2hUb0J0bignYWRkLW5ldy1idXR0b24nLCBbJ3ppcCddLCBpbnN0YWxsYXRpb25Gcm9tWmlwLmNiUmVzdW1hYmxlVXBsb2FkRmlsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIHZhcmlvdXMgc3RhZ2VzIG9mIHRoZSBmaWxlIHVwbG9hZCBwcm9jZXNzLCBpbmNsdWRpbmcgc3RhcnRpbmcgdGhlIHVwbG9hZCxcbiAgICAgKiB0cmFja2luZyBwcm9ncmVzcywgYW5kIGhhbmRsaW5nIHN1Y2Nlc3Mgb3IgZXJyb3IgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiAtIFRoZSBjdXJyZW50IGFjdGlvbiBvciBzdGFnZSBvZiB0aGUgZmlsZSB1cGxvYWQgcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIC0gQWRkaXRpb25hbCBwYXJhbWV0ZXJzIHJlbGF0ZWQgdG8gdGhlIGN1cnJlbnQgdXBsb2FkIGFjdGlvbixcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjaCBhcyBwcm9ncmVzcyBwZXJjZW50YWdlIG9yIHJlc3BvbnNlIGRhdGEgb24gY29tcGxldGlvbi5cbiAgICAgKi9cbiAgICBjYlJlc3VtYWJsZVVwbG9hZEZpbGUoYWN0aW9uLCBwYXJhbXMpIHtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGVTdWNjZXNzJzpcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLmNoZWNrU3RhdHVzRmlsZU1lcmdpbmcocGFyYW1zLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3VwbG9hZFN0YXJ0JzpcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLnVwbG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGluc3RhbGxhdGlvbkZyb21aaXAuJHVwbG9hZEJ1dHRvbi5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgIGluc3RhbGxhdGlvbkZyb21aaXAuJHByb2dyZXNzQmFyLnNob3coKTtcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0JhckJsb2NrLnNob3coKTtcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0JhckxhYmVsLnRleHQoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRJblByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Byb2dyZXNzJzpcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0Jhci5wcm9ncmVzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnQ6IE1hdGgubWF4KE1hdGgucm91bmQocGFyc2VJbnQocGFyYW1zLnBlcmNlbnQsIDEwKS8yKS0yLCAxKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0JhckxhYmVsLnRleHQoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRFcnJvcik7XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC4kdXBsb2FkQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgVXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKGdsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkRXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgdGhlIHN0YXR1cyBvZiB0aGUgZmlsZSBtZXJnaW5nIHByb2Nlc3Mgb24gdGhlIHNlcnZlciBhZnRlciBhIHN1Y2Nlc3NmdWwgdXBsb2FkLlxuICAgICAqIFRoaXMgc3RlcCBpcyBuZWNlc3NhcnkgdG8gZW5zdXJlIHRoYXQgdGhlIHVwbG9hZGVkIFpJUCBmaWxlIGlzIHByb3Blcmx5IHByb2Nlc3NlZFxuICAgICAqIGFuZCByZWFkeSBmb3IgaW5zdGFsbGF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlc3BvbnNlIC0gVGhlIHNlcnZlcidzIHJlc3BvbnNlIGZyb20gdGhlIGZpbGUgdXBsb2FkIHByb2Nlc3MsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmluZyBpbmZvcm1hdGlvbiBuZWNlc3NhcnkgdG8gcHJvY2VlZCB3aXRoIHRoZSBpbnN0YWxsYXRpb24uXG4gICAgICovXG4gICAgY2hlY2tTdGF0dXNGaWxlTWVyZ2luZyhyZXNwb25zZSkge1xuICAgICAgICBpZiAocmVzcG9uc2UgPT09IHVuZGVmaW5lZCB8fCBQYnhBcGkudHJ5UGFyc2VKU09OKHJlc3BvbnNlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhgJHtnbG9iYWxUcmFuc2xhdGUuZXh0X1VwbG9hZEVycm9yfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgaWYgKGpzb24gPT09IHVuZGVmaW5lZCB8fCBqc29uLmRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgVXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKGAke2dsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkRXJyb3J9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgZmlsZUlkOiBqc29uLmRhdGEudXBsb2FkX2lkLFxuICAgICAgICAgICAgZmlsZVBhdGg6IGpzb24uZGF0YS5maWxlbmFtZSxcbiAgICAgICAgICAgIGNoYW5uZWxJZDogaW5zdGFsbGF0aW9uRnJvbVppcC5jaGFubmVsSWRcbiAgICAgICAgfTtcbiAgICAgICAgUGJ4QXBpLk1vZHVsZXNJbnN0YWxsRnJvbVBhY2thZ2UocGFyYW1zLCAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5yZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogaW5zdGFsbGF0aW9uRnJvbVppcC4kcHJvZ3Jlc3NCYXJCbG9jay5vZmZzZXQoKS50b3AsXG4gICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbn07XG5cbi8vIEluaXRpYWxpemVzIHRoZSBpbnN0YWxsYXRpb25Gcm9tWmlwIG1vZHVsZSB3aGVuIHRoZSBET00gaXMgZnVsbHkgbG9hZGVkLFxuLy8gYWxsb3dpbmcgdXNlcnMgdG8gdXBsb2FkIGFuZCBpbnN0YWxsIGV4dGVuc2lvbnMgZnJvbSBaSVAgZmlsZXMuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgaW5zdGFsbGF0aW9uRnJvbVppcC5pbml0aWFsaXplKCk7XG59KTtcbiJdfQ==