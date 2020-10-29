"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl, globalTranslate */
var Form = {
  $formObj: '',
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
  initialize: function () {
    function initialize() {
      if (Form.enableDirrity) Form.initializeDirrity();
      Form.$submitButton.on('click', function (e) {
        e.preventDefault();
        if (Form.$submitButton.hasClass('loading')) return;
        if (Form.$submitButton.hasClass('disabled')) return;
        Form.$formObj.form({
          on: 'blur',
          fields: Form.validateRules,
          onSuccess: function () {
            function onSuccess() {
              Form.submitForm();
            }

            return onSuccess;
          }(),
          onFailure: function () {
            function onFailure() {
              Form.$formObj.removeClass('error').addClass('error');
            }

            return onFailure;
          }()
        });
        Form.$formObj.form('validate form');
      });

      if (Form.$dropdownSubmit.length > 0) {
        Form.$dropdownSubmit.dropdown({
          onChange: function () {
            function onChange(value) {
              var translateKey = "bt_".concat(value);
              Form.$submitModeInput.val(value);
              Form.$submitButton.html("<i class=\"save icon\"></i> ".concat(globalTranslate[translateKey])).click();
            }

            return onChange;
          }()
        });
      }

      Form.$formObj.on('submit', function (e) {
        e.preventDefault();
      });
    }

    return initialize;
  }(),

  /**
   * Инициализация отслеживания изменений формы
   */
  initializeDirrity: function () {
    function initializeDirrity() {
      Form.saveInitialValues();
      Form.setEvents();
      Form.$submitButton.addClass('disabled');
      Form.$dropdownSubmit.addClass('disabled');
    }

    return initializeDirrity;
  }(),

  /**
   * Сохраняет первоначальные значения для проверки на изменения формы
   */
  saveInitialValues: function () {
    function saveInitialValues() {
      Form.oldFormValues = Form.$formObj.form('get values');
    }

    return saveInitialValues;
  }(),

  /**
   * Запускает обработчики изменения объектов формы
   */
  setEvents: function () {
    function setEvents() {
      Form.$formObj.find('input, select').change(function () {
        Form.checkValues();
      });
      Form.$formObj.find('input, textarea').on('keyup keydown blur', function () {
        Form.checkValues();
      });
      Form.$formObj.find('.ui.checkbox').on('click', function () {
        Form.checkValues();
      });
    }

    return setEvents;
  }(),

  /**
   * Сверяет изменения старых и новых значений формы
   */
  checkValues: function () {
    function checkValues() {
      var newFormValues = Form.$formObj.form('get values');

      if (JSON.stringify(Form.oldFormValues) === JSON.stringify(newFormValues)) {
        Form.$submitButton.addClass('disabled');
        Form.$dropdownSubmit.addClass('disabled');
      } else {
        Form.$submitButton.removeClass('disabled');
        Form.$dropdownSubmit.removeClass('disabled');
      }
    }

    return checkValues;
  }(),

  /**
   * Отправка формы на сервер
   */
  submitForm: function () {
    function submitForm() {
      $.api({
        url: Form.url,
        on: 'now',
        method: 'POST',
        processData: Form.processData,
        contentType: Form.contentType,
        keyboardShortcuts: Form.keyboardShortcuts,
        beforeSend: function () {
          function beforeSend(settings) {
            Form.$submitButton.addClass('loading');
            var cbBeforeSendResult = Form.cbBeforeSendForm(settings);

            if (cbBeforeSendResult === false) {
              Form.$submitButton.transition('shake').removeClass('loading');
            } else {
              $.each(cbBeforeSendResult.data, function (index, value) {
                if (index.indexOf('ecret') > -1 || index.indexOf('assword') > -1) return;
                if (typeof value === 'string') cbBeforeSendResult.data[index] = value.trim();
              });
            }

            return cbBeforeSendResult;
          }

          return beforeSend;
        }(),
        onSuccess: function () {
          function onSuccess(response) {
            $('.ui.message.ajax').remove();
            $.each(response.message, function (index, value) {
              if (index === 'error') {
                Form.$submitButton.transition('shake').removeClass('loading');
                Form.$formObj.after("<div class=\"ui ".concat(index, " message ajax\">").concat(value, "</div>"));
              }
            });
            var event = document.createEvent('Event');
            event.initEvent('ConfigDataChanged', false, true);
            window.dispatchEvent(event);
            Form.cbAfterSendForm(response);

            if (response.success && response.reload.length > 0 && Form.$submitModeInput.val() === 'SaveSettings') {
              window.location = globalRootUrl + response.reload;
            } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndAddNew') {
              if (Form.afterSubmitModifyUrl.length > 1) {
                window.location = Form.afterSubmitModifyUrl;
              } else {
                var emptyUrl = window.location.href.split('modify');

                if (emptyUrl.length > 1) {
                  window.location = "".concat(emptyUrl[0], "modify/");
                }
              }
            } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndExit') {
              if (Form.afterSubmitIndexUrl.length > 1) {
                window.location = Form.afterSubmitIndexUrl;
              } else {
                var _emptyUrl = window.location.href.split('modify');

                if (_emptyUrl.length > 1) {
                  window.location = "".concat(_emptyUrl[0], "index/");
                }
              }
            } else if (response.success && response.reload.length > 0) {
              window.location = globalRootUrl + response.reload;
            } else if (Form.enableDirrity) {
              Form.initializeDirrity();
            }

            Form.$submitButton.removeClass('loading');
          }

          return onSuccess;
        }(),
        onFailure: function () {
          function onFailure(response) {
            Form.$formObj.after(response);
            Form.$submitButton.transition('shake').removeClass('loading');
          }

          return onFailure;
        }()
      });
    }

    return submitForm;
  }()
}; // export default Form;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2Zvcm0uanMiXSwibmFtZXMiOlsiRm9ybSIsIiRmb3JtT2JqIiwidmFsaWRhdGVSdWxlcyIsInVybCIsImNiQmVmb3JlU2VuZEZvcm0iLCJjYkFmdGVyU2VuZEZvcm0iLCIkc3VibWl0QnV0dG9uIiwiJCIsIiRkcm9wZG93blN1Ym1pdCIsIiRzdWJtaXRNb2RlSW5wdXQiLCJwcm9jZXNzRGF0YSIsImNvbnRlbnRUeXBlIiwia2V5Ym9hcmRTaG9ydGN1dHMiLCJlbmFibGVEaXJyaXR5IiwiYWZ0ZXJTdWJtaXRJbmRleFVybCIsImFmdGVyU3VibWl0TW9kaWZ5VXJsIiwib2xkRm9ybVZhbHVlcyIsImluaXRpYWxpemUiLCJpbml0aWFsaXplRGlycml0eSIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFzQ2xhc3MiLCJmb3JtIiwiZmllbGRzIiwib25TdWNjZXNzIiwic3VibWl0Rm9ybSIsIm9uRmFpbHVyZSIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJsZW5ndGgiLCJkcm9wZG93biIsIm9uQ2hhbmdlIiwidmFsdWUiLCJ0cmFuc2xhdGVLZXkiLCJ2YWwiLCJodG1sIiwiZ2xvYmFsVHJhbnNsYXRlIiwiY2xpY2siLCJzYXZlSW5pdGlhbFZhbHVlcyIsInNldEV2ZW50cyIsImZpbmQiLCJjaGFuZ2UiLCJjaGVja1ZhbHVlcyIsIm5ld0Zvcm1WYWx1ZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiYXBpIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiY2JCZWZvcmVTZW5kUmVzdWx0IiwidHJhbnNpdGlvbiIsImVhY2giLCJkYXRhIiwiaW5kZXgiLCJpbmRleE9mIiwidHJpbSIsInJlc3BvbnNlIiwicmVtb3ZlIiwibWVzc2FnZSIsImFmdGVyIiwiZXZlbnQiLCJkb2N1bWVudCIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50Iiwid2luZG93IiwiZGlzcGF0Y2hFdmVudCIsInN1Y2Nlc3MiLCJyZWxvYWQiLCJsb2NhdGlvbiIsImdsb2JhbFJvb3RVcmwiLCJlbXB0eVVybCIsImhyZWYiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFRQTtBQUVBLElBQU1BLElBQUksR0FBRztBQUNaQyxFQUFBQSxRQUFRLEVBQUUsRUFERTtBQUVaQyxFQUFBQSxhQUFhLEVBQUUsRUFGSDtBQUdaQyxFQUFBQSxHQUFHLEVBQUUsRUFITztBQUlaQyxFQUFBQSxnQkFBZ0IsRUFBRSxFQUpOO0FBS1pDLEVBQUFBLGVBQWUsRUFBRSxFQUxMO0FBTVpDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLGVBQUQsQ0FOSjtBQU9aQyxFQUFBQSxlQUFlLEVBQUVELENBQUMsQ0FBQyxpQkFBRCxDQVBOO0FBUVpFLEVBQUFBLGdCQUFnQixFQUFFRixDQUFDLENBQUMsMEJBQUQsQ0FSUDtBQVNaRyxFQUFBQSxXQUFXLEVBQUUsSUFURDtBQVVaQyxFQUFBQSxXQUFXLEVBQUUsa0RBVkQ7QUFXWkMsRUFBQUEsaUJBQWlCLEVBQUUsSUFYUDtBQVlaQyxFQUFBQSxhQUFhLEVBQUUsSUFaSDtBQWFaQyxFQUFBQSxtQkFBbUIsRUFBRSxFQWJUO0FBY1pDLEVBQUFBLG9CQUFvQixFQUFFLEVBZFY7QUFlWkMsRUFBQUEsYUFBYSxFQUFFLEVBZkg7QUFnQlpDLEVBQUFBLFVBaEJZO0FBQUEsMEJBZ0JDO0FBQ1osVUFBSWpCLElBQUksQ0FBQ2EsYUFBVCxFQUF3QmIsSUFBSSxDQUFDa0IsaUJBQUw7QUFFeEJsQixNQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJhLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLFVBQUNDLENBQUQsRUFBTztBQUNyQ0EsUUFBQUEsQ0FBQyxDQUFDQyxjQUFGO0FBQ0EsWUFBSXJCLElBQUksQ0FBQ00sYUFBTCxDQUFtQmdCLFFBQW5CLENBQTRCLFNBQTVCLENBQUosRUFBNEM7QUFDNUMsWUFBSXRCLElBQUksQ0FBQ00sYUFBTCxDQUFtQmdCLFFBQW5CLENBQTRCLFVBQTVCLENBQUosRUFBNkM7QUFDN0N0QixRQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FDRXNCLElBREYsQ0FDTztBQUNMSixVQUFBQSxFQUFFLEVBQUUsTUFEQztBQUVMSyxVQUFBQSxNQUFNLEVBQUV4QixJQUFJLENBQUNFLGFBRlI7QUFHTHVCLFVBQUFBLFNBSEs7QUFBQSxpQ0FHTztBQUNYekIsY0FBQUEsSUFBSSxDQUFDMEIsVUFBTDtBQUNBOztBQUxJO0FBQUE7QUFNTEMsVUFBQUEsU0FOSztBQUFBLGlDQU1PO0FBQ1gzQixjQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FBYzJCLFdBQWQsQ0FBMEIsT0FBMUIsRUFBbUNDLFFBQW5DLENBQTRDLE9BQTVDO0FBQ0E7O0FBUkk7QUFBQTtBQUFBLFNBRFA7QUFXQTdCLFFBQUFBLElBQUksQ0FBQ0MsUUFBTCxDQUFjc0IsSUFBZCxDQUFtQixlQUFuQjtBQUNBLE9BaEJEOztBQWlCQSxVQUFJdkIsSUFBSSxDQUFDUSxlQUFMLENBQXFCc0IsTUFBckIsR0FBOEIsQ0FBbEMsRUFBcUM7QUFDcEM5QixRQUFBQSxJQUFJLENBQUNRLGVBQUwsQ0FBcUJ1QixRQUFyQixDQUE4QjtBQUM3QkMsVUFBQUEsUUFBUTtBQUFFLDhCQUFDQyxLQUFELEVBQVc7QUFDcEIsa0JBQU1DLFlBQVksZ0JBQVNELEtBQVQsQ0FBbEI7QUFDQWpDLGNBQUFBLElBQUksQ0FBQ1MsZ0JBQUwsQ0FBc0IwQixHQUF0QixDQUEwQkYsS0FBMUI7QUFDQWpDLGNBQUFBLElBQUksQ0FBQ00sYUFBTCxDQUNFOEIsSUFERix1Q0FDb0NDLGVBQWUsQ0FBQ0gsWUFBRCxDQURuRCxHQUVFSSxLQUZGO0FBR0E7O0FBTk87QUFBQTtBQURxQixTQUE5QjtBQVNBOztBQUNEdEMsTUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWNrQixFQUFkLENBQWlCLFFBQWpCLEVBQTJCLFVBQUNDLENBQUQsRUFBTztBQUNqQ0EsUUFBQUEsQ0FBQyxDQUFDQyxjQUFGO0FBQ0EsT0FGRDtBQUdBOztBQWxEVztBQUFBOztBQW1EWjs7O0FBR0FILEVBQUFBLGlCQXREWTtBQUFBLGlDQXNEUTtBQUNuQmxCLE1BQUFBLElBQUksQ0FBQ3VDLGlCQUFMO0FBQ0F2QyxNQUFBQSxJQUFJLENBQUN3QyxTQUFMO0FBQ0F4QyxNQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJ1QixRQUFuQixDQUE0QixVQUE1QjtBQUNBN0IsTUFBQUEsSUFBSSxDQUFDUSxlQUFMLENBQXFCcUIsUUFBckIsQ0FBOEIsVUFBOUI7QUFDQTs7QUEzRFc7QUFBQTs7QUE0RFo7OztBQUdBVSxFQUFBQSxpQkEvRFk7QUFBQSxpQ0ErRFE7QUFDbkJ2QyxNQUFBQSxJQUFJLENBQUNnQixhQUFMLEdBQXFCaEIsSUFBSSxDQUFDQyxRQUFMLENBQWNzQixJQUFkLENBQW1CLFlBQW5CLENBQXJCO0FBQ0E7O0FBakVXO0FBQUE7O0FBa0VaOzs7QUFHQWlCLEVBQUFBLFNBckVZO0FBQUEseUJBcUVBO0FBQ1h4QyxNQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FBY3dDLElBQWQsQ0FBbUIsZUFBbkIsRUFBb0NDLE1BQXBDLENBQTJDLFlBQU07QUFDaEQxQyxRQUFBQSxJQUFJLENBQUMyQyxXQUFMO0FBQ0EsT0FGRDtBQUdBM0MsTUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWN3QyxJQUFkLENBQW1CLGlCQUFuQixFQUFzQ3RCLEVBQXRDLENBQXlDLG9CQUF6QyxFQUErRCxZQUFNO0FBQ3BFbkIsUUFBQUEsSUFBSSxDQUFDMkMsV0FBTDtBQUNBLE9BRkQ7QUFHQTNDLE1BQUFBLElBQUksQ0FBQ0MsUUFBTCxDQUFjd0MsSUFBZCxDQUFtQixjQUFuQixFQUFtQ3RCLEVBQW5DLENBQXNDLE9BQXRDLEVBQStDLFlBQU07QUFDcERuQixRQUFBQSxJQUFJLENBQUMyQyxXQUFMO0FBQ0EsT0FGRDtBQUdBOztBQS9FVztBQUFBOztBQWdGWjs7O0FBR0FBLEVBQUFBLFdBbkZZO0FBQUEsMkJBbUZFO0FBQ2IsVUFBTUMsYUFBYSxHQUFHNUMsSUFBSSxDQUFDQyxRQUFMLENBQWNzQixJQUFkLENBQW1CLFlBQW5CLENBQXRCOztBQUNBLFVBQUlzQixJQUFJLENBQUNDLFNBQUwsQ0FBZTlDLElBQUksQ0FBQ2dCLGFBQXBCLE1BQXVDNkIsSUFBSSxDQUFDQyxTQUFMLENBQWVGLGFBQWYsQ0FBM0MsRUFBMEU7QUFDekU1QyxRQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJ1QixRQUFuQixDQUE0QixVQUE1QjtBQUNBN0IsUUFBQUEsSUFBSSxDQUFDUSxlQUFMLENBQXFCcUIsUUFBckIsQ0FBOEIsVUFBOUI7QUFDQSxPQUhELE1BR087QUFDTjdCLFFBQUFBLElBQUksQ0FBQ00sYUFBTCxDQUFtQnNCLFdBQW5CLENBQStCLFVBQS9CO0FBQ0E1QixRQUFBQSxJQUFJLENBQUNRLGVBQUwsQ0FBcUJvQixXQUFyQixDQUFpQyxVQUFqQztBQUNBO0FBQ0Q7O0FBNUZXO0FBQUE7O0FBNkZaOzs7QUFHQUYsRUFBQUEsVUFoR1k7QUFBQSwwQkFnR0M7QUFDWm5CLE1BQUFBLENBQUMsQ0FBQ3dDLEdBQUYsQ0FBTTtBQUNMNUMsUUFBQUEsR0FBRyxFQUFFSCxJQUFJLENBQUNHLEdBREw7QUFFTGdCLFFBQUFBLEVBQUUsRUFBRSxLQUZDO0FBR0w2QixRQUFBQSxNQUFNLEVBQUUsTUFISDtBQUlMdEMsUUFBQUEsV0FBVyxFQUFFVixJQUFJLENBQUNVLFdBSmI7QUFLTEMsUUFBQUEsV0FBVyxFQUFFWCxJQUFJLENBQUNXLFdBTGI7QUFNTEMsUUFBQUEsaUJBQWlCLEVBQUVaLElBQUksQ0FBQ1ksaUJBTm5CO0FBT0xxQyxRQUFBQSxVQVBLO0FBQUEsOEJBT01DLFFBUE4sRUFPZ0I7QUFDcEJsRCxZQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJ1QixRQUFuQixDQUE0QixTQUE1QjtBQUNBLGdCQUFNc0Isa0JBQWtCLEdBQUduRCxJQUFJLENBQUNJLGdCQUFMLENBQXNCOEMsUUFBdEIsQ0FBM0I7O0FBQ0EsZ0JBQUlDLGtCQUFrQixLQUFLLEtBQTNCLEVBQWtDO0FBQ2pDbkQsY0FBQUEsSUFBSSxDQUFDTSxhQUFMLENBQ0U4QyxVQURGLENBQ2EsT0FEYixFQUVFeEIsV0FGRixDQUVjLFNBRmQ7QUFHQSxhQUpELE1BSU87QUFDTnJCLGNBQUFBLENBQUMsQ0FBQzhDLElBQUYsQ0FBT0Ysa0JBQWtCLENBQUNHLElBQTFCLEVBQWdDLFVBQUNDLEtBQUQsRUFBUXRCLEtBQVIsRUFBa0I7QUFDakQsb0JBQUlzQixLQUFLLENBQUNDLE9BQU4sQ0FBYyxPQUFkLElBQXlCLENBQUMsQ0FBMUIsSUFBK0JELEtBQUssQ0FBQ0MsT0FBTixDQUFjLFNBQWQsSUFBMkIsQ0FBQyxDQUEvRCxFQUFrRTtBQUNsRSxvQkFBSSxPQUFPdkIsS0FBUCxLQUFpQixRQUFyQixFQUErQmtCLGtCQUFrQixDQUFDRyxJQUFuQixDQUF3QkMsS0FBeEIsSUFBaUN0QixLQUFLLENBQUN3QixJQUFOLEVBQWpDO0FBQy9CLGVBSEQ7QUFJQTs7QUFDRCxtQkFBT04sa0JBQVA7QUFDQTs7QUFyQkk7QUFBQTtBQXNCTDFCLFFBQUFBLFNBdEJLO0FBQUEsNkJBc0JLaUMsUUF0QkwsRUFzQmU7QUFDbkJuRCxZQUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQm9ELE1BQXRCO0FBQ0FwRCxZQUFBQSxDQUFDLENBQUM4QyxJQUFGLENBQU9LLFFBQVEsQ0FBQ0UsT0FBaEIsRUFBeUIsVUFBQ0wsS0FBRCxFQUFRdEIsS0FBUixFQUFrQjtBQUMxQyxrQkFBSXNCLEtBQUssS0FBSyxPQUFkLEVBQXVCO0FBQ3RCdkQsZ0JBQUFBLElBQUksQ0FBQ00sYUFBTCxDQUFtQjhDLFVBQW5CLENBQThCLE9BQTlCLEVBQXVDeEIsV0FBdkMsQ0FBbUQsU0FBbkQ7QUFDQTVCLGdCQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FBYzRELEtBQWQsMkJBQXNDTixLQUF0Qyw2QkFBNkR0QixLQUE3RDtBQUNBO0FBQ0QsYUFMRDtBQU1BLGdCQUFNNkIsS0FBSyxHQUFHQyxRQUFRLENBQUNDLFdBQVQsQ0FBcUIsT0FBckIsQ0FBZDtBQUNBRixZQUFBQSxLQUFLLENBQUNHLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLEtBQXJDLEVBQTRDLElBQTVDO0FBQ0FDLFlBQUFBLE1BQU0sQ0FBQ0MsYUFBUCxDQUFxQkwsS0FBckI7QUFDQTlELFlBQUFBLElBQUksQ0FBQ0ssZUFBTCxDQUFxQnFELFFBQXJCOztBQUNBLGdCQUFJQSxRQUFRLENBQUNVLE9BQVQsSUFDQVYsUUFBUSxDQUFDVyxNQUFULENBQWdCdkMsTUFBaEIsR0FBeUIsQ0FEekIsSUFFQTlCLElBQUksQ0FBQ1MsZ0JBQUwsQ0FBc0IwQixHQUF0QixPQUFnQyxjQUZwQyxFQUVvRDtBQUNuRCtCLGNBQUFBLE1BQU0sQ0FBQ0ksUUFBUCxHQUFrQkMsYUFBYSxHQUFHYixRQUFRLENBQUNXLE1BQTNDO0FBQ0EsYUFKRCxNQUlPLElBQUlYLFFBQVEsQ0FBQ1UsT0FBVCxJQUFvQnBFLElBQUksQ0FBQ1MsZ0JBQUwsQ0FBc0IwQixHQUF0QixPQUFnQyx1QkFBeEQsRUFBaUY7QUFDdkYsa0JBQUluQyxJQUFJLENBQUNlLG9CQUFMLENBQTBCZSxNQUExQixHQUFtQyxDQUF2QyxFQUF5QztBQUN4Q29DLGdCQUFBQSxNQUFNLENBQUNJLFFBQVAsR0FBa0J0RSxJQUFJLENBQUNlLG9CQUF2QjtBQUNBLGVBRkQsTUFFTztBQUNOLG9CQUFNeUQsUUFBUSxHQUFHTixNQUFNLENBQUNJLFFBQVAsQ0FBZ0JHLElBQWhCLENBQXFCQyxLQUFyQixDQUEyQixRQUEzQixDQUFqQjs7QUFDQSxvQkFBSUYsUUFBUSxDQUFDMUMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN4Qm9DLGtCQUFBQSxNQUFNLENBQUNJLFFBQVAsYUFBcUJFLFFBQVEsQ0FBQyxDQUFELENBQTdCO0FBQ0E7QUFDRDtBQUNELGFBVE0sTUFTQSxJQUFJZCxRQUFRLENBQUNVLE9BQVQsSUFBb0JwRSxJQUFJLENBQUNTLGdCQUFMLENBQXNCMEIsR0FBdEIsT0FBZ0MscUJBQXhELEVBQStFO0FBQ3JGLGtCQUFJbkMsSUFBSSxDQUFDYyxtQkFBTCxDQUF5QmdCLE1BQXpCLEdBQWtDLENBQXRDLEVBQXdDO0FBQ3ZDb0MsZ0JBQUFBLE1BQU0sQ0FBQ0ksUUFBUCxHQUFrQnRFLElBQUksQ0FBQ2MsbUJBQXZCO0FBQ0EsZUFGRCxNQUVPO0FBQ04sb0JBQU0wRCxTQUFRLEdBQUdOLE1BQU0sQ0FBQ0ksUUFBUCxDQUFnQkcsSUFBaEIsQ0FBcUJDLEtBQXJCLENBQTJCLFFBQTNCLENBQWpCOztBQUNBLG9CQUFJRixTQUFRLENBQUMxQyxNQUFULEdBQWtCLENBQXRCLEVBQXlCO0FBQ3hCb0Msa0JBQUFBLE1BQU0sQ0FBQ0ksUUFBUCxhQUFxQkUsU0FBUSxDQUFDLENBQUQsQ0FBN0I7QUFDQTtBQUNEO0FBQ0QsYUFUTSxNQVNBLElBQUlkLFFBQVEsQ0FBQ1UsT0FBVCxJQUNOVixRQUFRLENBQUNXLE1BQVQsQ0FBZ0J2QyxNQUFoQixHQUF5QixDQUR2QixFQUMwQjtBQUNoQ29DLGNBQUFBLE1BQU0sQ0FBQ0ksUUFBUCxHQUFrQkMsYUFBYSxHQUFHYixRQUFRLENBQUNXLE1BQTNDO0FBQ0EsYUFITSxNQUdBLElBQUlyRSxJQUFJLENBQUNhLGFBQVQsRUFBd0I7QUFDOUJiLGNBQUFBLElBQUksQ0FBQ2tCLGlCQUFMO0FBQ0E7O0FBQ0RsQixZQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJzQixXQUFuQixDQUErQixTQUEvQjtBQUNBOztBQS9ESTtBQUFBO0FBZ0VMRCxRQUFBQSxTQWhFSztBQUFBLDZCQWdFSytCLFFBaEVMLEVBZ0VlO0FBQ25CMUQsWUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWM0RCxLQUFkLENBQW9CSCxRQUFwQjtBQUNBMUQsWUFBQUEsSUFBSSxDQUFDTSxhQUFMLENBQ0U4QyxVQURGLENBQ2EsT0FEYixFQUVFeEIsV0FGRixDQUVjLFNBRmQ7QUFHQTs7QUFyRUk7QUFBQTtBQUFBLE9BQU47QUF3RUE7O0FBektXO0FBQUE7QUFBQSxDQUFiLEMsQ0E0S0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChDKSBNSUtPIExMQyAtIEFsbCBSaWdodHMgUmVzZXJ2ZWRcbiAqIFVuYXV0aG9yaXplZCBjb3B5aW5nIG9mIHRoaXMgZmlsZSwgdmlhIGFueSBtZWRpdW0gaXMgc3RyaWN0bHkgcHJvaGliaXRlZFxuICogUHJvcHJpZXRhcnkgYW5kIGNvbmZpZGVudGlhbFxuICogV3JpdHRlbiBieSBOaWtvbGF5IEJla2V0b3YsIDEyIDIwMTlcbiAqXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSAqL1xuXG5jb25zdCBGb3JtID0ge1xuXHQkZm9ybU9iajogJycsXG5cdHZhbGlkYXRlUnVsZXM6IHt9LFxuXHR1cmw6ICcnLFxuXHRjYkJlZm9yZVNlbmRGb3JtOiAnJyxcblx0Y2JBZnRlclNlbmRGb3JtOiAnJyxcblx0JHN1Ym1pdEJ1dHRvbjogJCgnI3N1Ym1pdGJ1dHRvbicpLFxuXHQkZHJvcGRvd25TdWJtaXQ6ICQoJyNkcm9wZG93blN1Ym1pdCcpLFxuXHQkc3VibWl0TW9kZUlucHV0OiAkKCdpbnB1dFtuYW1lPVwic3VibWl0TW9kZVwiXScpLFxuXHRwcm9jZXNzRGF0YTogdHJ1ZSxcblx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnLFxuXHRrZXlib2FyZFNob3J0Y3V0czogdHJ1ZSxcblx0ZW5hYmxlRGlycml0eTogdHJ1ZSxcblx0YWZ0ZXJTdWJtaXRJbmRleFVybDogJycsXG5cdGFmdGVyU3VibWl0TW9kaWZ5VXJsOiAnJyxcblx0b2xkRm9ybVZhbHVlczogW10sXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0aWYgKEZvcm0uZW5hYmxlRGlycml0eSkgRm9ybS5pbml0aWFsaXplRGlycml0eSgpO1xuXG5cdFx0Rm9ybS4kc3VibWl0QnV0dG9uLm9uKCdjbGljaycsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoRm9ybS4kc3VibWl0QnV0dG9uLmhhc0NsYXNzKCdsb2FkaW5nJykpIHJldHVybjtcblx0XHRcdGlmIChGb3JtLiRzdWJtaXRCdXR0b24uaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHJldHVybjtcblx0XHRcdEZvcm0uJGZvcm1PYmpcblx0XHRcdFx0LmZvcm0oe1xuXHRcdFx0XHRcdG9uOiAnYmx1cicsXG5cdFx0XHRcdFx0ZmllbGRzOiBGb3JtLnZhbGlkYXRlUnVsZXMsXG5cdFx0XHRcdFx0b25TdWNjZXNzKCkge1xuXHRcdFx0XHRcdFx0Rm9ybS5zdWJtaXRGb3JtKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvbkZhaWx1cmUoKSB7XG5cdFx0XHRcdFx0XHRGb3JtLiRmb3JtT2JqLnJlbW92ZUNsYXNzKCdlcnJvcicpLmFkZENsYXNzKCdlcnJvcicpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pO1xuXHRcdFx0Rm9ybS4kZm9ybU9iai5mb3JtKCd2YWxpZGF0ZSBmb3JtJyk7XG5cdFx0fSk7XG5cdFx0aWYgKEZvcm0uJGRyb3Bkb3duU3VibWl0Lmxlbmd0aCA+IDApIHtcblx0XHRcdEZvcm0uJGRyb3Bkb3duU3VibWl0LmRyb3Bkb3duKHtcblx0XHRcdFx0b25DaGFuZ2U6ICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHRyYW5zbGF0ZUtleSA9IGBidF8ke3ZhbHVlfWA7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCh2YWx1ZSk7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uXG5cdFx0XHRcdFx0XHQuaHRtbChgPGkgY2xhc3M9XCJzYXZlIGljb25cIj48L2k+ICR7Z2xvYmFsVHJhbnNsYXRlW3RyYW5zbGF0ZUtleV19YClcblx0XHRcdFx0XHRcdC5jbGljaygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdEZvcm0uJGZvcm1PYmoub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQvtGC0YHQu9C10LbQuNCy0LDQvdC40Y8g0LjQt9C80LXQvdC10L3QuNC5INGE0L7RgNC80Ytcblx0ICovXG5cdGluaXRpYWxpemVEaXJyaXR5KCkge1xuXHRcdEZvcm0uc2F2ZUluaXRpYWxWYWx1ZXMoKTtcblx0XHRGb3JtLnNldEV2ZW50cygpO1xuXHRcdEZvcm0uJHN1Ym1pdEJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRGb3JtLiRkcm9wZG93blN1Ym1pdC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0fSxcblx0LyoqXG5cdCAqINCh0L7RhdGA0LDQvdGP0LXRgiDQv9C10YDQstC+0L3QsNGH0LDQu9GM0L3Ri9C1INC30L3QsNGH0LXQvdC40Y8g0LTQu9GPINC/0YDQvtCy0LXRgNC60Lgg0L3QsCDQuNC30LzQtdC90LXQvdC40Y8g0YTQvtGA0LzRi1xuXHQgKi9cblx0c2F2ZUluaXRpYWxWYWx1ZXMoKSB7XG5cdFx0Rm9ybS5vbGRGb3JtVmFsdWVzID0gRm9ybS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQl9Cw0L/Rg9GB0LrQsNC10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDQuNC30LzQtdC90LXQvdC40Y8g0L7QsdGK0LXQutGC0L7QsiDRhNC+0YDQvNGLXG5cdCAqL1xuXHRzZXRFdmVudHMoKSB7XG5cdFx0Rm9ybS4kZm9ybU9iai5maW5kKCdpbnB1dCwgc2VsZWN0JykuY2hhbmdlKCgpID0+IHtcblx0XHRcdEZvcm0uY2hlY2tWYWx1ZXMoKTtcblx0XHR9KTtcblx0XHRGb3JtLiRmb3JtT2JqLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYScpLm9uKCdrZXl1cCBrZXlkb3duIGJsdXInLCAoKSA9PiB7XG5cdFx0XHRGb3JtLmNoZWNrVmFsdWVzKCk7XG5cdFx0fSk7XG5cdFx0Rm9ybS4kZm9ybU9iai5maW5kKCcudWkuY2hlY2tib3gnKS5vbignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRGb3JtLmNoZWNrVmFsdWVzKCk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQodCy0LXRgNGP0LXRgiDQuNC30LzQtdC90LXQvdC40Y8g0YHRgtCw0YDRi9GFINC4INC90L7QstGL0YUg0LfQvdCw0YfQtdC90LjQuSDRhNC+0YDQvNGLXG5cdCAqL1xuXHRjaGVja1ZhbHVlcygpIHtcblx0XHRjb25zdCBuZXdGb3JtVmFsdWVzID0gRm9ybS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KEZvcm0ub2xkRm9ybVZhbHVlcykgPT09IEpTT04uc3RyaW5naWZ5KG5ld0Zvcm1WYWx1ZXMpKSB7XG5cdFx0XHRGb3JtLiRzdWJtaXRCdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHRGb3JtLiRkcm9wZG93blN1Ym1pdC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0Rm9ybS4kZHJvcGRvd25TdWJtaXQucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0J7RgtC/0YDQsNCy0LrQsCDRhNC+0YDQvNGLINC90LAg0YHQtdGA0LLQtdGAXG5cdCAqL1xuXHRzdWJtaXRGb3JtKCkge1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogRm9ybS51cmwsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdHByb2Nlc3NEYXRhOiBGb3JtLnByb2Nlc3NEYXRhLFxuXHRcdFx0Y29udGVudFR5cGU6IEZvcm0uY29udGVudFR5cGUsXG5cdFx0XHRrZXlib2FyZFNob3J0Y3V0czogRm9ybS5rZXlib2FyZFNob3J0Y3V0cyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdGNvbnN0IGNiQmVmb3JlU2VuZFJlc3VsdCA9IEZvcm0uY2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncyk7XG5cdFx0XHRcdGlmIChjYkJlZm9yZVNlbmRSZXN1bHQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uXG5cdFx0XHRcdFx0XHQudHJhbnNpdGlvbignc2hha2UnKVxuXHRcdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JC5lYWNoKGNiQmVmb3JlU2VuZFJlc3VsdC5kYXRhLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXguaW5kZXhPZignZWNyZXQnKSA+IC0xIHx8IGluZGV4LmluZGV4T2YoJ2Fzc3dvcmQnKSA+IC0xKSByZXR1cm47XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgY2JCZWZvcmVTZW5kUmVzdWx0LmRhdGFbaW5kZXhdID0gdmFsdWUudHJpbSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjYkJlZm9yZVNlbmRSZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0b25TdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLm1lc3NhZ2UsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHRpZiAoaW5kZXggPT09ICdlcnJvcicpIHtcblx0XHRcdFx0XHRcdEZvcm0uJHN1Ym1pdEJ1dHRvbi50cmFuc2l0aW9uKCdzaGFrZScpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdFx0XHRGb3JtLiRmb3JtT2JqLmFmdGVyKGA8ZGl2IGNsYXNzPVwidWkgJHtpbmRleH0gbWVzc2FnZSBhamF4XCI+JHt2YWx1ZX08L2Rpdj5gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXHRcdFx0XHRldmVudC5pbml0RXZlbnQoJ0NvbmZpZ0RhdGFDaGFuZ2VkJywgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0XHRcdEZvcm0uY2JBZnRlclNlbmRGb3JtKHJlc3BvbnNlKTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN1Y2Nlc3Ncblx0XHRcdFx0XHQmJiByZXNwb25zZS5yZWxvYWQubGVuZ3RoID4gMFxuXHRcdFx0XHRcdCYmIEZvcm0uJHN1Ym1pdE1vZGVJbnB1dC52YWwoKSA9PT0gJ1NhdmVTZXR0aW5ncycpIHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBnbG9iYWxSb290VXJsICsgcmVzcG9uc2UucmVsb2FkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgRm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCgpID09PSAnU2F2ZVNldHRpbmdzQW5kQWRkTmV3Jykge1xuXHRcdFx0XHRcdGlmIChGb3JtLmFmdGVyU3VibWl0TW9kaWZ5VXJsLmxlbmd0aCA+IDEpe1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uID0gRm9ybS5hZnRlclN1Ym1pdE1vZGlmeVVybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgZW1wdHlVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnbW9kaWZ5Jyk7XG5cdFx0XHRcdFx0XHRpZiAoZW1wdHlVcmwubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBgJHtlbXB0eVVybFswXX1tb2RpZnkvYDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiBGb3JtLiRzdWJtaXRNb2RlSW5wdXQudmFsKCkgPT09ICdTYXZlU2V0dGluZ3NBbmRFeGl0Jykge1xuXHRcdFx0XHRcdGlmIChGb3JtLmFmdGVyU3VibWl0SW5kZXhVcmwubGVuZ3RoID4gMSl7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBGb3JtLmFmdGVyU3VibWl0SW5kZXhVcmw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGVtcHR5VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJ21vZGlmeScpO1xuXHRcdFx0XHRcdFx0aWYgKGVtcHR5VXJsLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uID0gYCR7ZW1wdHlVcmxbMF19aW5kZXgvYDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVzcG9uc2Uuc3VjY2Vzc1xuXHRcdFx0XHRcdFx0JiYgcmVzcG9uc2UucmVsb2FkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBnbG9iYWxSb290VXJsICsgcmVzcG9uc2UucmVsb2FkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKEZvcm0uZW5hYmxlRGlycml0eSkge1xuXHRcdFx0XHRcdEZvcm0uaW5pdGlhbGl6ZURpcnJpdHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRGb3JtLiRzdWJtaXRCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdH0sXG5cdFx0XHRvbkZhaWx1cmUocmVzcG9uc2UpIHtcblx0XHRcdFx0Rm9ybS4kZm9ybU9iai5hZnRlcihyZXNwb25zZSk7XG5cdFx0XHRcdEZvcm0uJHN1Ym1pdEJ1dHRvblxuXHRcdFx0XHRcdC50cmFuc2l0aW9uKCdzaGFrZScpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHR9LFxuXG5cdFx0fSk7XG5cdH0sXG59O1xuXG4vLyBleHBvcnQgZGVmYXVsdCBGb3JtO1xuIl19