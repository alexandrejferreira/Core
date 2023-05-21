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

/* global globalRootUrl */

/**
 * Module handling interactions with the conference room table.
 * @module conferenceTable
 */
var conferenceTable = {
  /**
   * Initializes module functionality.
   * Specifically, it adds a double click event handler to the rows of the conference table.
   */
  initialize: function initialize() {
    // Attach double-click event handler to each cell in the conference room table
    // The handler redirects to a URL specific to the conference room for editing
    $('.record-row td').on('dblclick', function (e) {
      var id = $(e.target).closest('tr').attr('id');
      window.location = "".concat(globalRootUrl, "conference-rooms/modify/").concat(id);
    });
  }
};
/**
 *  Initialize conference rooms table on document ready
 */

$(document).ready(function () {
  conferenceTable.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db25mZXJlbmNlUm9vbXMvY29uZmVyZW5jZS1yb29tcy1pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25mZXJlbmNlVGFibGUiLCJpbml0aWFsaXplIiwiJCIsIm9uIiwiZSIsImlkIiwidGFyZ2V0IiwiY2xvc2VzdCIsImF0dHIiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImdsb2JhbFJvb3RVcmwiLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxlQUFlLEdBQUc7QUFFcEI7QUFDSjtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsVUFOb0Isd0JBTVA7QUFFVDtBQUNBO0FBQ0FDLElBQUFBLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQW9CQyxFQUFwQixDQUF1QixVQUF2QixFQUFtQyxVQUFDQyxDQUFELEVBQU87QUFDdEMsVUFBTUMsRUFBRSxHQUFHSCxDQUFDLENBQUNFLENBQUMsQ0FBQ0UsTUFBSCxDQUFELENBQVlDLE9BQVosQ0FBb0IsSUFBcEIsRUFBMEJDLElBQTFCLENBQStCLElBQS9CLENBQVg7QUFDQUMsTUFBQUEsTUFBTSxDQUFDQyxRQUFQLGFBQXFCQyxhQUFyQixxQ0FBNkROLEVBQTdEO0FBQ0gsS0FIRDtBQUlIO0FBZG1CLENBQXhCO0FBaUJBO0FBQ0E7QUFDQTs7QUFDQUgsQ0FBQyxDQUFDVSxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3BCYixFQUFBQSxlQUFlLENBQUNDLFVBQWhCO0FBQ0gsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCAqL1xuXG4vKipcbiAqIE1vZHVsZSBoYW5kbGluZyBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgY29uZmVyZW5jZSByb29tIHRhYmxlLlxuICogQG1vZHVsZSBjb25mZXJlbmNlVGFibGVcbiAqL1xuY29uc3QgY29uZmVyZW5jZVRhYmxlID0ge1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgbW9kdWxlIGZ1bmN0aW9uYWxpdHkuXG4gICAgICogU3BlY2lmaWNhbGx5LCBpdCBhZGRzIGEgZG91YmxlIGNsaWNrIGV2ZW50IGhhbmRsZXIgdG8gdGhlIHJvd3Mgb2YgdGhlIGNvbmZlcmVuY2UgdGFibGUuXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcblxuICAgICAgICAvLyBBdHRhY2ggZG91YmxlLWNsaWNrIGV2ZW50IGhhbmRsZXIgdG8gZWFjaCBjZWxsIGluIHRoZSBjb25mZXJlbmNlIHJvb20gdGFibGVcbiAgICAgICAgLy8gVGhlIGhhbmRsZXIgcmVkaXJlY3RzIHRvIGEgVVJMIHNwZWNpZmljIHRvIHRoZSBjb25mZXJlbmNlIHJvb20gZm9yIGVkaXRpbmdcbiAgICAgICAgJCgnLnJlY29yZC1yb3cgdGQnKS5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgJHtnbG9iYWxSb290VXJsfWNvbmZlcmVuY2Utcm9vbXMvbW9kaWZ5LyR7aWR9YDtcbiAgICAgICAgfSk7XG4gICAgfSxcbn07XG5cbi8qKlxuICogIEluaXRpYWxpemUgY29uZmVyZW5jZSByb29tcyB0YWJsZSBvbiBkb2N1bWVudCByZWFkeVxuICovXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gICAgY29uZmVyZW5jZVRhYmxlLmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=