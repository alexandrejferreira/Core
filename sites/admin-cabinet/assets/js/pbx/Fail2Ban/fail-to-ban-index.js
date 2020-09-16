"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalTranslate, PbxApi, Form, globalRootUrl */
var fail2BanIndex = {
  $formObj: $('#fail2ban-settings-form'),
  $bannedIpList: $('#banned-ip-list'),
  $unbanButons: $('.unban-button'),
  $enableCheckBox: $('#fail2ban-switch'),
  validateRules: {
    maxretry: {
      identifier: 'maxretry',
      rules: [{
        type: 'integer[3..99]',
        prompt: globalTranslate.f2b_ValidateMaxRetryRange
      }]
    },
    findtime: {
      identifier: 'findtime',
      rules: [{
        type: 'integer[300..86400]',
        prompt: globalTranslate.f2b_ValidateFindTimeRange
      }]
    },
    bantime: {
      identifier: 'bantime',
      rules: [{
        type: 'integer[300..86400]',
        prompt: globalTranslate.f2b_ValidateBanTimeRange
      }]
    }
  },
  initialize: function () {
    function initialize() {
      PbxApi.SystemGetBannedIp(fail2BanIndex.cbGetBannedIpList);
      fail2BanIndex.$bannedIpList.on('click', fail2BanIndex.$unbanButons, function (e) {
        var unbannedIp = $(e.target).attr('data-value');
        PbxApi.SystemUnBanIp(unbannedIp, fail2BanIndex.cbAfterUnBanIp);
      });
      fail2BanIndex.$enableCheckBox.checkbox({
        onChange: function () {
          function onChange() {
            fail2BanIndex.changeFieldsLook();
          }

          return onChange;
        }()
      });
      fail2BanIndex.changeFieldsLook();
      fail2BanIndex.initializeForm();
    }

    return initialize;
  }(),
  changeFieldsLook: function () {
    function changeFieldsLook() {
      var checked = fail2BanIndex.$enableCheckBox.checkbox('is checked');
      fail2BanIndex.$formObj.find('.disability').each(function (index, obj) {
        if (checked) {
          $(obj).removeClass('disabled');
        } else {
          $(obj).addClass('disabled');
        }
      });
    }

    return changeFieldsLook;
  }(),
  cbGetBannedIpList: function () {
    function cbGetBannedIpList(response) {
      var htmlTable = "<h2 class=\"ui header\">".concat(globalTranslate.f2b_TableBannedHeader, "</h2>");
      htmlTable += '<table class="ui very compact table">';
      htmlTable += '<thead>';
      htmlTable += "<th>".concat(globalTranslate.f2b_Reason, "</th>");
      htmlTable += "<th>".concat(globalTranslate.f2b_IpAddres, "</th>");
      htmlTable += "<th>".concat(globalTranslate.f2b_BanedTime, "</th>");
      htmlTable += '<th></th>';
      htmlTable += '</thead>';
      htmlTable += '<tbody>';
      response.sort(function (a, b) {
        var keyA = a.timeofban;
        var keyB = b.timeofban; // Compare the 2 dates

        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
      $.each(response, function (key, value) {
        var blockDate = new Date(value.timeofban * 1000);
        var reason = "f2b_Jail_".concat(value.jail);

        if (reason in globalTranslate) {
          reason = globalTranslate[reason];
        }

        htmlTable += '<tr>';
        htmlTable += "<td>".concat(reason, "</td>");
        htmlTable += "<td>".concat(value.ip, "</td>");
        htmlTable += "<td>".concat(blockDate.toLocaleString(), "</td>");
        htmlTable += "<td class=\"right aligned collapsing\"><button class=\"ui icon basic mini button unban-button\" data-value=\"".concat(value.ip, "\"><i class=\"icon trash red\"></i>").concat(globalTranslate.f2b_Unban, "</button></td>");
        htmlTable += '</tr>';
      });

      if (response.length === 0) {
        htmlTable += "<tr><td colspan=\"4\" class=\"center aligned\">".concat(globalTranslate.f2b_TableBannedEmpty, "</td></tr>");
      }

      htmlTable += '<tbody>';
      htmlTable += '</table>';
      fail2BanIndex.$bannedIpList.html(htmlTable);
    }

    return cbGetBannedIpList;
  }(),
  cbAfterUnBanIp: function () {
    function cbAfterUnBanIp() {
      PbxApi.SystemGetBannedIp(fail2BanIndex.cbGetBannedIpList);
    }

    return cbAfterUnBanIp;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = fail2BanIndex.$formObj.form('get values');
      return result;
    }

    return cbBeforeSendForm;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = fail2BanIndex.$formObj;
      Form.url = "".concat(globalRootUrl, "fail2-ban/save");
      Form.validateRules = fail2BanIndex.validateRules;
      Form.cbBeforeSendForm = fail2BanIndex.cbBeforeSendForm;
      Form.cbAfterSendForm = fail2BanIndex.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};
$(document).ready(function () {
  fail2BanIndex.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9GYWlsMkJhbi9mYWlsLXRvLWJhbi1pbmRleC5qcyJdLCJuYW1lcyI6WyJmYWlsMkJhbkluZGV4IiwiJGZvcm1PYmoiLCIkIiwiJGJhbm5lZElwTGlzdCIsIiR1bmJhbkJ1dG9ucyIsIiRlbmFibGVDaGVja0JveCIsInZhbGlkYXRlUnVsZXMiLCJtYXhyZXRyeSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJmMmJfVmFsaWRhdGVNYXhSZXRyeVJhbmdlIiwiZmluZHRpbWUiLCJmMmJfVmFsaWRhdGVGaW5kVGltZVJhbmdlIiwiYmFudGltZSIsImYyYl9WYWxpZGF0ZUJhblRpbWVSYW5nZSIsImluaXRpYWxpemUiLCJQYnhBcGkiLCJTeXN0ZW1HZXRCYW5uZWRJcCIsImNiR2V0QmFubmVkSXBMaXN0Iiwib24iLCJlIiwidW5iYW5uZWRJcCIsInRhcmdldCIsImF0dHIiLCJTeXN0ZW1VbkJhbklwIiwiY2JBZnRlclVuQmFuSXAiLCJjaGVja2JveCIsIm9uQ2hhbmdlIiwiY2hhbmdlRmllbGRzTG9vayIsImluaXRpYWxpemVGb3JtIiwiY2hlY2tlZCIsImZpbmQiLCJlYWNoIiwiaW5kZXgiLCJvYmoiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwicmVzcG9uc2UiLCJodG1sVGFibGUiLCJmMmJfVGFibGVCYW5uZWRIZWFkZXIiLCJmMmJfUmVhc29uIiwiZjJiX0lwQWRkcmVzIiwiZjJiX0JhbmVkVGltZSIsInNvcnQiLCJhIiwiYiIsImtleUEiLCJ0aW1lb2ZiYW4iLCJrZXlCIiwia2V5IiwidmFsdWUiLCJibG9ja0RhdGUiLCJEYXRlIiwicmVhc29uIiwiamFpbCIsImlwIiwidG9Mb2NhbGVTdHJpbmciLCJmMmJfVW5iYW4iLCJsZW5ndGgiLCJmMmJfVGFibGVCYW5uZWRFbXB0eSIsImh0bWwiLCJjYkJlZm9yZVNlbmRGb3JtIiwic2V0dGluZ3MiLCJyZXN1bHQiLCJkYXRhIiwiZm9ybSIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFRQTtBQUVBLElBQU1BLGFBQWEsR0FBRztBQUNyQkMsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMseUJBQUQsQ0FEVTtBQUVyQkMsRUFBQUEsYUFBYSxFQUFFRCxDQUFDLENBQUMsaUJBQUQsQ0FGSztBQUdyQkUsRUFBQUEsWUFBWSxFQUFFRixDQUFDLENBQUMsZUFBRCxDQUhNO0FBSXJCRyxFQUFBQSxlQUFlLEVBQUVILENBQUMsQ0FBQyxrQkFBRCxDQUpHO0FBS3JCSSxFQUFBQSxhQUFhLEVBQUU7QUFDZEMsSUFBQUEsUUFBUSxFQUFFO0FBQ1RDLE1BQUFBLFVBQVUsRUFBRSxVQURIO0FBRVRDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxnQkFEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ0M7QUFGekIsT0FETTtBQUZFLEtBREk7QUFVZEMsSUFBQUEsUUFBUSxFQUFFO0FBQ1ROLE1BQUFBLFVBQVUsRUFBRSxVQURIO0FBRVRDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxxQkFEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ0c7QUFGekIsT0FETTtBQUZFLEtBVkk7QUFtQmRDLElBQUFBLE9BQU8sRUFBRTtBQUNSUixNQUFBQSxVQUFVLEVBQUUsU0FESjtBQUVSQyxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDQyxRQUFBQSxJQUFJLEVBQUUscUJBRFA7QUFFQ0MsUUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUNLO0FBRnpCLE9BRE07QUFGQztBQW5CSyxHQUxNO0FBbUNyQkMsRUFBQUEsVUFuQ3FCO0FBQUEsMEJBbUNSO0FBQ1pDLE1BQUFBLE1BQU0sQ0FBQ0MsaUJBQVAsQ0FBeUJwQixhQUFhLENBQUNxQixpQkFBdkM7QUFD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Q2hCc0MsTUFBQUEsSUFBSSxDQUFDckUsUUFBTCxHQUFnQkQsYUFBYSxDQUFDQyxRQUE5QjtBQUNBcUUsTUFBQUEsSUFBSSxDQUFDQyxHQUFMLGFBQWNDLGFBQWQ7QUFDQUYsTUFBQUEsSUFBSSxDQUFDaEUsYUFBTCxHQUFxQk4sYUFBYSxDQUFDTSxhQUFuQztBQUNBZ0UsTUFBQUEsSUFBSSxDQUFDTixnQkFBTCxHQUF3QmhFLGFBQWEsQ0FBQ2dFLGdCQUF0QztBQUNBTSxNQUFBQSxJQUFJLENBQUNELGVBQUwsR0FBdUJyRSxhQUFhLENBQUNxRSxlQUFyQztBQUNBQyxNQUFBQSxJQUFJLENBQUNwRCxVQUFMO0FBQ0E7O0FBckhvQjtBQUFBO0FBQUEsQ0FBdEI7QUF1SEFoQixDQUFDLENBQUN1RSxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCMUUsRUFBQUEsYUFBYSxDQUFDa0IsVUFBZDtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChDKSBNSUtPIExMQyAtIEFsbCBSaWdodHMgUmVzZXJ2ZWRcbiAqIFVuYXV0aG9yaXplZCBjb3B5aW5nIG9mIHRoaXMgZmlsZSwgdmlhIGFueSBtZWRpdW0gaXMgc3RyaWN0bHkgcHJvaGliaXRlZFxuICogUHJvcHJpZXRhcnkgYW5kIGNvbmZpZGVudGlhbFxuICogV3JpdHRlbiBieSBOaWtvbGF5IEJla2V0b3YsIDEyIDIwMTlcbiAqXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFRyYW5zbGF0ZSwgUGJ4QXBpLCBGb3JtLCBnbG9iYWxSb290VXJsICovXG5cbmNvbnN0IGZhaWwyQmFuSW5kZXggPSB7XG5cdCRmb3JtT2JqOiAkKCcjZmFpbDJiYW4tc2V0dGluZ3MtZm9ybScpLFxuXHQkYmFubmVkSXBMaXN0OiAkKCcjYmFubmVkLWlwLWxpc3QnKSxcblx0JHVuYmFuQnV0b25zOiAkKCcudW5iYW4tYnV0dG9uJyksXG5cdCRlbmFibGVDaGVja0JveDogJCgnI2ZhaWwyYmFuLXN3aXRjaCcpLFxuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0bWF4cmV0cnk6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdtYXhyZXRyeScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2ludGVnZXJbMy4uOTldJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5mMmJfVmFsaWRhdGVNYXhSZXRyeVJhbmdlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGZpbmR0aW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnZmluZHRpbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdpbnRlZ2VyWzMwMC4uODY0MDBdJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5mMmJfVmFsaWRhdGVGaW5kVGltZVJhbmdlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGJhbnRpbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYW50aW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnaW50ZWdlclszMDAuLjg2NDAwXScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZjJiX1ZhbGlkYXRlQmFuVGltZVJhbmdlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0UGJ4QXBpLlN5c3RlbUdldEJhbm5lZElwKGZhaWwyQmFuSW5kZXguY2JHZXRCYW5uZWRJcExpc3QpO1xuXHRcdGZhaWwyQmFuSW5kZXguJGJhbm5lZElwTGlzdC5vbignY2xpY2snLCBmYWlsMkJhbkluZGV4LiR1bmJhbkJ1dG9ucywgKGUpID0+IHtcblx0XHRcdGNvbnN0IHVuYmFubmVkSXAgPSAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRQYnhBcGkuU3lzdGVtVW5CYW5JcCh1bmJhbm5lZElwLCBmYWlsMkJhbkluZGV4LmNiQWZ0ZXJVbkJhbklwKTtcblx0XHR9KTtcblxuXHRcdGZhaWwyQmFuSW5kZXguJGVuYWJsZUNoZWNrQm94LmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlKCkge1xuXHRcdFx0XHRmYWlsMkJhbkluZGV4LmNoYW5nZUZpZWxkc0xvb2soKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdFx0ZmFpbDJCYW5JbmRleC5jaGFuZ2VGaWVsZHNMb29rKCk7XG5cdFx0ZmFpbDJCYW5JbmRleC5pbml0aWFsaXplRm9ybSgpO1xuXHR9LFxuXHRjaGFuZ2VGaWVsZHNMb29rKCkge1xuXHRcdGNvbnN0IGNoZWNrZWQgPSBmYWlsMkJhbkluZGV4LiRlbmFibGVDaGVja0JveC5jaGVja2JveCgnaXMgY2hlY2tlZCcpO1xuXHRcdGZhaWwyQmFuSW5kZXguJGZvcm1PYmouZmluZCgnLmRpc2FiaWxpdHknKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRpZiAoY2hlY2tlZCkge1xuXHRcdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNiR2V0QmFubmVkSXBMaXN0KHJlc3BvbnNlKSB7XG5cdFx0bGV0IGh0bWxUYWJsZSA9IGA8aDIgY2xhc3M9XCJ1aSBoZWFkZXJcIj4ke2dsb2JhbFRyYW5zbGF0ZS5mMmJfVGFibGVCYW5uZWRIZWFkZXJ9PC9oMj5gO1xuXHRcdGh0bWxUYWJsZSArPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHRhYmxlXCI+Jztcblx0XHRodG1sVGFibGUgKz0gJzx0aGVhZD4nO1xuXHRcdGh0bWxUYWJsZSArPSBgPHRoPiR7Z2xvYmFsVHJhbnNsYXRlLmYyYl9SZWFzb259PC90aD5gO1xuXHRcdGh0bWxUYWJsZSArPSBgPHRoPiR7Z2xvYmFsVHJhbnNsYXRlLmYyYl9JcEFkZHJlc308L3RoPmA7XG5cdFx0aHRtbFRhYmxlICs9IGA8dGg+JHtnbG9iYWxUcmFuc2xhdGUuZjJiX0JhbmVkVGltZX08L3RoPmA7XG5cdFx0aHRtbFRhYmxlICs9ICc8dGg+PC90aD4nO1xuXHRcdGh0bWxUYWJsZSArPSAnPC90aGVhZD4nO1xuXHRcdGh0bWxUYWJsZSArPSAnPHRib2R5Pic7XG5cdFx0cmVzcG9uc2Uuc29ydCgoYSwgYikgPT4ge1xuXHRcdFx0Y29uc3Qga2V5QSA9IGEudGltZW9mYmFuO1xuXHRcdFx0Y29uc3Qga2V5QiA9IGIudGltZW9mYmFuO1xuXHRcdFx0Ly8gQ29tcGFyZSB0aGUgMiBkYXRlc1xuXHRcdFx0aWYgKGtleUEgPCBrZXlCKSByZXR1cm4gMTtcblx0XHRcdGlmIChrZXlBID4ga2V5QikgcmV0dXJuIC0xO1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSk7XG5cdFx0JC5lYWNoKHJlc3BvbnNlLCAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0Y29uc3QgYmxvY2tEYXRlID0gbmV3IERhdGUodmFsdWUudGltZW9mYmFuICogMTAwMCk7XG5cdFx0XHRsZXQgcmVhc29uID0gYGYyYl9KYWlsXyR7dmFsdWUuamFpbH1gO1xuXHRcdFx0aWYgKHJlYXNvbiBpbiBnbG9iYWxUcmFuc2xhdGUpIHtcblx0XHRcdFx0cmVhc29uID0gZ2xvYmFsVHJhbnNsYXRlW3JlYXNvbl07XG5cdFx0XHR9XG5cblx0XHRcdGh0bWxUYWJsZSArPSAnPHRyPic7XG5cdFx0XHRodG1sVGFibGUgKz0gYDx0ZD4ke3JlYXNvbn08L3RkPmA7XG5cdFx0XHRodG1sVGFibGUgKz0gYDx0ZD4ke3ZhbHVlLmlwfTwvdGQ+YDtcblx0XHRcdGh0bWxUYWJsZSArPSBgPHRkPiR7YmxvY2tEYXRlLnRvTG9jYWxlU3RyaW5nKCl9PC90ZD5gO1xuXHRcdFx0aHRtbFRhYmxlICs9IGA8dGQgY2xhc3M9XCJyaWdodCBhbGlnbmVkIGNvbGxhcHNpbmdcIj48YnV0dG9uIGNsYXNzPVwidWkgaWNvbiBiYXNpYyBtaW5pIGJ1dHRvbiB1bmJhbi1idXR0b25cIiBkYXRhLXZhbHVlPVwiJHt2YWx1ZS5pcH1cIj48aSBjbGFzcz1cImljb24gdHJhc2ggcmVkXCI+PC9pPiR7Z2xvYmFsVHJhbnNsYXRlLmYyYl9VbmJhbn08L2J1dHRvbj48L3RkPmA7XG5cdFx0XHRodG1sVGFibGUgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRpZiAocmVzcG9uc2UubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRodG1sVGFibGUgKz0gYDx0cj48dGQgY29sc3Bhbj1cIjRcIiBjbGFzcz1cImNlbnRlciBhbGlnbmVkXCI+JHtnbG9iYWxUcmFuc2xhdGUuZjJiX1RhYmxlQmFubmVkRW1wdHl9PC90ZD48L3RyPmA7XG5cdFx0fVxuXHRcdGh0bWxUYWJsZSArPSAnPHRib2R5Pic7XG5cdFx0aHRtbFRhYmxlICs9ICc8L3RhYmxlPic7XG5cdFx0ZmFpbDJCYW5JbmRleC4kYmFubmVkSXBMaXN0Lmh0bWwoaHRtbFRhYmxlKTtcblx0fSxcblx0Y2JBZnRlclVuQmFuSXAoKSB7XG5cdFx0UGJ4QXBpLlN5c3RlbUdldEJhbm5lZElwKGZhaWwyQmFuSW5kZXguY2JHZXRCYW5uZWRJcExpc3QpO1xuXHR9LFxuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBmYWlsMkJhbkluZGV4LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cblx0fSxcblx0aW5pdGlhbGl6ZUZvcm0oKSB7XG5cdFx0Rm9ybS4kZm9ybU9iaiA9IGZhaWwyQmFuSW5kZXguJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfWZhaWwyLWJhbi9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBmYWlsMkJhbkluZGV4LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gZmFpbDJCYW5JbmRleC5jYkJlZm9yZVNlbmRGb3JtO1xuXHRcdEZvcm0uY2JBZnRlclNlbmRGb3JtID0gZmFpbDJCYW5JbmRleC5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRmYWlsMkJhbkluZGV4LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=