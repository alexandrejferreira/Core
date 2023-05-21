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

/* global globalRootUrl,$ */

/**
 * Object for managing the Out-of-Work Times table.
 *
 * @module OutOfWorkTimesTable
 */
var OutOfWorkTimesTable = {
  /**
   * Initializes the Out-of-Work Times table.
   */
  initialize: function initialize() {
    // Bind double-click event to table cells
    $('.frame-row td').on('dblclick', function (e) {
      var id = $(e.target).closest('tr').attr('id');
      window.location = "".concat(globalRootUrl, "out-off-work-time/modify/").concat(id);
    }); // Initialize DataTable

    $('#time-frames-table').DataTable({
      lengthChange: false,
      paging: false,
      columns: [null, {
        orderable: false
      }, null, null, {
        orderable: false
      }],
      autoWidth: false,
      order: [1, 'asc'],
      language: SemanticLocalization.dataTableLocalisation,
      "drawCallback": function drawCallback(settings) {
        $("[data-content!=''][data-content]").popup();
      }
    }); // Move the "Add New" button to the first eight-column div

    $('#add-new-button').appendTo($('div.eight.column:eq(0)'));
  }
};
/**
 *  Initialize out of work table on document ready
 */

$(document).ready(function () {
  OutOfWorkTimesTable.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PdXRPZmZXb3JrVGltZS9vdXQtb2Ytd29yay10aW1lcy1pbmRleC5qcyJdLCJuYW1lcyI6WyJPdXRPZldvcmtUaW1lc1RhYmxlIiwiaW5pdGlhbGl6ZSIsIiQiLCJvbiIsImUiLCJpZCIsInRhcmdldCIsImNsb3Nlc3QiLCJhdHRyIiwid2luZG93IiwibG9jYXRpb24iLCJnbG9iYWxSb290VXJsIiwiRGF0YVRhYmxlIiwibGVuZ3RoQ2hhbmdlIiwicGFnaW5nIiwiY29sdW1ucyIsIm9yZGVyYWJsZSIsImF1dG9XaWR0aCIsIm9yZGVyIiwibGFuZ3VhZ2UiLCJTZW1hbnRpY0xvY2FsaXphdGlvbiIsImRhdGFUYWJsZUxvY2FsaXNhdGlvbiIsInNldHRpbmdzIiwicG9wdXAiLCJhcHBlbmRUbyIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsbUJBQW1CLEdBQUc7QUFFeEI7QUFDSjtBQUNBO0FBQ0lDLEVBQUFBLFVBTHdCLHdCQUtYO0FBRVQ7QUFDQUMsSUFBQUEsQ0FBQyxDQUFDLGVBQUQsQ0FBRCxDQUFtQkMsRUFBbkIsQ0FBc0IsVUFBdEIsRUFBa0MsVUFBQ0MsQ0FBRCxFQUFPO0FBQ3JDLFVBQU1DLEVBQUUsR0FBR0gsQ0FBQyxDQUFDRSxDQUFDLENBQUNFLE1BQUgsQ0FBRCxDQUFZQyxPQUFaLENBQW9CLElBQXBCLEVBQTBCQyxJQUExQixDQUErQixJQUEvQixDQUFYO0FBQ0FDLE1BQUFBLE1BQU0sQ0FBQ0MsUUFBUCxhQUFxQkMsYUFBckIsc0NBQThETixFQUE5RDtBQUNILEtBSEQsRUFIUyxDQVFUOztBQUNBSCxJQUFBQSxDQUFDLENBQUMsb0JBQUQsQ0FBRCxDQUF3QlUsU0FBeEIsQ0FBa0M7QUFDOUJDLE1BQUFBLFlBQVksRUFBRSxLQURnQjtBQUU5QkMsTUFBQUEsTUFBTSxFQUFFLEtBRnNCO0FBRzlCQyxNQUFBQSxPQUFPLEVBQUUsQ0FDTCxJQURLLEVBRUw7QUFBQ0MsUUFBQUEsU0FBUyxFQUFFO0FBQVosT0FGSyxFQUdMLElBSEssRUFJTCxJQUpLLEVBS0w7QUFBQ0EsUUFBQUEsU0FBUyxFQUFFO0FBQVosT0FMSyxDQUhxQjtBQVU5QkMsTUFBQUEsU0FBUyxFQUFFLEtBVm1CO0FBVzlCQyxNQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFELEVBQUksS0FBSixDQVh1QjtBQVk5QkMsTUFBQUEsUUFBUSxFQUFFQyxvQkFBb0IsQ0FBQ0MscUJBWkQ7QUFhOUIsc0JBQWdCLHNCQUFVQyxRQUFWLEVBQW9CO0FBQ2hDcEIsUUFBQUEsQ0FBQyxDQUFDLGtDQUFELENBQUQsQ0FBc0NxQixLQUF0QztBQUNIO0FBZjZCLEtBQWxDLEVBVFMsQ0EyQlQ7O0FBQ0FyQixJQUFBQSxDQUFDLENBQUMsaUJBQUQsQ0FBRCxDQUFxQnNCLFFBQXJCLENBQThCdEIsQ0FBQyxDQUFDLHdCQUFELENBQS9CO0FBRUg7QUFuQ3VCLENBQTVCO0FBdUNBO0FBQ0E7QUFDQTs7QUFDQUEsQ0FBQyxDQUFDdUIsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUNwQjFCLEVBQUFBLG1CQUFtQixDQUFDQyxVQUFwQjtBQUNILENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwkICovXG5cbi8qKlxuICogT2JqZWN0IGZvciBtYW5hZ2luZyB0aGUgT3V0LW9mLVdvcmsgVGltZXMgdGFibGUuXG4gKlxuICogQG1vZHVsZSBPdXRPZldvcmtUaW1lc1RhYmxlXG4gKi9cbmNvbnN0IE91dE9mV29ya1RpbWVzVGFibGUgPSB7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgT3V0LW9mLVdvcmsgVGltZXMgdGFibGUuXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcblxuICAgICAgICAvLyBCaW5kIGRvdWJsZS1jbGljayBldmVudCB0byB0YWJsZSBjZWxsc1xuICAgICAgICAkKCcuZnJhbWUtcm93IHRkJykub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5hdHRyKCdpZCcpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYCR7Z2xvYmFsUm9vdFVybH1vdXQtb2ZmLXdvcmstdGltZS9tb2RpZnkvJHtpZH1gO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIERhdGFUYWJsZVxuICAgICAgICAkKCcjdGltZS1mcmFtZXMtdGFibGUnKS5EYXRhVGFibGUoe1xuICAgICAgICAgICAgbGVuZ3RoQ2hhbmdlOiBmYWxzZSxcbiAgICAgICAgICAgIHBhZ2luZzogZmFsc2UsXG4gICAgICAgICAgICBjb2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB7b3JkZXJhYmxlOiBmYWxzZX0sXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHtvcmRlcmFibGU6IGZhbHNlfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBhdXRvV2lkdGg6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IFsxLCAnYXNjJ10sXG4gICAgICAgICAgICBsYW5ndWFnZTogU2VtYW50aWNMb2NhbGl6YXRpb24uZGF0YVRhYmxlTG9jYWxpc2F0aW9uLFxuICAgICAgICAgICAgXCJkcmF3Q2FsbGJhY2tcIjogZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgJChcIltkYXRhLWNvbnRlbnQhPScnXVtkYXRhLWNvbnRlbnRdXCIpLnBvcHVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE1vdmUgdGhlIFwiQWRkIE5ld1wiIGJ1dHRvbiB0byB0aGUgZmlyc3QgZWlnaHQtY29sdW1uIGRpdlxuICAgICAgICAkKCcjYWRkLW5ldy1idXR0b24nKS5hcHBlbmRUbygkKCdkaXYuZWlnaHQuY29sdW1uOmVxKDApJykpO1xuXG4gICAgfSxcblxufTtcblxuLyoqXG4gKiAgSW5pdGlhbGl6ZSBvdXQgb2Ygd29yayB0YWJsZSBvbiBkb2N1bWVudCByZWFkeVxuICovXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgT3V0T2ZXb3JrVGltZXNUYWJsZS5pbml0aWFsaXplKCk7XG59KTtcblxuIl19