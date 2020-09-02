"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */
var DeleteSomething = {
  initialize: function () {
    function initialize() {
      $('.two-steps-delete').closest('td').on('dblclick', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      });
      $('body').on('click', '.two-steps-delete', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var $button = $(e.target).closest('a');
        var $icon = $button.find('i.trash');

        if ($button.hasClass('disabled')) {
          return;
        }

        $button.addClass('disabled');
        setTimeout(function () {
          if ($button.length) {
            $button.removeClass('two-steps-delete').removeClass('disabled');
            $icon.removeClass('trash').addClass('close');
          }
        }, 200);
        setTimeout(function () {
          if ($button.length) {
            $button.addClass('two-steps-delete');
            $icon.removeClass('close').addClass('trash');
          }
        }, 3000);
      });
    }

    return initialize;
  }()
};
$(document).ready(function () {
  DeleteSomething.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2RlbGV0ZS1zb21ldGhpbmcuanMiXSwibmFtZXMiOlsiRGVsZXRlU29tZXRoaW5nIiwiaW5pdGlhbGl6ZSIsIiQiLCJjbG9zZXN0Iiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCIkYnV0dG9uIiwidGFyZ2V0IiwiJGljb24iLCJmaW5kIiwiaGFzQ2xhc3MiLCJhZGRDbGFzcyIsInNldFRpbWVvdXQiLCJsZW5ndGgiLCJyZW1vdmVDbGFzcyIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFRQSxJQUFNQSxlQUFlLEdBQUc7QUFDdkJDLEVBQUFBLFVBRHVCO0FBQUEsMEJBQ1Y7QUFDWkMsTUFBQUEsQ0FBQyxDQUFDLG1CQUFELENBQUQsQ0FBdUJDLE9BQXZCLENBQWdDLElBQWhDLEVBQXVDQyxFQUF2QyxDQUEwQyxVQUExQyxFQUFzRCxVQUFDQyxDQUFELEVBQU87QUFDNURBLFFBQUFBLENBQUMsQ0FBQ0MsY0FBRjtBQUNBRCxRQUFBQSxDQUFDLENBQUNFLHdCQUFGO0FBQ0EsT0FIRDtBQUlBTCxNQUFBQSxDQUFDLENBQUMsTUFBRCxDQUFELENBQVVFLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLG1CQUF0QixFQUEyQyxVQUFDQyxDQUFELEVBQU87QUFDakRBLFFBQUFBLENBQUMsQ0FBQ0MsY0FBRjtBQUNBRCxRQUFBQSxDQUFDLENBQUNFLHdCQUFGO0FBQ0EsWUFBTUMsT0FBTyxHQUFHTixDQUFDLENBQUNHLENBQUMsQ0FBQ0ksTUFBSCxDQUFELENBQVlOLE9BQVosQ0FBb0IsR0FBcEIsQ0FBaEI7QUFDQSxZQUFNTyxLQUFLLEdBQUdGLE9BQU8sQ0FBQ0csSUFBUixDQUFhLFNBQWIsQ0FBZDs7QUFDQSxZQUFJSCxPQUFPLENBQUNJLFFBQVIsQ0FBaUIsVUFBakIsQ0FBSixFQUFpQztBQUNoQztBQUNBOztBQUNESixRQUFBQSxPQUFPLENBQUNLLFFBQVIsQ0FBaUIsVUFBakI7QUFDQUMsUUFBQUEsVUFBVSxDQUFDLFlBQU07QUFDaEIsY0FBSU4sT0FBTyxDQUFDTyxNQUFaLEVBQW9CO0FBQ25CUCxZQUFBQSxPQUFPLENBQUNRLFdBQVIsQ0FBb0Isa0JBQXBCLEVBQXdDQSxXQUF4QyxDQUFvRCxVQUFwRDtBQUNBTixZQUFBQSxLQUFLLENBQUNNLFdBQU4sQ0FBa0IsT0FBbEIsRUFBMkJILFFBQTNCLENBQW9DLE9BQXBDO0FBQ0E7QUFDRCxTQUxTLEVBS1AsR0FMTyxDQUFWO0FBTUFDLFFBQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2hCLGNBQUlOLE9BQU8sQ0FBQ08sTUFBWixFQUFvQjtBQUNuQlAsWUFBQUEsT0FBTyxDQUFDSyxRQUFSLENBQWlCLGtCQUFqQjtBQUNBSCxZQUFBQSxLQUFLLENBQUNNLFdBQU4sQ0FBa0IsT0FBbEIsRUFBMkJILFFBQTNCLENBQW9DLE9BQXBDO0FBQ0E7QUFDRCxTQUxTLEVBS1AsSUFMTyxDQUFWO0FBTUEsT0FyQkQ7QUFzQkE7O0FBNUJzQjtBQUFBO0FBQUEsQ0FBeEI7QUErQkFYLENBQUMsQ0FBQ2UsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QmxCLEVBQUFBLGVBQWUsQ0FBQ0MsVUFBaEI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgTUlLTyBMTEMgLSBBbGwgUmlnaHRzIFJlc2VydmVkXG4gKiBVbmF1dGhvcml6ZWQgY29weWluZyBvZiB0aGlzIGZpbGUsIHZpYSBhbnkgbWVkaXVtIGlzIHN0cmljdGx5IHByb2hpYml0ZWRcbiAqIFByb3ByaWV0YXJ5IGFuZCBjb25maWRlbnRpYWxcbiAqIFdyaXR0ZW4gYnkgTmlrb2xheSBCZWtldG92LCAxMiAyMDE5XG4gKlxuICovXG5cbmNvbnN0IERlbGV0ZVNvbWV0aGluZyA9IHtcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQkKCcudHdvLXN0ZXBzLWRlbGV0ZScpLmNsb3Nlc3QoICd0ZCcgKS5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHR9KTtcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy50d28tc3RlcHMtZGVsZXRlJywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjb25zdCAkYnV0dG9uID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYScpO1xuXHRcdFx0Y29uc3QgJGljb24gPSAkYnV0dG9uLmZpbmQoJ2kudHJhc2gnKTtcblx0XHRcdGlmICgkYnV0dG9uLmhhc0NsYXNzKCdkaXNhYmxlZCcpKXtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0JGJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoJGJ1dHRvbi5sZW5ndGgpIHtcblx0XHRcdFx0XHQkYnV0dG9uLnJlbW92ZUNsYXNzKCd0d28tc3RlcHMtZGVsZXRlJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHRcdFx0JGljb24ucmVtb3ZlQ2xhc3MoJ3RyYXNoJykuYWRkQ2xhc3MoJ2Nsb3NlJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDIwMCk7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0aWYgKCRidXR0b24ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0JGJ1dHRvbi5hZGRDbGFzcygndHdvLXN0ZXBzLWRlbGV0ZScpO1xuXHRcdFx0XHRcdCRpY29uLnJlbW92ZUNsYXNzKCdjbG9zZScpLmFkZENsYXNzKCd0cmFzaCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAzMDAwKTtcblx0XHR9KTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0RGVsZXRlU29tZXRoaW5nLmluaXRpYWxpemUoKTtcbn0pO1xuIl19