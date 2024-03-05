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
          percent: parseInt(params.percent, 10)
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
      if (response.result === true) {
        installStatusLoopWorker.initialize();
      }
    });
  }
}; // Initializes the installationFromZip module when the DOM is fully loaded,
// allowing users to upload and install extensions from ZIP files.

$(document).ready(function () {
  installationFromZip.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLWluc3RhbGwtZnJvbS16aXAuanMiXSwibmFtZXMiOlsiaW5zdGFsbGF0aW9uRnJvbVppcCIsIiR1cGxvYWRCdXR0b24iLCIkIiwiJHByb2dyZXNzQmFyQmxvY2siLCIkcHJvZ3Jlc3NCYXIiLCIkcHJvZ3Jlc3NCYXJMYWJlbCIsInVwbG9hZEluUHJvZ3Jlc3MiLCJjaGFubmVsSWQiLCJpbml0aWFsaXplIiwiaGlkZSIsIlBieEFwaSIsIlN5c3RlbVVwbG9hZEZpbGVBdHRhY2hUb0J0biIsImNiUmVzdW1hYmxlVXBsb2FkRmlsZSIsImFjdGlvbiIsInBhcmFtcyIsImNoZWNrU3RhdHVzRmlsZU1lcmdpbmciLCJyZXNwb25zZSIsImFkZENsYXNzIiwic2hvdyIsInRleHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJleHRfVXBsb2FkSW5Qcm9ncmVzcyIsInByb2dyZXNzIiwicGVyY2VudCIsInBhcnNlSW50IiwiZXh0X1VwbG9hZEVycm9yIiwicmVtb3ZlQ2xhc3MiLCJVc2VyTWVzc2FnZSIsInNob3dNdWx0aVN0cmluZyIsInVuZGVmaW5lZCIsInRyeVBhcnNlSlNPTiIsImpzb24iLCJKU09OIiwicGFyc2UiLCJkYXRhIiwiZmlsZUlkIiwidXBsb2FkX2lkIiwiZmlsZVBhdGgiLCJmaWxlbmFtZSIsIk1vZHVsZXNJbnN0YWxsRnJvbVBhY2thZ2UiLCJyZXN1bHQiLCJpbnN0YWxsU3RhdHVzTG9vcFdvcmtlciIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxtQkFBbUIsR0FBRztBQUN4QjtBQUNKO0FBQ0E7QUFDQTtBQUNB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QUFaLFdBQStCUixlQUFlLENBQUNLLGVBQS9DO0FBQ0E7QUFDSDs7QUFDRCxRQUFNWCxNQUFNLEdBQUc7QUFDWHFCLE1BQUFBLE1BQU0sRUFBRUosSUFBSSxDQUFDRyxJQUFMLENBQVVFLFNBRFA7QUFFWEMsTUFBQUEsUUFBUSxFQUFFTixJQUFJLENBQUNHLElBQUwsQ0FBVUksUUFGVDtBQUdYL0IsTUFBQUEsU0FBUyxFQUFFUCxtQkFBbUIsQ0FBQ087QUFIcEIsS0FBZjtBQUtBRyxJQUFBQSxNQUFNLENBQUM2Qix5QkFBUCxDQUFpQ3pCLE1BQWpDLEVBQTBDLFVBQUNFLFFBQUQsRUFBYztBQUNwRCxVQUFJQSxRQUFRLENBQUN3QixNQUFULEtBQW9CLElBQXhCLEVBQThCO0FBQzFCQyxRQUFBQSx1QkFBdUIsQ0FBQ2pDLFVBQXhCO0FBQ0g7QUFDSixLQUpEO0FBS0g7QUFsSHVCLENBQTVCLEMsQ0FzSEE7QUFDQTs7QUFDQU4sQ0FBQyxDQUFDd0MsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUNwQjNDLEVBQUFBLG1CQUFtQixDQUFDUSxVQUFwQjtBQUNILENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgVXNlck1lc3NhZ2UsIGdsb2JhbFRyYW5zbGF0ZSwgUGJ4QXBpLCBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlciAqL1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHByb2Nlc3Mgb2YgaW5zdGFsbGluZyBuZXcgUEJYIGV4dGVuc2lvbnMgZnJvbSBhIFpJUCBmaWxlLlxuICogVGhpcyBpbmNsdWRlcyBtYW5hZ2luZyBmaWxlIHVwbG9hZHMsIGRpc3BsYXlpbmcgdXBsb2FkIHByb2dyZXNzLCBhbmQgaW5pdGlhdGluZyB0aGUgaW5zdGFsbGF0aW9uIHByb2Nlc3MuXG4gKlxuICogQG1vZHVsZSBhZGROZXdFeHRlbnNpb25cbiAqL1xuY29uc3QgaW5zdGFsbGF0aW9uRnJvbVppcCA9IHtcbiAgICAvKipcbiAgICAgKiBUaGUgalF1ZXJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHVwbG9hZCBidXR0b24gZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgICAqIFVzZXJzIGludGVyYWN0IHdpdGggdGhpcyBidXR0b24gdG8gc2VsZWN0IGFuZCB1cGxvYWQgWklQIGZpbGVzIGNvbnRhaW5pbmcgbmV3IGV4dGVuc2lvbnMuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkdXBsb2FkQnV0dG9uOiAkKCcjYWRkLW5ldy1idXR0b24nKSxcblxuXG4gICAgLyoqXG4gICAgICogVGhlIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBibG9jayBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHByb2dyZXNzIGJhci5cbiAgICAgKiBUaGlzIGVsZW1lbnQgaXMgc2hvd24gZHVyaW5nIHRoZSBmaWxlIHVwbG9hZCBwcm9jZXNzIHRvIHByb3ZpZGUgdmlzdWFsIGZlZWRiYWNrIHRvIHRoZSB1c2VyLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJHByb2dyZXNzQmFyQmxvY2s6ICQoJyN1cGxvYWQtcHJvZ3Jlc3MtYmFyLWJsb2NrJyksXG5cbiAgICAvKipcbiAgICAgKiBUaGUgalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGFjdHVhbCBwcm9ncmVzcyBiYXIgZWxlbWVudC5cbiAgICAgKiBJdCB2aXN1YWxseSByZXByZXNlbnRzIHRoZSBwcm9ncmVzcyBvZiB0aGUgZmlsZSB1cGxvYWQgb3BlcmF0aW9uIHRvIHRoZSB1c2VyLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJHByb2dyZXNzQmFyOiAkKCcjdXBsb2FkLXByb2dyZXNzLWJhcicpLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsYWJlbCBlbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvZ3Jlc3MgYmFyLlxuICAgICAqIFRoaXMgbGFiZWwgcHJvdmlkZXMgdGV4dHVhbCBmZWVkYmFjayBhYm91dCB0aGUgdXBsb2FkIHN0YXR1cyAoZS5nLiwgcGVyY2VudGFnZSBjb21wbGV0ZWQsIGVycm9ycykuXG4gICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgKi9cbiAgICAkcHJvZ3Jlc3NCYXJMYWJlbDogJCgnI3VwbG9hZC1wcm9ncmVzcy1iYXItbGFiZWwnKSxcblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBmaWxlIHVwbG9hZCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAgICogVGhpcyBoZWxwcyBtYW5hZ2UgdGhlIFVJIHN0YXRlIGFuZCBwcmV2ZW50IG11bHRpcGxlIGNvbmN1cnJlbnQgdXBsb2Fkcy5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB1cGxvYWRJblByb2dyZXNzOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBQVUIvU1VCIGNoYW5uZWwgdXNlZCB0byBtb25pdG9yIHRoZSBpbnN0YWxsYXRpb24gcHJvY2Vzcy5cbiAgICAgKiBUaGlzIGFsbG93cyB0aGUgc3lzdGVtIHRvIHJlY2VpdmUgdXBkYXRlcyBhYm91dCB0aGUgaW5zdGFsbGF0aW9uIHN0YXR1cy5cbiAgICAgKi9cbiAgICBjaGFubmVsSWQ6ICdpbnN0YWxsLW1vZHVsZScsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgaW5zdGFsbGF0aW9uRnJvbVppcCBtb2R1bGUgYnkgc2V0dGluZyB1cCB0aGUgbmVjZXNzYXJ5IFVJIGVsZW1lbnRzXG4gICAgICogYW5kIGF0dGFjaGluZyBldmVudCBsaXN0ZW5lcnMgZm9yIGZpbGUgdXBsb2Fkcy5cbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0Jhci5oaWRlKCk7XG4gICAgICAgIFBieEFwaS5TeXN0ZW1VcGxvYWRGaWxlQXR0YWNoVG9CdG4oJ2FkZC1uZXctYnV0dG9uJywgWyd6aXAnXSwgaW5zdGFsbGF0aW9uRnJvbVppcC5jYlJlc3VtYWJsZVVwbG9hZEZpbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHRoZSB2YXJpb3VzIHN0YWdlcyBvZiB0aGUgZmlsZSB1cGxvYWQgcHJvY2VzcywgaW5jbHVkaW5nIHN0YXJ0aW5nIHRoZSB1cGxvYWQsXG4gICAgICogdHJhY2tpbmcgcHJvZ3Jlc3MsIGFuZCBoYW5kbGluZyBzdWNjZXNzIG9yIGVycm9yIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gLSBUaGUgY3VycmVudCBhY3Rpb24gb3Igc3RhZ2Ugb2YgdGhlIGZpbGUgdXBsb2FkIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyAtIEFkZGl0aW9uYWwgcGFyYW1ldGVycyByZWxhdGVkIHRvIHRoZSBjdXJyZW50IHVwbG9hZCBhY3Rpb24sXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2ggYXMgcHJvZ3Jlc3MgcGVyY2VudGFnZSBvciByZXNwb25zZSBkYXRhIG9uIGNvbXBsZXRpb24uXG4gICAgICovXG4gICAgY2JSZXN1bWFibGVVcGxvYWRGaWxlKGFjdGlvbiwgcGFyYW1zKSB7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxlU3VjY2Vzcyc6XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC5jaGVja1N0YXR1c0ZpbGVNZXJnaW5nKHBhcmFtcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd1cGxvYWRTdGFydCc6XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC51cGxvYWRJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiR1cGxvYWRCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiRwcm9ncmVzc0Jhci5zaG93KCk7XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC4kcHJvZ3Jlc3NCYXJCbG9jay5zaG93KCk7XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC4kcHJvZ3Jlc3NCYXJMYWJlbC50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkSW5Qcm9ncmVzcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwcm9ncmVzcyc6XG4gICAgICAgICAgICAgICAgaW5zdGFsbGF0aW9uRnJvbVppcC4kcHJvZ3Jlc3NCYXIucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgICAgICBwZXJjZW50OiBwYXJzZUludChwYXJhbXMucGVyY2VudCwgMTApLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIGluc3RhbGxhdGlvbkZyb21aaXAuJHByb2dyZXNzQmFyTGFiZWwudGV4dChnbG9iYWxUcmFuc2xhdGUuZXh0X1VwbG9hZEVycm9yKTtcbiAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb25Gcm9tWmlwLiR1cGxvYWRCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICBVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRFcnJvcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0aGUgc3RhdHVzIG9mIHRoZSBmaWxlIG1lcmdpbmcgcHJvY2VzcyBvbiB0aGUgc2VydmVyIGFmdGVyIGEgc3VjY2Vzc2Z1bCB1cGxvYWQuXG4gICAgICogVGhpcyBzdGVwIGlzIG5lY2Vzc2FyeSB0byBlbnN1cmUgdGhhdCB0aGUgdXBsb2FkZWQgWklQIGZpbGUgaXMgcHJvcGVybHkgcHJvY2Vzc2VkXG4gICAgICogYW5kIHJlYWR5IGZvciBpbnN0YWxsYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2UgLSBUaGUgc2VydmVyJ3MgcmVzcG9uc2UgZnJvbSB0aGUgZmlsZSB1cGxvYWQgcHJvY2VzcyxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluaW5nIGluZm9ybWF0aW9uIG5lY2Vzc2FyeSB0byBwcm9jZWVkIHdpdGggdGhlIGluc3RhbGxhdGlvbi5cbiAgICAgKi9cbiAgICBjaGVja1N0YXR1c0ZpbGVNZXJnaW5nKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChyZXNwb25zZSA9PT0gdW5kZWZpbmVkIHx8IFBieEFwaS50cnlQYXJzZUpTT04ocmVzcG9uc2UpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgVXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKGAke2dsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkRXJyb3J9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICBpZiAoanNvbiA9PT0gdW5kZWZpbmVkIHx8IGpzb24uZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcoYCR7Z2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRFcnJvcn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBmaWxlSWQ6IGpzb24uZGF0YS51cGxvYWRfaWQsXG4gICAgICAgICAgICBmaWxlUGF0aDoganNvbi5kYXRhLmZpbGVuYW1lLFxuICAgICAgICAgICAgY2hhbm5lbElkOiBpbnN0YWxsYXRpb25Gcm9tWmlwLmNoYW5uZWxJZFxuICAgICAgICB9O1xuICAgICAgICBQYnhBcGkuTW9kdWxlc0luc3RhbGxGcm9tUGFja2FnZShwYXJhbXMsICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5yZXN1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YWxsU3RhdHVzTG9vcFdvcmtlci5pbml0aWFsaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbn07XG5cbi8vIEluaXRpYWxpemVzIHRoZSBpbnN0YWxsYXRpb25Gcm9tWmlwIG1vZHVsZSB3aGVuIHRoZSBET00gaXMgZnVsbHkgbG9hZGVkLFxuLy8gYWxsb3dpbmcgdXNlcnMgdG8gdXBsb2FkIGFuZCBpbnN0YWxsIGV4dGVuc2lvbnMgZnJvbSBaSVAgZmlsZXMuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgaW5zdGFsbGF0aW9uRnJvbVppcC5pbml0aWFsaXplKCk7XG59KTtcbiJdfQ==