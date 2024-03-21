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

/* global globalRootUrl, DataTable, $ */

/**
 * Object for managing the Out-of-Work Times table.
 *
 * @module OutOfWorkTimesTable
 */
var OutOfWorkTimesTable = {
  /**
   * jQuery object for the table with time frame records.
   * @type {jQuery}
   */
  $timeFramesTable: $('#time-frames-table'),

  /**
   * Initializes the Out-of-Work Times table.
   */
  initialize: function initialize() {
    // Bind double-click event to table cells
    $('.frame-row td').on('dblclick', function (e) {
      var id = $(e.target).closest('tr').attr('id');
      window.location = "".concat(globalRootUrl, "out-off-work-time/modify/").concat(id);
    }); // Initialize DataTable

    OutOfWorkTimesTable.$timeFramesTable.DataTable({
      lengthChange: false,
      paging: false,
      columns: [{
        orderable: false
      }, {
        orderable: false
      }, {
        orderable: false
      }, null, null, {
        orderable: false
      }],
      autoWidth: false,
      language: SemanticLocalization.dataTableLocalisation,
      "drawCallback": function drawCallback(settings) {
        $("[data-content!=''][data-content]").popup();
      }
    }); // Move the "Add New" button to the first eight-column div

    $('#add-new-button').appendTo($('div.eight.column:eq(0)'));
    $('body').on('click', 'a.delete', function (e) {
      e.preventDefault();
      var id = $(e.target).closest('tr').attr('id');
      OutOfWorkTimesTable.deleteRule(id);
    }); // Initialize table drag-and-drop with the appropriate callbacks

    OutOfWorkTimesTable.$timeFramesTable.tableDnD({
      onDrop: OutOfWorkTimesTable.cbOnDrop,
      // Callback on dropping an item
      onDragClass: 'hoveringRow',
      // CSS class while dragging
      dragHandle: '.dragHandle' // Handle for dragging

    });
  },

  /**
   * Callback to execute after dropping an element
   */
  cbOnDrop: function cbOnDrop() {
    var priorityWasChanged = false;
    var priorityData = {};
    $('.frame-row').each(function (index, obj) {
      var ruleId = $(obj).attr('id');
      var oldPriority = parseInt($(obj).attr('data-value'), 10);
      var newPriority = obj.rowIndex;

      if (oldPriority !== newPriority) {
        priorityWasChanged = true;
        priorityData[ruleId] = newPriority;
      }
    });

    if (priorityWasChanged) {
      $.api({
        on: 'now',
        url: "".concat(globalRootUrl, "out-off-work-time/changePriority"),
        method: 'POST',
        data: priorityData
      });
    }
  },

  /**
   * Deletes an extension with the given ID.
   * @param {string} id - The ID of the rule to delete.
   */
  deleteRule: function deleteRule(id) {
    $('.message.ajax').remove();
    $.api({
      url: "".concat(globalRootUrl, "out-off-work-time/delete/").concat(id),
      on: 'now',
      successTest: function successTest(response) {
        // test whether a JSON response is valid
        return response !== undefined && Object.keys(response).length > 0;
      },
      onSuccess: function onSuccess(response) {
        if (response.success === true) {
          OutOfWorkTimesTable.$timeFramesTable.find("tr[id=".concat(id, "]")).remove();
        } else {
          UserMessage.showError(response.message.error, globalTranslate.ex_ImpossibleToDeleteExtension);
        }
      }
    });
  }
};
/**
 *  Initialize out of work table on document ready
 */

$(document).ready(function () {
  OutOfWorkTimesTable.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PdXRPZmZXb3JrVGltZS9vdXQtb2Ytd29yay10aW1lcy1pbmRleC5qcyJdLCJuYW1lcyI6WyJPdXRPZldvcmtUaW1lc1RhYmxlIiwiJHRpbWVGcmFtZXNUYWJsZSIsIiQiLCJpbml0aWFsaXplIiwib24iLCJlIiwiaWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiYXR0ciIsIndpbmRvdyIsImxvY2F0aW9uIiwiZ2xvYmFsUm9vdFVybCIsIkRhdGFUYWJsZSIsImxlbmd0aENoYW5nZSIsInBhZ2luZyIsImNvbHVtbnMiLCJvcmRlcmFibGUiLCJhdXRvV2lkdGgiLCJsYW5ndWFnZSIsIlNlbWFudGljTG9jYWxpemF0aW9uIiwiZGF0YVRhYmxlTG9jYWxpc2F0aW9uIiwic2V0dGluZ3MiLCJwb3B1cCIsImFwcGVuZFRvIiwicHJldmVudERlZmF1bHQiLCJkZWxldGVSdWxlIiwidGFibGVEbkQiLCJvbkRyb3AiLCJjYk9uRHJvcCIsIm9uRHJhZ0NsYXNzIiwiZHJhZ0hhbmRsZSIsInByaW9yaXR5V2FzQ2hhbmdlZCIsInByaW9yaXR5RGF0YSIsImVhY2giLCJpbmRleCIsIm9iaiIsInJ1bGVJZCIsIm9sZFByaW9yaXR5IiwicGFyc2VJbnQiLCJuZXdQcmlvcml0eSIsInJvd0luZGV4IiwiYXBpIiwidXJsIiwibWV0aG9kIiwiZGF0YSIsInJlbW92ZSIsInN1Y2Nlc3NUZXN0IiwicmVzcG9uc2UiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwib25TdWNjZXNzIiwic3VjY2VzcyIsImZpbmQiLCJVc2VyTWVzc2FnZSIsInNob3dFcnJvciIsIm1lc3NhZ2UiLCJlcnJvciIsImdsb2JhbFRyYW5zbGF0ZSIsImV4X0ltcG9zc2libGVUb0RlbGV0ZUV4dGVuc2lvbiIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFwQixDQUFxQ3NELElBQXJDLGlCQUFtRGpELEVBQW5ELFFBQTBEd0MsTUFBMUQ7QUFDSCxTQUZELE1BRU87QUFDSFUsVUFBQUEsV0FBVyxDQUFDQyxTQUFaLENBQXNCVCxRQUFRLENBQUNVLE9BQVQsQ0FBaUJDLEtBQXZDLEVBQThDQyxlQUFlLENBQUNDLDhCQUE5RDtBQUNIO0FBQ0o7QUFkQyxLQUFOO0FBZ0JIO0FBdEd1QixDQUE1QjtBQXlHQTtBQUNBO0FBQ0E7O0FBQ0EzRCxDQUFDLENBQUM0RCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3BCL0QsRUFBQUEsbUJBQW1CLENBQUNHLFVBQXBCO0FBQ0gsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBEYXRhVGFibGUsICQgKi9cblxuLyoqXG4gKiBPYmplY3QgZm9yIG1hbmFnaW5nIHRoZSBPdXQtb2YtV29yayBUaW1lcyB0YWJsZS5cbiAqXG4gKiBAbW9kdWxlIE91dE9mV29ya1RpbWVzVGFibGVcbiAqL1xuY29uc3QgT3V0T2ZXb3JrVGltZXNUYWJsZSA9IHtcblxuICAgIC8qKlxuICAgICAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB0YWJsZSB3aXRoIHRpbWUgZnJhbWUgcmVjb3Jkcy5cbiAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAqL1xuICAgICR0aW1lRnJhbWVzVGFibGU6ICQoJyN0aW1lLWZyYW1lcy10YWJsZScpLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIE91dC1vZi1Xb3JrIFRpbWVzIHRhYmxlLlxuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG5cbiAgICAgICAgLy8gQmluZCBkb3VibGUtY2xpY2sgZXZlbnQgdG8gdGFibGUgY2VsbHNcbiAgICAgICAgJCgnLmZyYW1lLXJvdyB0ZCcpLm9uKCdkYmxjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RyJykuYXR0cignaWQnKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGAke2dsb2JhbFJvb3RVcmx9b3V0LW9mZi13b3JrLXRpbWUvbW9kaWZ5LyR7aWR9YDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBEYXRhVGFibGVcbiAgICAgICAgT3V0T2ZXb3JrVGltZXNUYWJsZS4kdGltZUZyYW1lc1RhYmxlLkRhdGFUYWJsZSh7XG4gICAgICAgICAgICBsZW5ndGhDaGFuZ2U6IGZhbHNlLFxuICAgICAgICAgICAgcGFnaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICB7b3JkZXJhYmxlOiBmYWxzZX0sXG4gICAgICAgICAgICAgICAge29yZGVyYWJsZTogZmFsc2V9LFxuICAgICAgICAgICAgICAgIHtvcmRlcmFibGU6IGZhbHNlfSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAge29yZGVyYWJsZTogZmFsc2V9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGF1dG9XaWR0aDogZmFsc2UsXG4gICAgICAgICAgICBsYW5ndWFnZTogU2VtYW50aWNMb2NhbGl6YXRpb24uZGF0YVRhYmxlTG9jYWxpc2F0aW9uLFxuICAgICAgICAgICAgXCJkcmF3Q2FsbGJhY2tcIjogZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgJChcIltkYXRhLWNvbnRlbnQhPScnXVtkYXRhLWNvbnRlbnRdXCIpLnBvcHVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE1vdmUgdGhlIFwiQWRkIE5ld1wiIGJ1dHRvbiB0byB0aGUgZmlyc3QgZWlnaHQtY29sdW1uIGRpdlxuICAgICAgICAkKCcjYWRkLW5ldy1idXR0b24nKS5hcHBlbmRUbygkKCdkaXYuZWlnaHQuY29sdW1uOmVxKDApJykpO1xuXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnYS5kZWxldGUnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgaWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICBPdXRPZldvcmtUaW1lc1RhYmxlLmRlbGV0ZVJ1bGUoaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIHRhYmxlIGRyYWctYW5kLWRyb3Agd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2FsbGJhY2tzXG4gICAgICAgIE91dE9mV29ya1RpbWVzVGFibGUuJHRpbWVGcmFtZXNUYWJsZS50YWJsZURuRCh7XG4gICAgICAgICAgICBvbkRyb3A6IE91dE9mV29ya1RpbWVzVGFibGUuY2JPbkRyb3AsIC8vIENhbGxiYWNrIG9uIGRyb3BwaW5nIGFuIGl0ZW1cbiAgICAgICAgICAgIG9uRHJhZ0NsYXNzOiAnaG92ZXJpbmdSb3cnLCAvLyBDU1MgY2xhc3Mgd2hpbGUgZHJhZ2dpbmdcbiAgICAgICAgICAgIGRyYWdIYW5kbGU6ICcuZHJhZ0hhbmRsZScsICAvLyBIYW5kbGUgZm9yIGRyYWdnaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB0byBleGVjdXRlIGFmdGVyIGRyb3BwaW5nIGFuIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjYk9uRHJvcCgpIHtcbiAgICAgICAgbGV0IHByaW9yaXR5V2FzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBwcmlvcml0eURhdGEgPSB7fTtcbiAgICAgICAgJCgnLmZyYW1lLXJvdycpLmVhY2goKGluZGV4LCBvYmopID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGVJZCA9ICQob2JqKS5hdHRyKCdpZCcpO1xuICAgICAgICAgICAgY29uc3Qgb2xkUHJpb3JpdHkgPSBwYXJzZUludCgkKG9iaikuYXR0cignZGF0YS12YWx1ZScpLCAxMCk7XG4gICAgICAgICAgICBjb25zdCBuZXdQcmlvcml0eSA9IG9iai5yb3dJbmRleDtcbiAgICAgICAgICAgIGlmIChvbGRQcmlvcml0eSAhPT0gbmV3UHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICBwcmlvcml0eVdhc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHByaW9yaXR5RGF0YVtydWxlSWRdID0gbmV3UHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocHJpb3JpdHlXYXNDaGFuZ2VkKSB7XG4gICAgICAgICAgICAkLmFwaSh7XG4gICAgICAgICAgICAgICAgb246ICdub3cnLFxuICAgICAgICAgICAgICAgIHVybDogYCR7Z2xvYmFsUm9vdFVybH1vdXQtb2ZmLXdvcmstdGltZS9jaGFuZ2VQcmlvcml0eWAsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YTogcHJpb3JpdHlEYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhbiBleHRlbnNpb24gd2l0aCB0aGUgZ2l2ZW4gSUQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIElEIG9mIHRoZSBydWxlIHRvIGRlbGV0ZS5cbiAgICAgKi9cbiAgICBkZWxldGVSdWxlKGlkKSB7XG4gICAgICAgICQoJy5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcbiAgICAgICAgJC5hcGkoe1xuICAgICAgICAgICAgdXJsOiBgJHtnbG9iYWxSb290VXJsfW91dC1vZmYtd29yay10aW1lL2RlbGV0ZS8ke2lkfWAsXG4gICAgICAgICAgICBvbjogJ25vdycsXG4gICAgICAgICAgICBzdWNjZXNzVGVzdChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIC8vIHRlc3Qgd2hldGhlciBhIEpTT04gcmVzcG9uc2UgaXMgdmFsaWRcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAmJiBPYmplY3Qua2V5cyhyZXNwb25zZSkubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBPdXRPZldvcmtUaW1lc1RhYmxlLiR0aW1lRnJhbWVzVGFibGUuZmluZChgdHJbaWQ9JHtpZH1dYCkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgVXNlck1lc3NhZ2Uuc2hvd0Vycm9yKHJlc3BvbnNlLm1lc3NhZ2UuZXJyb3IsIGdsb2JhbFRyYW5zbGF0ZS5leF9JbXBvc3NpYmxlVG9EZWxldGVFeHRlbnNpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH0sXG59O1xuXG4vKipcbiAqICBJbml0aWFsaXplIG91dCBvZiB3b3JrIHRhYmxlIG9uIGRvY3VtZW50IHJlYWR5XG4gKi9cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBPdXRPZldvcmtUaW1lc1RhYmxlLmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=