/*
 * picker.js
 * ios������ѡ��������������ڡ�ͨѶ¼��ʡ������
 * */
;
(function ($) {
    'use strict';

    var Picker = function (options) {
        var self = this, elements = {};
        var defaults = {
            cols: [], //��
            inputReadOnly: true, //input�Ƿ�ֻ��
            toolbar: true,
            toolbarCloseText: 'ȷ��',  //�رհ�ť�İ�
            toolbarTemplate: [
                '<header class="bar bar-nav">',
                '<button class="button button-link pull-right close-picker">ȷ��</button>',
                '<h1 class="title">��ѡ��</h1>',
                '</header>'
            ].join('')
        };

        /*����*/
        self.params = $.extend({}, defaults, options);
        self.initialized = false; //��ʼ����

        /*ҳ��Ԫ��*/
        elements.modal = $('.picker-modal');
        elements.input = $(self.params.input);
        console.log(self.params)

        /*method*/
        self.init = function () {
            self.layout();
        };

        /*�ر�ģ̬��*/
        self.close = function () {
            elements.modal.addClass('modal-out').removeClass('modal-in');
        };

        /*���ò��֣�ѡ���*/
        self.layout = function () {
            self.initialized = true;
            self.setCols();
        };

        self.setCols = function () {

        };

        /*��ģ̬��*/
        self.open = function () {
            elements.modal.addClass('modal-in').removeClass('modal-out');
        };

        /*update scroll position*/
        function fnUpdateDuringScroll(){

        }

        /*touch satrt*/
        function fnTouchStart(e){

        }

        /*touch move*/
        function fnTouchMove(e){

        }

        /*touch end*/
        function fnTouchEnd(e){

        }

        /*fun: fnOnHtmlClick*/
        function fnOnHtmlClick(e){
            if(elements.modal[0]){
                if(e.target != elements.input[0] && !$(e.target).closest('.picker-modal')[0]) self.close();
            }
        }

        /*bind events*/
        $(document.body).on('click','.close-picker', function () {
            self.close();
        }).on('click',fnOnHtmlClick);

        elements.input.on('focus', function () {
            self.open();
        });

    };


    $.fn.picker = function (options) {
        var args = arguments;
        return this.each(function () {
            if (!this) return;
            var $this = $(this);

            var picker = $this.data("picker");
            if (!picker) {
                var params = $.extend({
                    input: this,
                    value: $this.val() ? $this.val().split(' ') : ''
                }, options);
                picker = new Picker(params);
                $this.data("picker", picker);
            }
            if (typeof options === 'string') {
                picker[options].apply(picker, Array.prototype.slice.call(args, 1));
            }
        });
    };
})(Zepto);


/*datetimePicker*/
;
(function ($) {
    "use strict";

    var M = {
        today: new Date(),
        formatNum: function (val) {
            return (val && val < 10) ? '0' + val : '' + val;
        },
        makeArr: function (max, min) {
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
            var days = M.getDaysByYearAndMonth(picker[0], picker[1]);
            if (picker[2] > days.length)  picker[2] = days.length;
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
            //console.log(JSON.stringify(params))
            if (options.value) $(this).val(M.formatDate(params.value, params.format));
            $(this).picker(params);
        });
    };


})(Zepto);