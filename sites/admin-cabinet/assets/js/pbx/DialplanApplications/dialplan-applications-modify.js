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

/* global globalRootUrl,globalTranslate, ace, Form, Extensions */

/**
 * The DialplanApplication object.
 *  Manages the operations and behaviors of the Dialplan applications in the UI.
 *
 * @module DialplanApplication
 */
var dialplanApplication = {
  $number: $('#extension'),
  defaultExtension: '',

  /**
   * jQuery object for the form.
   * @type {jQuery}
   */
  $formObj: $('#dialplan-application-form'),
  $typeSelectDropDown: $('#dialplan-application-form .type-select'),

  /**
   * Dirty check field, for checking if something on the form was changed
   * @type {jQuery}
   */
  $dirrtyField: $('#dirrty'),
  $tabMenuItems: $('#application-code-menu .item'),
  // Ace editor instance
  editor: '',

  /**
   * Validation rules for the form fields before submission.
   *
   * @type {object}
   */
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.da_ValidateNameIsEmpty
      }]
    },
    extension: {
      identifier: 'extension',
      rules: [{
        type: 'regExp',
        value: '/^(|[0-9#+\\*|X]{1,64})$/',
        prompt: globalTranslate.da_ValidateExtensionNumber
      }, {
        type: 'empty',
        prompt: globalTranslate.da_ValidateExtensionIsEmpty
      }, {
        type: 'existRule[extension-error]',
        prompt: globalTranslate.da_ValidateExtensionDouble
      }]
    }
  },

  /**
   * Initializes the DialplanApplication.
   * Sets up tabs, dropdowns, form and Ace editor.
   * Sets up change handlers for extension number and editor contents.
   */
  initialize: function initialize() {
    dialplanApplication.$tabMenuItems.tab();

    if (dialplanApplication.$formObj.form('get value', 'name').length === 0) {
      dialplanApplication.$tabMenuItems.tab('change tab', 'main');
    }

    dialplanApplication.$typeSelectDropDown.dropdown({
      onChange: dialplanApplication.changeAceMode
    }); // Add handler to dynamically check if the input number is available

    dialplanApplication.$number.on('change', function () {
      var newNumber = dialplanApplication.$formObj.form('get value', 'extension');
      Extensions.checkAvailability(dialplanApplication.defaultExtension, newNumber);
    }); // Initialize UI components

    dialplanApplication.initializeForm();
    dialplanApplication.initializeAce();
    dialplanApplication.changeAceMode();
    dialplanApplication.defaultExtension = dialplanApplication.$formObj.form('get value', 'extension');
  },

  /**
   * Initializes the Ace editor instance.
   * Sets up Ace editor with a monokai theme and custom options.
   * Attaches change handler to the editor session.
   */
  initializeAce: function initializeAce() {
    var applicationLogic = dialplanApplication.$formObj.form('get value', 'applicationlogic');
    var aceHeight = window.innerHeight - 380;
    var rowsCount = Math.round(aceHeight / 16.3);
    $(window).load(function () {
      $('.application-code').css('min-height', "".concat(aceHeight, "px"));
    });
    dialplanApplication.editor = ace.edit('application-code');
    dialplanApplication.editor.getSession().setValue(applicationLogic);
    dialplanApplication.editor.setTheme('ace/theme/monokai');
    dialplanApplication.editor.resize();
    dialplanApplication.editor.getSession().on('change', function () {
      // Change the value of '$dirrtyField' to trigger
      // the 'change' form event and enable submit button.
      dialplanApplication.$dirrtyField.val(Math.random());
      dialplanApplication.$dirrtyField.trigger('change');
    });
    dialplanApplication.editor.setOptions({
      maxLines: rowsCount,
      showPrintMargin: false,
      showLineNumbers: false
    });
  },

  /**
   * Changes the Ace editor mode and settings based on the 'type' form value.
   * If the 'type' is 'php', PHP mode is set, and line numbers are shown.
   * Otherwise, Julia mode is set, and line numbers are hidden.
   * The editor theme is set to Monokai in all cases.
   */
  changeAceMode: function changeAceMode() {
    // Retrieve 'type' value from the form
    var mode = dialplanApplication.$formObj.form('get value', 'type');
    var NewMode;

    if (mode === 'php') {
      // If 'type' is 'php', set the editor mode to PHP and show line numbers
      NewMode = ace.require('ace/mode/php').Mode;
      dialplanApplication.editor.setOptions({
        showLineNumbers: true
      });
    } else {
      // If 'type' is not 'php', set the editor mode to Julia and hide line numbers
      NewMode = ace.require('ace/mode/julia').Mode;
      dialplanApplication.editor.setOptions({
        showLineNumbers: false
      });
    } // Set the new mode and theme for the editor


    dialplanApplication.editor.session.setMode(new NewMode());
    dialplanApplication.editor.setTheme('ace/theme/monokai');
  },

  /**
   * Callback function to be called before the form is sent
   * @param {Object} settings - The current settings of the form
   * @returns {Object} - The updated settings of the form
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = dialplanApplication.$formObj.form('get values');
    result.data.applicationlogic = dialplanApplication.editor.getValue();
    return result;
  },

  /**
   * Callback function to be called after the form has been sent.
   * @param {Object} response - The response from the server after the form is sent
   */
  cbAfterSendForm: function cbAfterSendForm(response) {},

  /**
   * Initialize the form with custom settings
   */
  initializeForm: function initializeForm() {
    Form.$formObj = dialplanApplication.$formObj;
    Form.url = "".concat(globalRootUrl, "dialplan-applications/save"); // Form submission URL

    Form.validateRules = dialplanApplication.validateRules; // Form validation rules

    Form.cbBeforeSendForm = dialplanApplication.cbBeforeSendForm; // Callback before form is sent

    Form.cbAfterSendForm = dialplanApplication.cbAfterSendForm; // Callback after form is sent

    Form.initialize();
  }
};
/**
 * Checks if the number is taken by another account
 * @returns {boolean} True if the parameter has the 'hidden' class, false otherwise
 */

$.fn.form.settings.rules.existRule = function (value, parameter) {
  return $("#".concat(parameter)).hasClass('hidden');
};
/**
 *  Initialize Dialplan Application modify form on document ready
 */


$(document).ready(function () {
  dialplanApplication.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EaWFscGxhbkFwcGxpY2F0aW9ucy9kaWFscGxhbi1hcHBsaWNhdGlvbnMtbW9kaWZ5LmpzIl0sIm5hbWVzIjpbImRpYWxwbGFuQXBwbGljYXRpb24iLCIkbnVtYmVyIiwiJCIsImRlZmF1bHRFeHRlbnNpb24iLCIkZm9ybU9iaiIsIiR0eXBlU2VsZWN0RHJvcERvd24iLCIkZGlycnR5RmllbGQiLCIkdGFiTWVudUl0ZW1zIiwiZWRpdG9yIiwidmFsaWRhdGVSdWxlcyIsIm5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwiZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImV4dGVuc2lvbiIsInZhbHVlIiwiZGFfVmFsaWRhdGVFeHRlbnNpb25OdW1iZXIiLCJkYV9WYWxpZGF0ZUV4dGVuc2lvbklzRW1wdHkiLCJkYV9WYWxpZGF0ZUV4dGVuc2lvbkRvdWJsZSIsImluaXRpYWxpemUiLCJ0YWIiLCJmb3JtIiwibGVuZ3RoIiwiZHJvcGRvd24iLCJvbkNoYW5nZSIsImNoYW5nZUFjZU1vZGUiLCJvbiIsIm5ld051bWJlciIsIkV4dGVuc2lvbnMiLCJjaGVja0F2YWlsYWJpbGl0eSIsImluaXRpYWxpemVGb3JtIiwiaW5pdGlhbGl6ZUFjZSIsImFwcGxpY2F0aW9uTG9naWMiLCJhY2VIZWlnaHQiLCJ3aW5kb3ciLCJpbm5lckhlaWdodCIsInJvd3NDb3VudCIsIk1hdGgiLCJyb3VuZCIsImxvYWQiLCJjc3MiLCJhY2UiLCJlZGl0IiwiZ2V0U2Vzc2lvbiIsInNldFZhbHVlIiwic2V0VGhlbWUiLCJyZXNpemUiLCJ2YWwiLCJyYW5kb20iLCJ0cmlnZ2VyIiwic2V0T3B0aW9ucyIsIm1heExpbmVzIiwic2hvd1ByaW50TWFyZ2luIiwic2hvd0xpbmVOdW1iZXJzIiwibW9kZSIsIk5ld01vZGUiLCJyZXF1aXJlIiwiTW9kZSIsInNlc3Npb24iLCJzZXRNb2RlIiwiY2JCZWZvcmVTZW5kRm9ybSIsInNldHRpbmdzIiwicmVzdWx0IiwiZGF0YSIsImFwcGxpY2F0aW9ubG9naWMiLCJnZXRWYWx1ZSIsImNiQWZ0ZXJTZW5kRm9ybSIsInJlc3BvbnNlIiwiRm9ybSIsInVybCIsImdsb2JhbFJvb3RVcmwiLCJmbiIsImV4aXN0UnVsZSIsInBhcmFtZXRlciIsImhhc0NsYXNzIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLG1CQUFtQixHQUFHO0FBRXhCQyxFQUFBQSxPQUFPLEVBQUVDLENBQUMsQ0FBQyxZQUFELENBRmM7QUFHeEJDLEVBQUFBLGdCQUFnQixFQUFFLEVBSE07O0FBS3hCO0FBQ0o7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFFBQVEsRUFBRUYsQ0FBQyxDQUFDLDRCQUFELENBVGE7QUFXeEJHLEVBQUFBLG1CQUFtQixFQUFFSCxDQUFDLENBQUMseUNBQUQsQ0FYRTs7QUFheEI7QUFDSjtBQUNBO0FBQ0E7QUFDSUksRUFBQUEsWUFBWSxFQUFFSixDQUFDLENBQUMsU0FBRCxDQWpCUztBQW1CeEJLLEVBQUFBLGFBQWEsRUFBRUwsQ0FBQyxDQUFDLDhCQUFELENBbkJRO0FBcUJ4QjtBQUNBTSxFQUFBQSxNQUFNLEVBQUUsRUF0QmdCOztBQXdCeEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxhQUFhLEVBQUU7QUFDWEMsSUFBQUEsSUFBSSxFQUFFO0FBQ0ZDLE1BQUFBLFVBQVUsRUFBRSxNQURWO0FBRUZDLE1BQUFBLEtBQUssRUFBRSxDQUNIO0FBQ0lDLFFBQUFBLElBQUksRUFBRSxPQURWO0FBRUlDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDQztBQUY1QixPQURHO0FBRkwsS0FESztBQVVYQyxJQUFBQSxTQUFTLEVB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QUFBQSxJQUFJLENBQUNGLGVBQUwsR0FBdUJyRSxtQkFBbUIsQ0FBQ3FFLGVBQTNDLENBTGEsQ0FLK0M7O0FBQzVERSxJQUFBQSxJQUFJLENBQUNqRCxVQUFMO0FBQ0g7QUEvS3VCLENBQTVCO0FBa0xBO0FBQ0E7QUFDQTtBQUNBOztBQUNBcEIsQ0FBQyxDQUFDd0UsRUFBRixDQUFLbEQsSUFBTCxDQUFVd0MsUUFBVixDQUFtQnBELEtBQW5CLENBQXlCK0QsU0FBekIsR0FBcUMsVUFBQ3pELEtBQUQsRUFBUTBELFNBQVI7QUFBQSxTQUFzQjFFLENBQUMsWUFBSzBFLFNBQUwsRUFBRCxDQUFtQkMsUUFBbkIsQ0FBNEIsUUFBNUIsQ0FBdEI7QUFBQSxDQUFyQztBQUVBO0FBQ0E7QUFDQTs7O0FBQ0EzRSxDQUFDLENBQUM0RSxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3BCL0UsRUFBQUEsbUJBQW1CLENBQUNzQixVQUFwQjtBQUNILENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIGFjZSwgRm9ybSwgRXh0ZW5zaW9ucyAqL1xuXG4vKipcbiAqIFRoZSBEaWFscGxhbkFwcGxpY2F0aW9uIG9iamVjdC5cbiAqICBNYW5hZ2VzIHRoZSBvcGVyYXRpb25zIGFuZCBiZWhhdmlvcnMgb2YgdGhlIERpYWxwbGFuIGFwcGxpY2F0aW9ucyBpbiB0aGUgVUkuXG4gKlxuICogQG1vZHVsZSBEaWFscGxhbkFwcGxpY2F0aW9uXG4gKi9cbmNvbnN0IGRpYWxwbGFuQXBwbGljYXRpb24gPSB7XG5cbiAgICAkbnVtYmVyOiAkKCcjZXh0ZW5zaW9uJyksXG4gICAgZGVmYXVsdEV4dGVuc2lvbjogJycsXG5cbiAgICAvKipcbiAgICAgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICRmb3JtT2JqOiAkKCcjZGlhbHBsYW4tYXBwbGljYXRpb24tZm9ybScpLFxuXG4gICAgJHR5cGVTZWxlY3REcm9wRG93bjogJCgnI2RpYWxwbGFuLWFwcGxpY2F0aW9uLWZvcm0gLnR5cGUtc2VsZWN0JyksXG5cbiAgICAvKipcbiAgICAgKiBEaXJ0eSBjaGVjayBmaWVsZCwgZm9yIGNoZWNraW5nIGlmIHNvbWV0aGluZyBvbiB0aGUgZm9ybSB3YXMgY2hhbmdlZFxuICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICovXG4gICAgJGRpcnJ0eUZpZWxkOiAkKCcjZGlycnR5JyksXG5cbiAgICAkdGFiTWVudUl0ZW1zOiAkKCcjYXBwbGljYXRpb24tY29kZS1tZW51IC5pdGVtJyksXG5cbiAgICAvLyBBY2UgZWRpdG9yIGluc3RhbmNlXG4gICAgZWRpdG9yOiAnJyxcblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRpb24gcnVsZXMgZm9yIHRoZSBmb3JtIGZpZWxkcyBiZWZvcmUgc3VibWlzc2lvbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICovXG4gICAgdmFsaWRhdGVSdWxlczoge1xuICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnbmFtZScsXG4gICAgICAgICAgICBydWxlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgZXh0ZW5zaW9uOiB7XG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZXh0ZW5zaW9uJyxcbiAgICAgICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncmVnRXhwJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcvXih8WzAtOSMrXFxcXCp8WF17MSw2NH0pJC8nLFxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5kYV9WYWxpZGF0ZUV4dGVuc2lvbk51bWJlcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVFeHRlbnNpb25Jc0VtcHR5LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXhpc3RSdWxlW2V4dGVuc2lvbi1lcnJvcl0nLFxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5kYV9WYWxpZGF0ZUV4dGVuc2lvbkRvdWJsZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIERpYWxwbGFuQXBwbGljYXRpb24uXG4gICAgICogU2V0cyB1cCB0YWJzLCBkcm9wZG93bnMsIGZvcm0gYW5kIEFjZSBlZGl0b3IuXG4gICAgICogU2V0cyB1cCBjaGFuZ2UgaGFuZGxlcnMgZm9yIGV4dGVuc2lvbiBudW1iZXIgYW5kIGVkaXRvciBjb250ZW50cy5cbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLiR0YWJNZW51SXRlbXMudGFiKCk7XG4gICAgICAgIGlmIChkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICduYW1lJykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLiR0YWJNZW51SXRlbXMudGFiKCdjaGFuZ2UgdGFiJywgJ21haW4nKTtcbiAgICAgICAgfVxuICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLiR0eXBlU2VsZWN0RHJvcERvd24uZHJvcGRvd24oe1xuICAgICAgICAgICAgb25DaGFuZ2U6IGRpYWxwbGFuQXBwbGljYXRpb24uY2hhbmdlQWNlTW9kZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGhhbmRsZXIgdG8gZHluYW1pY2FsbHkgY2hlY2sgaWYgdGhlIGlucHV0IG51bWJlciBpcyBhdmFpbGFibGVcbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi4kbnVtYmVyLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdOdW1iZXIgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICdleHRlbnNpb24nKTtcbiAgICAgICAgICAgIEV4dGVuc2lvbnMuY2hlY2tBdmFpbGFiaWxpdHkoZGlhbHBsYW5BcHBsaWNhdGlvbi5kZWZhdWx0RXh0ZW5zaW9uLCBuZXdOdW1iZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFVJIGNvbXBvbmVudHNcbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplRm9ybSgpO1xuICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLmluaXRpYWxpemVBY2UoKTtcbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5jaGFuZ2VBY2VNb2RlKCk7XG5cbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5kZWZhdWx0RXh0ZW5zaW9uID0gZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCAnZXh0ZW5zaW9uJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBBY2UgZWRpdG9yIGluc3RhbmNlLlxuICAgICAqIFNldHMgdXAgQWNlIGVkaXRvciB3aXRoIGEgbW9ub2thaSB0aGVtZSBhbmQgY3VzdG9tIG9wdGlvbnMuXG4gICAgICogQXR0YWNoZXMgY2hhbmdlIGhhbmRsZXIgdG8gdGhlIGVkaXRvciBzZXNzaW9uLlxuICAgICAqL1xuICAgIGluaXRpYWxpemVBY2UoKSB7XG4gICAgICAgIGNvbnN0IGFwcGxpY2F0aW9uTG9naWMgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICdhcHBsaWNhdGlvbmxvZ2ljJyk7XG4gICAgICAgIGNvbnN0IGFjZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDM4MDtcbiAgICAgICAgY29uc3Qgcm93c0NvdW50ID0gTWF0aC5yb3VuZChhY2VIZWlnaHQgLyAxNi4zKTtcbiAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCgnLmFwcGxpY2F0aW9uLWNvZGUnKS5jc3MoJ21pbi1oZWlnaHQnLCBgJHthY2VIZWlnaHR9cHhgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yID0gYWNlLmVkaXQoJ2FwcGxpY2F0aW9uLWNvZGUnKTtcbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldFZhbHVlKGFwcGxpY2F0aW9uTG9naWMpO1xuICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXRUaGVtZSgnYWNlL3RoZW1lL21vbm9rYWknKTtcbiAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3IucmVzaXplKCk7XG4gICAgICAgIGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLmdldFNlc3Npb24oKS5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSB2YWx1ZSBvZiAnJGRpcnJ0eUZpZWxkJyB0byB0cmlnZ2VyXG4gICAgICAgICAgICAvLyB0aGUgJ2NoYW5nZScgZm9ybSBldmVudCBhbmQgZW5hYmxlIHN1Ym1pdCBidXR0b24uXG4gICAgICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLiRkaXJydHlGaWVsZC52YWwoTWF0aC5yYW5kb20oKSk7XG4gICAgICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLiRkaXJydHlGaWVsZC50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgbWF4TGluZXM6IHJvd3NDb3VudCxcbiAgICAgICAgICAgIHNob3dQcmludE1hcmdpbjogZmFsc2UsXG4gICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlcyB0aGUgQWNlIGVkaXRvciBtb2RlIGFuZCBzZXR0aW5ncyBiYXNlZCBvbiB0aGUgJ3R5cGUnIGZvcm0gdmFsdWUuXG4gICAgICogSWYgdGhlICd0eXBlJyBpcyAncGhwJywgUEhQIG1vZGUgaXMgc2V0LCBhbmQgbGluZSBudW1iZXJzIGFyZSBzaG93bi5cbiAgICAgKiBPdGhlcndpc2UsIEp1bGlhIG1vZGUgaXMgc2V0LCBhbmQgbGluZSBudW1iZXJzIGFyZSBoaWRkZW4uXG4gICAgICogVGhlIGVkaXRvciB0aGVtZSBpcyBzZXQgdG8gTW9ub2thaSBpbiBhbGwgY2FzZXMuXG4gICAgICovXG4gICAgY2hhbmdlQWNlTW9kZSgpIHtcbiAgICAgICAgLy8gUmV0cmlldmUgJ3R5cGUnIHZhbHVlIGZyb20gdGhlIGZvcm1cbiAgICAgICAgY29uc3QgbW9kZSA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ3R5cGUnKTtcbiAgICAgICAgbGV0IE5ld01vZGU7XG5cbiAgICAgICAgaWYgKG1vZGUgPT09ICdwaHAnKSB7XG4gICAgICAgICAgICAvLyBJZiAndHlwZScgaXMgJ3BocCcsIHNldCB0aGUgZWRpdG9yIG1vZGUgdG8gUEhQIGFuZCBzaG93IGxpbmUgbnVtYmVyc1xuICAgICAgICAgICAgTmV3TW9kZSA9IGFjZS5yZXF1aXJlKCdhY2UvbW9kZS9waHAnKS5Nb2RlO1xuICAgICAgICAgICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiAndHlwZScgaXMgbm90ICdwaHAnLCBzZXQgdGhlIGVkaXRvciBtb2RlIHRvIEp1bGlhIGFuZCBoaWRlIGxpbmUgbnVtYmVyc1xuICAgICAgICAgICAgTmV3TW9kZSA9IGFjZS5yZXF1aXJlKCdhY2UvbW9kZS9qdWxpYScpLk1vZGU7XG4gICAgICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIG5ldyBtb2RlIGFuZCB0aGVtZSBmb3IgdGhlIGVkaXRvclxuICAgICAgICBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXNzaW9uLnNldE1vZGUobmV3IE5ld01vZGUoKSk7XG4gICAgICAgIGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLnNldFRoZW1lKCdhY2UvdGhlbWUvbW9ub2thaScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYmVmb3JlIHRoZSBmb3JtIGlzIHNlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3MgLSBUaGUgY3VycmVudCBzZXR0aW5ncyBvZiB0aGUgZm9ybVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gVGhlIHVwZGF0ZWQgc2V0dGluZ3Mgb2YgdGhlIGZvcm1cbiAgICAgKi9cbiAgICBjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuICAgICAgICByZXN1bHQuZGF0YSA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuICAgICAgICByZXN1bHQuZGF0YS5hcHBsaWNhdGlvbmxvZ2ljID0gZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBmb3JtIGhhcyBiZWVuIHNlbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciBhZnRlciB0aGUgZm9ybSBpcyBzZW50XG4gICAgICovXG4gICAgY2JBZnRlclNlbmRGb3JtKHJlc3BvbnNlKSB7XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGZvcm0gd2l0aCBjdXN0b20gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBpbml0aWFsaXplRm9ybSgpIHtcbiAgICAgICAgRm9ybS4kZm9ybU9iaiA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmo7XG4gICAgICAgIEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1kaWFscGxhbi1hcHBsaWNhdGlvbnMvc2F2ZWA7IC8vIEZvcm0gc3VibWlzc2lvbiBVUkxcbiAgICAgICAgRm9ybS52YWxpZGF0ZVJ1bGVzID0gZGlhbHBsYW5BcHBsaWNhdGlvbi52YWxpZGF0ZVJ1bGVzOyAvLyBGb3JtIHZhbGlkYXRpb24gcnVsZXNcbiAgICAgICAgRm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gZGlhbHBsYW5BcHBsaWNhdGlvbi5jYkJlZm9yZVNlbmRGb3JtOyAvLyBDYWxsYmFjayBiZWZvcmUgZm9ybSBpcyBzZW50XG4gICAgICAgIEZvcm0uY2JBZnRlclNlbmRGb3JtID0gZGlhbHBsYW5BcHBsaWNhdGlvbi5jYkFmdGVyU2VuZEZvcm07IC8vIENhbGxiYWNrIGFmdGVyIGZvcm0gaXMgc2VudFxuICAgICAgICBGb3JtLmluaXRpYWxpemUoKTtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIG51bWJlciBpcyB0YWtlbiBieSBhbm90aGVyIGFjY291bnRcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXJhbWV0ZXIgaGFzIHRoZSAnaGlkZGVuJyBjbGFzcywgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbiQuZm4uZm9ybS5zZXR0aW5ncy5ydWxlcy5leGlzdFJ1bGUgPSAodmFsdWUsIHBhcmFtZXRlcikgPT4gJChgIyR7cGFyYW1ldGVyfWApLmhhc0NsYXNzKCdoaWRkZW4nKTtcblxuLyoqXG4gKiAgSW5pdGlhbGl6ZSBEaWFscGxhbiBBcHBsaWNhdGlvbiBtb2RpZnkgZm9ybSBvbiBkb2N1bWVudCByZWFkeVxuICovXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcblxuIl19