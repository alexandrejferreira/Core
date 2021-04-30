"use strict";

/*
 * MikoPBX - free phone system for small business
 * Copyright (C) 2017-2020 Alexey Portnov and Nikolay Beketov
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

/* global sessionStorage, PbxApi */
var archivePackingCheckWorker = {
  timeOut: 3000,
  timeOutHandle: '',
  errorCounts: 0,
  filename: '',
  initialize: function () {
    function initialize(filename) {
      archivePackingCheckWorker.filename = filename;
      archivePackingCheckWorker.restartWorker(filename);
    }

    return initialize;
  }(),
  restartWorker: function () {
    function restartWorker() {
      window.clearTimeout(archivePackingCheckWorker.timeoutHandle);
      archivePackingCheckWorker.worker();
    }

    return restartWorker;
  }(),
  worker: function () {
    function worker() {
      PbxApi.SyslogDownloadLogsArchive(archivePackingCheckWorker.filename, archivePackingCheckWorker.cbAfterResponse);
      archivePackingCheckWorker.timeoutHandle = window.setTimeout(archivePackingCheckWorker.worker, archivePackingCheckWorker.timeOut);
    }

    return worker;
  }(),
  cbAfterResponse: function () {
    function cbAfterResponse(response) {
      if (archivePackingCheckWorker.errorCounts > 50) {
        UserMessage.showMultiString(globalTranslate.sd_DownloadPcapFileError);
        systemDiagnosticCapture.$stopBtn.removeClass('disabled loading').addClass('disabled');
        systemDiagnosticCapture.$startBtn.removeClass('disabled loading');
        window.clearTimeout(archivePackingCheckWorker.timeoutHandle);
      }

      if (response === undefined || Object.keys(response).length === 0) {
        archivePackingCheckWorker.errorCounts += 1;
        return;
      }

      if (response.status === 'READY') {
        systemDiagnosticCapture.$stopBtn.removeClass('disabled loading').addClass('disabled');
        systemDiagnosticCapture.$downloadBtn.removeClass('disabled loading');
        systemDiagnosticCapture.$startBtn.removeClass('disabled loading');
        window.location = response.filename;
        window.clearTimeout(archivePackingCheckWorker.timeoutHandle);
        systemDiagnosticCapture.$dimmer.removeClass('active');
      } else if (response.status !== undefined) {
        archivePackingCheckWorker.errorCounts = 0;
      } else {
        archivePackingCheckWorker.errorCounts += 1;
      }
    }

    return cbAfterResponse;
  }()
};
var systemDiagnosticCapture = {
  $startBtn: $('#start-capture-button'),
  $downloadBtn: $('#download-logs-button'),
  $stopBtn: $('#stop-capture-button'),
  $showBtn: $('#show-last-log'),
  $dimmer: $('#capture-log-dimmer'),
  initialize: function () {
    function initialize() {
      var segmentHeight = window.innerHeight - 300;
      $(window).load(function () {
        systemDiagnosticCapture.$dimmer.closest('div').css('min-height', "".concat(segmentHeight, "px"));
      });

      if (sessionStorage.getItem('LogsCaptureStatus') === 'started') {
        systemDiagnosticCapture.$startBtn.addClass('disabled loading');
        systemDiagnosticCapture.$stopBtn.removeClass('disabled');
      } else {
        systemDiagnosticCapture.$startBtn.removeClass('disabled loading');
        systemDiagnosticCapture.$stopBtn.addClass('disabled');
      }

      systemDiagnosticCapture.$startBtn.on('click', function (e) {
        e.preventDefault();
        systemDiagnosticCapture.$startBtn.addClass('disabled loading');
        systemDiagnosticCapture.$downloadBtn.addClass('disabled loading');
        systemDiagnosticCapture.$stopBtn.removeClass('disabled');
        PbxApi.SyslogStartLogsCapture(systemDiagnosticCapture.cbAfterStartCapture);
      });
      systemDiagnosticCapture.$stopBtn.on('click', function (e) {
        e.preventDefault();
        systemDiagnosticCapture.$startBtn.removeClass('loading');
        systemDiagnosticCapture.$stopBtn.addClass('loading');
        systemDiagnosticCapture.$dimmer.addClass('active');
        PbxApi.SyslogStopLogsCapture(systemDiagnosticCapture.cbAfterStopCapture);
      });

      systemDiagnosticCapture.$downloadBtn.on('click', (e) => {
        e.preventDefault();
        systemDiagnosticCapture.$downloadBtn.addClass('disabled loading');
        systemDiagnosticCapture.$startBtn.addClass('disabled loading');
        PbxApi.SyslogPrepareLog(systemDiagnosticCapture.cbAfterDownloadCapture);
      });
    }

    return initialize;
  }(),

  /**
   *  Callback after push start logs collect button
   * @param response
   */
  cbAfterStartCapture: function () {
    function cbAfterStartCapture(response) {
      if (response !== false) {
        sessionStorage.setItem('LogsCaptureStatus', 'started');
        setTimeout(function () {
          sessionStorage.setItem('LogsCaptureStatus', 'stopped');
        }, 300000);
      }
    }

    return cbAfterStartCapture;
  }(),

  /**
   * Callback after push stop logs collect button
   * @param response
   */
  cbAfterDownloadCapture: function () {
    function cbAfterStopCapture(response) {
      if (response !== false) {
        archivePackingCheckWorker.initialize(response.filename);
      }
    }

    return cbAfterStopCapture;
  }(),

  /**
   * Callback after push stop logs collect button
   * @param response
   */
  cbAfterStopCapture: function () {
    function cbAfterStopCapture(response) {
      if (response !== false) {
        archivePackingCheckWorker.initialize(response.filename);
      }
    }

    return cbAfterStopCapture;
  }()
};
$(document).ready(function () {
  systemDiagnosticCapture.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TeXN0ZW1EaWFnbm9zdGljL3N5c3RlbS1kaWFnbm9zdGljLWluZGV4LWxvZ2NhcHR1cmUuanMiXSwibmFtZXMiOlsiYXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlciIsInRpbWVPdXQiLCJ0aW1lT3V0SGFuZGxlIiwiZXJyb3JDb3VudHMiLCJmaWxlbmFtZSIsImluaXRpYWxpemUiLCJyZXN0YXJ0V29ya2VyIiwid2luZG93IiwiY2xlYXJUaW1lb3V0IiwidGltZW91dEhhbmRsZSIsIndvcmtlciIsIlBieEFwaSIsIlN5c2xvZ0Rvd25sb2FkTG9nc0FyY2hpdmUiLCJjYkFmdGVyUmVzcG9uc2UiLCJzZXRUaW1lb3V0IiwicmVzcG9uc2UiLCJVc2VyTWVzc2FnZSIsInNob3dNdWx0aVN0cmluZyIsImdsb2JhbFRyYW5zbGF0ZSIsInNkX0Rvd25sb2FkUGNhcEZpbGVFcnJvciIsInN5c3RlbURpYWdub3N0aWNDYXB0dXJlIiwiJHN0b3BCdG4iLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiJHN0YXJ0QnRuIiwidW5kZWZpbmVkIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInN0YXR1cyIsImxvY2F0aW9uIiwiJGRpbW1lciIsIiQiLCIkc2hvd0J0biIsInNlZ21lbnRIZWlnaHQiLCJpbm5lckhlaWdodCIsImxvYWQiLCJjbG9zZXN0IiwiY3NzIiwic2Vzc2lvblN0b3JhZ2UiLCJnZXRJdGVtIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJTeXNsb2dTdGFydExvZ3NDYXB0dXJlIiwiY2JBZnRlclN0YXJ0Q2FwdHVyZSIsIlN5c2xvZ1N0b3BMb2dzQ2FwdHVyZSIsImNiQWZ0ZXJTdG9wQ2FwdHVyZSIsInNldEl0ZW0iLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7QUFFQSxJQUFNQSx5QkFBeUIsR0FBRztBQUNqQ0MsRUFBQUEsT0FBTyxFQUFFLElBRHdCO0FBRWpDQyxF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cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCAoQykgMjAxNy0yMDIwIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG4vKiBnbG9iYWwgc2Vzc2lvblN0b3JhZ2UsIFBieEFwaSAqL1xuXG5jb25zdCBhcmNoaXZlUGFja2luZ0NoZWNrV29ya2VyID0ge1xuXHR0aW1lT3V0OiAzMDAwLFxuXHR0aW1lT3V0SGFuZGxlOiAnJyxcblx0ZXJyb3JDb3VudHM6IDAsXG5cdGZpbGVuYW1lOiAnJyxcblx0aW5pdGlhbGl6ZShmaWxlbmFtZSkge1xuXHRcdGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIuZmlsZW5hbWUgPSBmaWxlbmFtZTtcblx0XHRhcmNoaXZlUGFja2luZ0NoZWNrV29ya2VyLnJlc3RhcnRXb3JrZXIoZmlsZW5hbWUpO1xuXHR9LFxuXHRyZXN0YXJ0V29ya2VyKCkge1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoYXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHRhcmNoaXZlUGFja2luZ0NoZWNrV29ya2VyLndvcmtlcigpO1xuXHR9LFxuXHR3b3JrZXIoKSB7XG5cdFx0UGJ4QXBpLlN5c2xvZ0Rvd25sb2FkTG9nc0FyY2hpdmUoYXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci5maWxlbmFtZSwgYXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci5jYkFmdGVyUmVzcG9uc2UpO1xuXHRcdGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIudGltZW91dEhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KFxuXHRcdFx0YXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci53b3JrZXIsXG5cdFx0XHRhcmNoaXZlUGFja2luZ0NoZWNrV29ya2VyLnRpbWVPdXQsXG5cdFx0KTtcblx0fSxcblx0Y2JBZnRlclJlc3BvbnNlKHJlc3BvbnNlKSB7XG5cdFx0aWYgKGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgPiA1MCkge1xuXHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKGdsb2JhbFRyYW5zbGF0ZS5zZF9Eb3dubG9hZFBjYXBGaWxlRXJyb3IpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0b3BCdG5cblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdkaXNhYmxlZCBsb2FkaW5nJylcblx0XHRcdFx0LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0YXJ0QnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCBsb2FkaW5nJyk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIudGltZW91dEhhbmRsZSk7XG5cdFx0fVxuXHRcdGlmIChyZXNwb25zZSA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5rZXlzKHJlc3BvbnNlKS5sZW5ndGggPT09IDApIHtcblx0XHRcdGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgKz0gMTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gJ1JFQURZJykge1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0b3BCdG5cblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdkaXNhYmxlZCBsb2FkaW5nJylcblx0XHRcdFx0LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0YXJ0QnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCBsb2FkaW5nJyk7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24gPSByZXNwb25zZS5maWxlbmFtZTtcblx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoYXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRkaW1tZXIucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGFyY2hpdmVQYWNraW5nQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgPSAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhcmNoaXZlUGFja2luZ0NoZWNrV29ya2VyLmVycm9yQ291bnRzICs9IDE7XG5cdFx0fVxuXHR9LFxufTtcblxuY29uc3Qgc3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUgPSB7XG5cdCRzdGFydEJ0bjogJCgnI3N0YXJ0LWNhcHR1cmUtYnV0dG9uJyksXG5cdCRzdG9wQnRuOiAkKCcjc3RvcC1jYXB0dXJlLWJ1dHRvbicpLFxuXHQkc2hvd0J0bjogJCgnI3Nob3ctbGFzdC1sb2cnKSxcblx0JGRpbW1lcjogICQoJyNjYXB0dXJlLWxvZy1kaW1tZXInKSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRjb25zdCBzZWdtZW50SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0LTMwMDtcblx0XHQkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblx0XHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRkaW1tZXIuY2xvc2VzdCgnZGl2JykuY3NzKCdtaW4taGVpZ2h0JywgYCR7c2VnbWVudEhlaWdodH1weGApO1xuXHRcdH0pO1xuXHRcdGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdMb2dzQ2FwdHVyZVN0YXR1cycpID09PSAnc3RhcnRlZCcpIHtcblx0XHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRzdGFydEJ0bi5hZGRDbGFzcygnZGlzYWJsZWQgbG9hZGluZycpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0b3BCdG4ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRzdGFydEJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQgbG9hZGluZycpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0b3BCdG4uYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRzdGFydEJ0bi5vbignY2xpY2snLCAoZSkgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuJHN0YXJ0QnRuLmFkZENsYXNzKCdkaXNhYmxlZCBsb2FkaW5nJyk7XG5cdFx0XHRzeXN0ZW1EaWFnbm9zdGljQ2FwdHVyZS4kc3RvcEJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdFBieEFwaS5TeXNsb2dTdGFydExvZ3NDYXB0dXJlKHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLmNiQWZ0ZXJTdGFydENhcHR1cmUpO1xuXHRcdH0pO1xuXHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRzdG9wQnRuLm9uKCdjbGljaycsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRzeXN0ZW1EaWFnbm9zdGljQ2FwdHVyZS4kc3RhcnRCdG4ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdHN5c3RlbURpYWdub3N0aWNDYXB0dXJlLiRzdG9wQnRuLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRzeXN0ZW1EaWFnbm9zdGljQ2FwdHVyZS4kZGltbWVyLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdFBieEFwaS5TeXNsb2dTdG9wTG9nc0NhcHR1cmUoc3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuY2JBZnRlclN0b3BDYXB0dXJlKTtcblxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogIENhbGxiYWNrIGFmdGVyIHB1c2ggc3RhcnQgbG9ncyBjb2xsZWN0IGJ1dHRvblxuXHQgKiBAcGFyYW0gcmVzcG9uc2Vcblx0ICovXG5cdGNiQWZ0ZXJTdGFydENhcHR1cmUocmVzcG9uc2Upe1xuXHRcdGlmIChyZXNwb25zZSE9PWZhbHNlKSB7XG5cdFx0XHRzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdMb2dzQ2FwdHVyZVN0YXR1cycsICdzdGFydGVkJyk7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0c2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnTG9nc0NhcHR1cmVTdGF0dXMnLCAnc3RvcHBlZCcpO1xuXHRcdFx0fSwgMzAwMDAwKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBwdXNoIHN0b3AgbG9ncyBjb2xsZWN0IGJ1dHRvblxuXHQgKiBAcGFyYW0gcmVzcG9uc2Vcblx0ICovXG5cdGNiQWZ0ZXJTdG9wQ2FwdHVyZShyZXNwb25zZSl7XG5cdFx0aWYgKHJlc3BvbnNlIT09ZmFsc2Upe1xuXHRcdFx0YXJjaGl2ZVBhY2tpbmdDaGVja1dvcmtlci5pbml0aWFsaXplKHJlc3BvbnNlLmZpbGVuYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0c3lzdGVtRGlhZ25vc3RpY0NhcHR1cmUuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==