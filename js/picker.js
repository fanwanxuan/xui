/*
 * picker.js
 * ios������ѡ��������������ڡ�ͨѶ¼��ʡ������
 * */

;
(function ($) {
    "use strict";

    var M = {
        today: new Date(),
        formatNum: function (val) {
            return (val && val < 10) ? '0' + val : '' + val;
        },
        makeArr: function (max,min) {
            var arr = [];
            for (var i = min || 1; i <= max; i++) {
                arr.push(M.formatNum(i));
            }
            return arr;
        },
        getDaysByYearAndMonth: function (year, month) {
            var max = new Date(new Date(year, month, 1) - 1).getDate();
            return M.makeArr(max);
        },
        formatDate: function (values, format) {
            for (var i = 0; i < values.length; i++) {
                values[i] = M.formatNum(values[i]);
            }
            var o = {
                "y+": values[0] || M.today.getFullYear(), //year
                "M+": values[1] || M.today.getMonth() + 1, //month
                "d+": values[2] || M.today.getDate(), //day
                "h+": values[3] || M.today.getHours(), //hour
                "m+": values[4] || M.today.getMinutes(), //minute
                "s+": values[5] || M.today.getSeconds() //second
            };

            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    if ("y+" === k) {
                        format = format.replace(RegExp.$1, (o[k] + "").substr(4 - RegExp.$1.length));
                    } else {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
            }
            return format;
        },
    };

    /*Ĭ�ϲ���*/
    var defaults = {
        format: 'yyyy-MM-dd hh:mm', //�����ַ�����ʽ
        value: [],  //Ĭ��ֵ���磺['2015', '12', '29', '19', '15']
        yearLimit: [1950, 2030], //��ݷ�Χ
        onChange: function (picker) {
            var days = M.getDaysByYearAndMonth(picker[0],picker[1]);
            if(picker[2] > days.length)  picker[2] = days.length;
        }
    };
    /*��Ҫ��ʾ������*/
    defaults.cols = [
        {
            /*��ݷ�Χ*/
            values: M.makeArr(defaults.yearLimit[1], defaults.yearLimit[0])
        },
        {
            /*1-12�·�*/
            values: M.makeArr(12)
        },
        {
            /*1-31��*/
            values: M.makeArr(31)
        },
        {
            /*24ʱ*/
            values: M.makeArr(24)
        },
        {
            /*60��*/
            values: M.makeArr(60)
        },
        {
            /*60��*/
            values: M.makeArr(60)
        }
    ];


    /*plugin*/
    $.fn.datetimePicker = function (options) {
        return this.each(function () {
            if (!this) return;
            var params = $.extend({}, defaults, options);
            console.log(JSON.stringify(params))
            if (options.value) $(this).val(M.formatDate(params.value, params.format));
            //$(this).picker(params);
        });
    };


})(Zepto);