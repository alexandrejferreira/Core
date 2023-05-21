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

/* global globalRootUrl, globalTranslate */

/**
 * The Form object is responsible for sending forms data to backend
 *
 * @module Form
 */
var Form = {
  /**
   * jQuery object for the form.
   * @type {jQuery}
   */
  $formObj: '',

  /**
   * Validation rules for the form fields before submission.
   *
   * @type {object}
   */
  validateRules: {},
  url: '',
  cbBeforeSendForm: '',
  cbAfterSendForm: '',
  $submitButton: $('#submitbutton'),
  $dropdownSubmit: $('#dropdownSubmit'),
  $submitModeInput: $('input[name="submitMode"]'),
  processData: true,
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  keyboardShortcuts: true,
  enableDirrity: true,
  afterSubmitIndexUrl: '',
  afterSubmitModifyUrl: '',
  oldFormValues: [],
  initialize: function initialize() {
    // Set up custom form validation rules
    Form.$formObj.form.settings.rules.notRegExp = Form.notRegExpValidateRule;
    Form.$formObj.form.settings.rules.specialCharactersExist = Form.specialCharactersExistValidateRule;

    if (Form.enableDirrity) {
      // Initialize dirrity if enabled
      Form.initializeDirrity();
    } // Handle click event on submit button


    Form.$submitButton.on('click', function (e) {
      e.preventDefault();
      if (Form.$submitButton.hasClass('loading')) return;
      if (Form.$submitButton.hasClass('disabled')) return; // Set up form validation and submit

      Form.$formObj.form({
        on: 'blur',
        fields: Form.validateRules,
        onSuccess: function onSuccess() {
          // Call submitForm() on successful validation
          Form.submitForm();
        },
        onFailure: function onFailure() {
          // Add error class to form on validation failure
          Form.$formObj.removeClass('error').addClass('error');
        }
      });
      Form.$formObj.form('validate form');
    }); // Handle dropdown submit

    if (Form.$dropdownSubmit.length > 0) {
      Form.$dropdownSubmit.dropdown({
        onChange: function onChange(value) {
          var translateKey = "bt_".concat(value);
          Form.$submitModeInput.val(value);
          Form.$submitButton.html("<i class=\"save icon\"></i> ".concat(globalTranslate[translateKey])).click();
        }
      });
    } // Prevent form submission on enter keypress


    Form.$formObj.on('submit', function (e) {
      e.preventDefault();
    });
  },

  /**
   * Initializes tracking of form changes.
   */
  initializeDirrity: function initializeDirrity() {
    Form.saveInitialValues();
    Form.setEvents();
    Form.$submitButton.addClass('disabled');
    Form.$dropdownSubmit.addClass('disabled');
  },

  /**
   * Saves the initial form values for comparison.
   */
  saveInitialValues: function saveInitialValues() {
    Form.oldFormValues = Form.$formObj.form('get values');
  },

  /**
   * Sets up event handlers for form objects.
   */
  setEvents: function setEvents() {
    Form.$formObj.find('input, select').change(function () {
      Form.checkValues();
    });
    Form.$formObj.find('input, textarea').on('keyup keydown blur', function () {
      Form.checkValues();
    });
    Form.$formObj.find('.ui.checkbox').on('click', function () {
      Form.checkValues();
    });
  },

  /**
   * Compares the old and new form values for changes.
   */
  checkValues: function checkValues() {
    var newFormValues = Form.$formObj.form('get values');

    if (JSON.stringify(Form.oldFormValues) === JSON.stringify(newFormValues)) {
      Form.$submitButton.addClass('disabled');
      Form.$dropdownSubmit.addClass('disabled');
    } else {
      Form.$submitButton.removeClass('disabled');
      Form.$dropdownSubmit.removeClass('disabled');
    }
  },

  /**
   * Submits the form to the server.
   */
  submitForm: function submitForm() {
    $.api({
      url: Form.url,
      on: 'now',
      method: 'POST',
      processData: Form.processData,
      contentType: Form.contentType,
      keyboardShortcuts: Form.keyboardShortcuts,

      /**
       * Executes before sending the request.
       * @param {object} settings - The API settings object.
       * @returns {object} - The modified API settings object.
       */
      beforeSend: function beforeSend(settings) {
        // Add 'loading' class to the submit button
        Form.$submitButton.addClass('loading'); // Call cbBeforeSendForm function and handle the result

        var cbBeforeSendResult = Form.cbBeforeSendForm(settings);

        if (cbBeforeSendResult === false) {
          // If cbBeforeSendForm returns false, remove 'loading' class and perform a 'shake' transition on the submit button
          Form.$submitButton.transition('shake').removeClass('loading');
        } else {
          // Iterate over cbBeforeSendResult data, trim string values, and exclude sensitive information from being modified
          $.each(cbBeforeSendResult.data, function (index, value) {
            if (index.indexOf('ecret') > -1 || index.indexOf('assword') > -1) return;
            if (typeof value === 'string') cbBeforeSendResult.data[index] = value.trim();
          });
        }

        return cbBeforeSendResult;
      },

      /**
       * Executes when the request is successful.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        // Remove any existing AJAX messages
        $('.ui.message.ajax').remove(); // Iterate over response message and handle errors

        $.each(response.message, function (index, value) {
          if (index === 'error') {
            // If there is an error, perform a 'shake' transition on the submit button and add an error message after the form
            Form.$submitButton.transition('shake').removeClass('loading');
            Form.$formObj.after("<div class=\"ui ".concat(index, " message ajax\">").concat(value, "</div>"));
          }
        }); // Dispatch 'ConfigDataChanged' event

        var event = document.createEvent('Event');
        event.initEvent('ConfigDataChanged', false, true);
        window.dispatchEvent(event); // Call cbAfterSendForm function

        Form.cbAfterSendForm(response); // Check response conditions and perform necessary actions

        if (response.success && response.reload.length > 0 && Form.$submitModeInput.val() === 'SaveSettings') {
          // Redirect to the specified URL if conditions are met
          window.location = globalRootUrl + response.reload;
        } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndAddNew') {
          // Handle SaveSettingsAndAddNew scenario
          if (Form.afterSubmitModifyUrl.length > 1) {
            window.location = Form.afterSubmitModifyUrl;
          } else {
            var emptyUrl = window.location.href.split('modify');
            var action = 'modify';
            var prefixData = emptyUrl[1].split('/');

            if (prefixData.length > 0) {
              action = action + prefixData[0];
            }

            if (emptyUrl.length > 1) {
              window.location = "".concat(emptyUrl[0]).concat(action, "/");
            }
          }
        } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndExit') {
          // Handle SaveSettingsAndExit scenario
          if (Form.afterSubmitIndexUrl.length > 1) {
            window.location = Form.afterSubmitIndexUrl;
          } else {
            var _emptyUrl = window.location.href.split('modify');

            if (_emptyUrl.length > 1) {
              window.location = "".concat(_emptyUrl[0], "index/");
            }
          }
        } else if (response.success && response.reload.length > 0) {
          // Redirect to the specified URL if conditions are met
          window.location = globalRootUrl + response.reload;
        } else if (response.success && Form.enableDirrity) {
          // Initialize dirrity if conditions are met
          Form.initializeDirrity();
        } // Remove 'loading' class from the submit button


        Form.$submitButton.removeClass('loading');
      },

      /**
       * Executes when the request fails.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        // Add the response message after the form and perform a 'shake' transition on the submit button
        Form.$formObj.after(response);
        Form.$submitButton.transition('shake').removeClass('loading');
      }
    });
  },

  /**
   * Checks if the value does not match the regex pattern.
   * @param {string} value - The value to validate.
   * @param {RegExp} regex - The regex pattern to match against.
   * @returns {boolean} - True if the value does not match the regex, false otherwise.
   */
  notRegExpValidateRule: function notRegExpValidateRule(value, regex) {
    return value.match(regex) !== null;
  },

  /**
   * Checks if the value contains special characters.
   * @param {string} value - The value to validate.
   * @returns {boolean} - True if the value contains special characters, false otherwise.
   */
  specialCharactersExistValidateRule: function specialCharactersExistValidateRule(value) {
    return value.match(/[()$^;#"><,.%№@!+=_]/) === null;
  }
}; // export default Form;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2Zvcm0uanMiXSwibmFtZXMiOlsiRm9ybSIsIiRmb3JtT2JqIiwidmFsaWRhdGVSdWxlcyIsInVybCIsImNiQmVmb3JlU2VuZEZvcm0iLCJjYkFmdGVyU2VuZEZvcm0iLCIkc3VibWl0QnV0dG9uIiwiJCIsIiRkcm9wZG93blN1Ym1pdCIsIiRzdWJtaXRNb2RlSW5wdXQiLCJwcm9jZXNzRGF0YSIsImNvbnRlbnRUeXBlIiwia2V5Ym9hcmRTaG9ydGN1dHMiLCJlbmFibGVEaXJyaXR5IiwiYWZ0ZXJTdWJtaXRJbmRleFVybCIsImFmdGVyU3VibWl0TW9kaWZ5VXJsIiwib2xkRm9ybVZhbHVlcyIsImluaXRpYWxpemUiLCJmb3JtIiwic2V0dGluZ3MiLCJydWxlcyIsIm5vdFJlZ0V4cCIsIm5vdFJlZ0V4cFZhbGlkYXRlUnVsZSIsInNwZWNpYWxDaGFyYWN0ZXJzRXhpc3QiLCJzcGVjaWFsQ2hhcmFjdGVyc0V4aXN0VmFsaWRhdGVSdWxlIiwiaW5pdGlhbGl6ZURpcnJpdHkiLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImhhc0NsYXNzIiwiZmllbGRzIiwib25TdWNjZXNzIiwic3VibWl0Rm9ybSIsIm9uRmFpbHVyZSIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJsZW5ndGgiLCJkcm9wZG93biIsIm9uQ2hhbmdlIiwidmFsdWUiLCJ0cmFuc2xhdGVLZXkiLCJ2YWwiLCJodG1sIiwiZ2xvYmFsVHJhbnNsYXRlIiwiY2xpY2siLCJzYXZlSW5pdGlhbFZhbHVlcyIsInNldEV2ZW50cyIsImZpbmQiLCJjaGFuZ2UiLCJjaGVja1ZhbHVlcyIsIm5ld0Zvcm1WYWx1ZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiYXBpIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsImNiQmVmb3JlU2VuZFJlc3VsdCIsInRyYW5zaXRpb24iLCJlYWNoIiwiZGF0YSIsImluZGV4IiwiaW5kZXhPZiIsInRyaW0iLCJyZXNwb25zZSIsInJlbW92ZSIsIm1lc3NhZ2UiLCJhZnRlciIsImV2ZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsIndpbmRvdyIsImRpc3BhdGNoRXZlbnQiLCJzdWNjZXNzIiwicmVsb2FkIiwibG9jYXRpb24iLCJnbG9iYWxSb290VXJsIiwiZW1wdHlVcmwiLCJocmVmIiwic3BsaXQiLCJhY3Rpb24iLCJwcmVmaXhEYXRhIiwicmVnZXgiLCJtYXRjaCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxJQUFJLEdBQUc7QUFFVDtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxRQUFRLEVBQUUsRUFORDs7QUFRVDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLGFBQWEsRUFBRSxFQWJOO0FBZVRDLEVBQUFBLEdBQUcsRUFBRSxFQWZJO0FBZ0JUQyxFQUFBQSxnQkFBZ0IsRUFBRSxFQWhCVDtBQWlCVEMsRUFBQUEsZUFBZSxFQUFFLEVBakJSO0FBa0JUQyxFQUFBQSxhQUFhLEVBQUVDLENBQUMsQ0FBQyxlQUFELENBbEJQO0FBbUJUQyxFQUFBQSxlQUFlLEVBQUVELENBQUMsQ0FBQyxpQkFBRCxDQW5CVDtBQW9CVEUsRUFBQUEsZ0JBQWdCLEVBQUVGLENBQUMsQ0FBQywwQkFBRCxDQXBCVjtBQXFCVEcsRUFBQUEsV0FBVyxFQUFFLElBckJKO0FBc0JUQyxFQUFBQSxXQUFXLEVBQUUsa0RBdEJKO0FBdUJUQyxFQUFBQSxpQkFBaUIsRUFBRSxJQXZCVjtBQXdCVEMsRUFBQUEsYUFBYSxFQUFFLElBeEJOO0FBeUJUQyxFQUFBQSxtQkFBbUIsRUFBRSxFQXpCWjtBQTBCVEMsRUFBQUEsb0JBQW9CLEVBQUUsRUExQmI7QUEyQlRDLEVBQUFBLGFBQWEsRUFBRSxFQTNCTjtBQTRCVEMsRUFBQUEsVUE1QlMs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QTVQcEIsRUE0UDJCO0FBQ2hDLFdBQU8zQyxLQUFLLENBQUM0QyxLQUFOLENBQVlELEtBQVosTUFBdUIsSUFBOUI7QUFDSCxHQTlQUTs7QUFnUVQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJMUQsRUFBQUEsa0NBclFTLDhDQXFRMEJlLEtBclExQixFQXFRaUM7QUFDdEMsV0FBT0EsS0FBSyxDQUFDNEMsS0FBTixDQUFZLHNCQUFaLE1BQXdDLElBQS9DO0FBQ0g7QUF2UVEsQ0FBYixDLENBMFFBIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSAqL1xuXG4vKipcbiAqIFRoZSBGb3JtIG9iamVjdCBpcyByZXNwb25zaWJsZSBmb3Igc2VuZGluZyBmb3JtcyBkYXRhIHRvIGJhY2tlbmRcbiAqXG4gKiBAbW9kdWxlIEZvcm1cbiAqL1xuY29uc3QgRm9ybSA9IHtcblxuICAgIC8qKlxuICAgICAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBmb3JtLlxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJGZvcm1PYmo6ICcnLFxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzIGJlZm9yZSBzdWJtaXNzaW9uLlxuICAgICAqXG4gICAgICogQHR5cGUge29iamVjdH1cbiAgICAgKi9cbiAgICB2YWxpZGF0ZVJ1bGVzOiB7fSxcblxuICAgIHVybDogJycsXG4gICAgY2JCZWZvcmVTZW5kRm9ybTogJycsXG4gICAgY2JBZnRlclNlbmRGb3JtOiAnJyxcbiAgICAkc3VibWl0QnV0dG9uOiAkKCcjc3VibWl0YnV0dG9uJyksXG4gICAgJGRyb3Bkb3duU3VibWl0OiAkKCcjZHJvcGRvd25TdWJtaXQnKSxcbiAgICAkc3VibWl0TW9kZUlucHV0OiAkKCdpbnB1dFtuYW1lPVwic3VibWl0TW9kZVwiXScpLFxuICAgIHByb2Nlc3NEYXRhOiB0cnVlLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04JyxcbiAgICBrZXlib2FyZFNob3J0Y3V0czogdHJ1ZSxcbiAgICBlbmFibGVEaXJyaXR5OiB0cnVlLFxuICAgIGFmdGVyU3VibWl0SW5kZXhVcmw6ICcnLFxuICAgIGFmdGVyU3VibWl0TW9kaWZ5VXJsOiAnJyxcbiAgICBvbGRGb3JtVmFsdWVzOiBbXSxcbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICAvLyBTZXQgdXAgY3VzdG9tIGZvcm0gdmFsaWRhdGlvbiBydWxlc1xuICAgICAgICBGb3JtLiRmb3JtT2JqLmZvcm0uc2V0dGluZ3MucnVsZXMubm90UmVnRXhwID0gRm9ybS5ub3RSZWdFeHBWYWxpZGF0ZVJ1bGU7XG4gICAgICAgIEZvcm0uJGZvcm1PYmouZm9ybS5zZXR0aW5ncy5ydWxlcy5zcGVjaWFsQ2hhcmFjdGVyc0V4aXN0ID0gRm9ybS5zcGVjaWFsQ2hhcmFjdGVyc0V4aXN0VmFsaWRhdGVSdWxlO1xuXG4gICAgICAgIGlmIChGb3JtLmVuYWJsZURpcnJpdHkpIHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgZGlycml0eSBpZiBlbmFibGVkXG4gICAgICAgICAgICBGb3JtLmluaXRpYWxpemVEaXJyaXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgY2xpY2sgZXZlbnQgb24gc3VibWl0IGJ1dHRvblxuICAgICAgICBGb3JtLiRzdWJtaXRCdXR0b24ub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmIChGb3JtLiRzdWJtaXRCdXR0b24uaGFzQ2xhc3MoJ2xvYWRpbmcnKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKEZvcm0uJHN1Ym1pdEJ1dHRvbi5oYXNDbGFzcygnZGlzYWJsZWQnKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBTZXQgdXAgZm9ybSB2YWxpZGF0aW9uIGFuZCBzdWJtaXRcbiAgICAgICAgICAgIEZvcm0uJGZvcm1PYmpcbiAgICAgICAgICAgICAgICAuZm9ybSh7XG4gICAgICAgICAgICAgICAgICAgIG9uOiAnYmx1cicsXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkczogRm9ybS52YWxpZGF0ZVJ1bGVzLFxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxsIHN1Ym1pdEZvcm0oKSBvbiBzdWNjZXNzZnVsIHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIEZvcm0uc3VibWl0Rm9ybSgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbkZhaWx1cmUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgZXJyb3IgY2xhc3MgdG8gZm9ybSBvbiB2YWxpZGF0aW9uIGZhaWx1cmVcbiAgICAgICAgICAgICAgICAgICAgICAgIEZvcm0uJGZvcm1PYmoucmVtb3ZlQ2xhc3MoJ2Vycm9yJykuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBGb3JtLiRmb3JtT2JqLmZvcm0oJ3ZhbGlkYXRlIGZvcm0nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSGFuZGxlIGRyb3Bkb3duIHN1Ym1pdFxuICAgICAgICBpZiAoRm9ybS4kZHJvcGRvd25TdWJtaXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgRm9ybS4kZHJvcGRvd25TdWJtaXQuZHJvcGRvd24oe1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlS2V5ID0gYGJ0XyR7dmFsdWV9YDtcbiAgICAgICAgICAgICAgICAgICAgRm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIEZvcm0uJHN1Ym1pdEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwoYDxpIGNsYXNzPVwic2F2ZSBpY29uXCI+PC9pPiAke2dsb2JhbFRyYW5zbGF0ZVt0cmFuc2xhdGVLZXldfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmV2ZW50IGZvcm0gc3VibWlzc2lvbiBvbiBlbnRlciBrZXlwcmVzc1xuICAgICAgICBGb3JtLiRmb3JtT2JqLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdHJhY2tpbmcgb2YgZm9ybSBjaGFuZ2VzLlxuICAgICAqL1xuICAgIGluaXRpYWxpemVEaXJyaXR5KCkge1xuICAgICAgICBGb3JtLnNhdmVJbml0aWFsVmFsdWVzKCk7XG4gICAgICAgIEZvcm0uc2V0RXZlbnRzKCk7XG4gICAgICAgIEZvcm0uJHN1Ym1pdEJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgRm9ybS4kZHJvcGRvd25TdWJtaXQuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmVzIHRoZSBpbml0aWFsIGZvcm0gdmFsdWVzIGZvciBjb21wYXJpc29uLlxuICAgICAqL1xuICAgIHNhdmVJbml0aWFsVmFsdWVzKCkge1xuICAgICAgICBGb3JtLm9sZEZvcm1WYWx1ZXMgPSBGb3JtLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBldmVudCBoYW5kbGVycyBmb3IgZm9ybSBvYmplY3RzLlxuICAgICAqL1xuICAgIHNldEV2ZW50cygpIHtcbiAgICAgICAgRm9ybS4kZm9ybU9iai5maW5kKCdpbnB1dCwgc2VsZWN0JykuY2hhbmdlKCgpID0+IHtcbiAgICAgICAgICAgIEZvcm0uY2hlY2tWYWx1ZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIEZvcm0uJGZvcm1PYmouZmluZCgnaW5wdXQsIHRleHRhcmVhJykub24oJ2tleXVwIGtleWRvd24gYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgIEZvcm0uY2hlY2tWYWx1ZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIEZvcm0uJGZvcm1PYmouZmluZCgnLnVpLmNoZWNrYm94Jykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgRm9ybS5jaGVja1ZhbHVlcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdGhlIG9sZCBhbmQgbmV3IGZvcm0gdmFsdWVzIGZvciBjaGFuZ2VzLlxuICAgICAqL1xuICAgIGNoZWNrVmFsdWVzKCkge1xuICAgICAgICBjb25zdCBuZXdGb3JtVmFsdWVzID0gRm9ybS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG4gICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShGb3JtLm9sZEZvcm1WYWx1ZXMpID09PSBKU09OLnN0cmluZ2lmeShuZXdGb3JtVmFsdWVzKSkge1xuICAgICAgICAgICAgRm9ybS4kc3VibWl0QnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgRm9ybS4kZHJvcGRvd25TdWJtaXQuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBGb3JtLiRzdWJtaXRCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBGb3JtLiRkcm9wZG93blN1Ym1pdC5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJtaXRzIHRoZSBmb3JtIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICovXG4gICAgc3VibWl0Rm9ybSgpIHtcbiAgICAgICAgJC5hcGkoe1xuICAgICAgICAgICAgdXJsOiBGb3JtLnVybCxcbiAgICAgICAgICAgIG9uOiAnbm93JyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IEZvcm0ucHJvY2Vzc0RhdGEsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogRm9ybS5jb250ZW50VHlwZSxcbiAgICAgICAgICAgIGtleWJvYXJkU2hvcnRjdXRzOiBGb3JtLmtleWJvYXJkU2hvcnRjdXRzLFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV4ZWN1dGVzIGJlZm9yZSBzZW5kaW5nIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIEFQSSBzZXR0aW5ncyBvYmplY3QuXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBBUEkgc2V0dGluZ3Mgb2JqZWN0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkICdsb2FkaW5nJyBjbGFzcyB0byB0aGUgc3VibWl0IGJ1dHRvblxuICAgICAgICAgICAgICAgIEZvcm0uJHN1Ym1pdEJ1dHRvbi5hZGRDbGFzcygnbG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsbCBjYkJlZm9yZVNlbmRGb3JtIGZ1bmN0aW9uIGFuZCBoYW5kbGUgdGhlIHJlc3VsdFxuICAgICAgICAgICAgICAgIGNvbnN0IGNiQmVmb3JlU2VuZFJlc3VsdCA9IEZvcm0uY2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgaWYgKGNiQmVmb3JlU2VuZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgY2JCZWZvcmVTZW5kRm9ybSByZXR1cm5zIGZhbHNlLCByZW1vdmUgJ2xvYWRpbmcnIGNsYXNzIGFuZCBwZXJmb3JtIGEgJ3NoYWtlJyB0cmFuc2l0aW9uIG9uIHRoZSBzdWJtaXQgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIEZvcm0uJHN1Ym1pdEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oJ3NoYWtlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBjYkJlZm9yZVNlbmRSZXN1bHQgZGF0YSwgdHJpbSBzdHJpbmcgdmFsdWVzLCBhbmQgZXhjbHVkZSBzZW5zaXRpdmUgaW5mb3JtYXRpb24gZnJvbSBiZWluZyBtb2RpZmllZFxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goY2JCZWZvcmVTZW5kUmVzdWx0LmRhdGEsIChpbmRleCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleC5pbmRleE9mKCdlY3JldCcpID4gLTEgfHwgaW5kZXguaW5kZXhPZignYXNzd29yZCcpID4gLTEpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSBjYkJlZm9yZVNlbmRSZXN1bHQuZGF0YVtpbmRleF0gPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2JCZWZvcmVTZW5kUmVzdWx0O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFeGVjdXRlcyB3aGVuIHRoZSByZXF1ZXN0IGlzIHN1Y2Nlc3NmdWwuXG4gICAgICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBvblN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYW55IGV4aXN0aW5nIEFKQVggbWVzc2FnZXNcbiAgICAgICAgICAgICAgICAkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJdGVyYXRlIG92ZXIgcmVzcG9uc2UgbWVzc2FnZSBhbmQgaGFuZGxlIGVycm9yc1xuICAgICAgICAgICAgICAgICQuZWFjaChyZXNwb25zZS5tZXNzYWdlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gZXJyb3IsIHBlcmZvcm0gYSAnc2hha2UnIHRyYW5zaXRpb24gb24gdGhlIHN1Ym1pdCBidXR0b24gYW5kIGFkZCBhbiBlcnJvciBtZXNzYWdlIGFmdGVyIHRoZSBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAgICBGb3JtLiRzdWJtaXRCdXR0b24udHJhbnNpdGlvbignc2hha2UnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgRm9ybS4kZm9ybU9iai5hZnRlcihgPGRpdiBjbGFzcz1cInVpICR7aW5kZXh9IG1lc3NhZ2UgYWpheFwiPiR7dmFsdWV9PC9kaXY+YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBEaXNwYXRjaCAnQ29uZmlnRGF0YUNoYW5nZWQnIGV2ZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgICAgICAgICBldmVudC5pbml0RXZlbnQoJ0NvbmZpZ0RhdGFDaGFuZ2VkJywgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGwgY2JBZnRlclNlbmRGb3JtIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgRm9ybS5jYkFmdGVyU2VuZEZvcm0ocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgcmVzcG9uc2UgY29uZGl0aW9ucyBhbmQgcGVyZm9ybSBuZWNlc3NhcnkgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgICYmIHJlc3BvbnNlLnJlbG9hZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICYmIEZvcm0uJHN1Ym1pdE1vZGVJbnB1dC52YWwoKSA9PT0gJ1NhdmVTZXR0aW5ncycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIHNwZWNpZmllZCBVUkwgaWYgY29uZGl0aW9ucyBhcmUgbWV0XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGdsb2JhbFJvb3RVcmwgKyByZXNwb25zZS5yZWxvYWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIEZvcm0uJHN1Ym1pdE1vZGVJbnB1dC52YWwoKSA9PT0gJ1NhdmVTZXR0aW5nc0FuZEFkZE5ldycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIFNhdmVTZXR0aW5nc0FuZEFkZE5ldyBzY2VuYXJpb1xuICAgICAgICAgICAgICAgICAgICBpZiAoRm9ybS5hZnRlclN1Ym1pdE1vZGlmeVVybC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBGb3JtLmFmdGVyU3VibWl0TW9kaWZ5VXJsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1wdHlVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnbW9kaWZ5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aW9uID0gJ21vZGlmeSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJlZml4RGF0YSA9IGVtcHR5VXJsWzFdLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJlZml4RGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gYWN0aW9uICsgcHJlZml4RGF0YVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbXB0eVVybC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7ZW1wdHlVcmxbMF19JHthY3Rpb259L2A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgRm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCgpID09PSAnU2F2ZVNldHRpbmdzQW5kRXhpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIFNhdmVTZXR0aW5nc0FuZEV4aXQgc2NlbmFyaW9cbiAgICAgICAgICAgICAgICAgICAgaWYgKEZvcm0uYWZ0ZXJTdWJtaXRJbmRleFVybC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBGb3JtLmFmdGVyU3VibWl0SW5kZXhVcmw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbXB0eVVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCdtb2RpZnknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbXB0eVVybC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7ZW1wdHlVcmxbMF19aW5kZXgvYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5yZWxvYWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgc3BlY2lmaWVkIFVSTCBpZiBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZ2xvYmFsUm9vdFVybCArIHJlc3BvbnNlLnJlbG9hZDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgRm9ybS5lbmFibGVEaXJyaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgZGlycml0eSBpZiBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgICAgICAgICAgRm9ybS5pbml0aWFsaXplRGlycml0eSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSAnbG9hZGluZycgY2xhc3MgZnJvbSB0aGUgc3VibWl0IGJ1dHRvblxuICAgICAgICAgICAgICAgIEZvcm0uJHN1Ym1pdEJ1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFeGVjdXRlcyB3aGVuIHRoZSByZXF1ZXN0IGZhaWxzLlxuICAgICAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgb25GYWlsdXJlKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSByZXNwb25zZSBtZXNzYWdlIGFmdGVyIHRoZSBmb3JtIGFuZCBwZXJmb3JtIGEgJ3NoYWtlJyB0cmFuc2l0aW9uIG9uIHRoZSBzdWJtaXQgYnV0dG9uXG4gICAgICAgICAgICAgICAgRm9ybS4kZm9ybU9iai5hZnRlcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgRm9ybS4kc3VibWl0QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIC50cmFuc2l0aW9uKCdzaGFrZScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSB2YWx1ZSBkb2VzIG5vdCBtYXRjaCB0aGUgcmVnZXggcGF0dGVybi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgLSBUaGUgdmFsdWUgdG8gdmFsaWRhdGUuXG4gICAgICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4IC0gVGhlIHJlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggYWdhaW5zdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBUcnVlIGlmIHRoZSB2YWx1ZSBkb2VzIG5vdCBtYXRjaCB0aGUgcmVnZXgsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBub3RSZWdFeHBWYWxpZGF0ZVJ1bGUodmFsdWUsIHJlZ2V4KSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXRjaChyZWdleCkgIT09IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgdmFsdWUgY29udGFpbnMgc3BlY2lhbCBjaGFyYWN0ZXJzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byB2YWxpZGF0ZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBUcnVlIGlmIHRoZSB2YWx1ZSBjb250YWlucyBzcGVjaWFsIGNoYXJhY3RlcnMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzcGVjaWFsQ2hhcmFjdGVyc0V4aXN0VmFsaWRhdGVSdWxlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXRjaCgvWygpJF47I1wiPjwsLiXihJZAISs9X10vKSA9PT0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyBleHBvcnQgZGVmYXVsdCBGb3JtO1xuIl19