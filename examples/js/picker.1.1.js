/*
 * picker.js  v1.1
 * ios������ѡ��������������ڡ�ͨѶ¼��ʡ������
 * by xqs @2016
 * */

;
(function () {

    /*���÷���*/
    var M = {
        today: new Date(),
        zeroFixed: function (val) {
            return parseInt(val) < 10 ? '0' + parseInt(val) : '' + val;
        },
        makeArr: function (max, min) {
            var arr = [];
            for (var i = min || 0; i <= max; i++) {
                arr.push(M.zeroFixed(i));
            }
            return arr;
        },
        getDaysByYearAndMonth: function (year, month) {
            return new Date(new Date(year, month, 1) - 1).getDate();
        },
        formatDate: function (values, format) {
            for (var i = 0; i < values.length; i++) {
                values[i] = M.zeroFixed(values[i]);
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
        DateStringToArr: function (str) {
            var date = str ? new Date(str) : new Date();
            return $.map([date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()], function (item, index) {
                return M.zeroFixed(item);
            });
        }
    };


    ;
    (function ($) {
        'use strict';

        /*����:֧���ж�*/
        $.support = (function () {
            return {
                touch: !!('ontouchstart' in window)     //�Ƿ�֧��touch
            }
        })();
        /*��ǰ״̬֧�ֵ��¼�*/
        $.events = {
            start: $.support.touch ? 'touchstart' : 'mousedown',
            move: $.support.touch ? 'touchmove' : 'mousemove',
            end: $.support.touch ? 'touchend' : 'mouseup',
            click: $.support.touch ? 'touchend' : 'click'
        };

        var Picker = function (options) {
            var self = this;
            var defaults = {
                cols: [], //��
                atOnce: true,  //ʵʱ��ʾ�ı����е�ֵ
                suffix: true,  //ʱ����ʾ��׺�������ڵ�������ʱ����
                onOpen: null, //��ģ̬���Ļص�����
                onClose: null, //�ر�ģ̬���Ļص���������ʱrealTimeΪfalse
                onConfirm: null, //����ұ�ȷ����ťִ�еĻص�
                inputReadOnly: true, //input�Ƿ�ֻ��
                toolbarTitle: '��ѡ��',  //����
                toolbarCloseText: 'ȷ��'  //�رհ�ť�İ�
            };

            /*����*/
            var params = $.extend({}, defaults, options);  //console.log(params)

            /*ͷ��dom�ṹ*/
            params.toolbarTpl = [
                '<header class="tool-bar">', '<h1 class="title">' + params.toolbarTitle + '</h1>',
                '<button class="close-picker">' + params.toolbarCloseText + '</button>', '</header>'
            ].join('');

            self.initialized = false; //��ʼ����
            self.opened = false; //ģ̬���Ƿ��Ѵ�
            self.inline = false;
            self.displayValue = params.value.concat() || [];    //����Ҫ��ʾ��ֵ����,concat�������øı�ԭֵ

            /*ҳ��Ԫ��*/
            var elements = {
                body: $(document.body),
                input: $(params.input) //input
            };

            self.inline = elements.modal ? true : false;   //��ǰģ̬�����


            /*=====================
             * method
             * =====================*/

            /*
             * ���ò��֣�ѡ���
             * ������Ԫ�أ�д��dom
             * */
            self.layout = function () {
                var colsLen = params.value.length;    //��ʼֵ���鳤��
                var arr = ['<div class="picker-modal modal-out" style="display:block">', params.toolbarTpl, '<div class="picker-items"><div class="picker-center-highlight"></div>'];
                if (params.cols.length) {
                    $.each(params.cols, function (i, v) {
                        if (colsLen && i > colsLen - 1) return false;      //���ճ�ʼֵ������
                        arr.push('<div class="picker-items-col"><div class="picker-items-col-wrapper">');
                        $.each(v.values, function (m, n) {
                            var text = params.suffix && v.suffix ? n + v.suffix : n;
                            arr.push('<div class="picker-item">' + text + '</div>');
                        });
                        arr.push('</div></div>');
                    });
                    arr.push('</div></div>');
                }
                return $(arr.join('')).appendTo(elements.body);
            };

            function modalClose(modal, callback) {

                var thisModal = $(modal);
                self.opened = false;

                thisModal.addClass('modal-out').removeClass('modal-in');
                var t = setTimeout(function () {
                    clearTimeout(t);
                    thisModal.remove();
                }, 400);

                (function () {
                    var args = {format: params.format, value: self.displayValue};  //args
                    var result = {input: elements.input, value: self.displayValue}; //return result obj
                    if (params.formatValue) result.string = params.formatValue(args); //console.log(result)

                    callback && callback.call(modal, elements.input, result)
                })();

            }

            /*��ģ̬��*/
            self.open = function () {

                if (!self.opened) {
                    self.initialized = true;

                    if (!self.inline) {
                        elements.modal = $(self.layout()); //����dom
                        elements.cols = elements.modal.find('.picker-items-col');

                        /*�رպ�Ļص�����*/
                        elements.modal.on('close', function () {
                            modalClose(this, function (input, res) {
                                if (!params.atOnce && params.onClose) {
                                    params.onClose.call(input, res);//�رպ�Ļص�����
                                }
                            });
                        });

                        /*���ȷ�ϰ�ť��Ļص�����*/
                        elements.modal.on('confirm', function () {
                            if (!params.atOnce && params.onConfirm) {
                                modalClose(this, function (input, res) {
                                    params.onConfirm.call(input, res);//���ȷ����Ļص�����
                                });
                            } else {
                                elements.modal.trigger('close');
                            }
                        });

                    }

                    $.each(elements.cols, function () {
                        self.initCols(this); //��ʼ����
                    });

                    //console.log(elements.modal)
                    elements.modal.show().addClass('modal-in').removeClass('modal-out');

                }

                self.opened = true; //set flag

                /*�򿪺�Ļص�����*/
                if (params.onOpen) params.onOpen();


            };

            /*�ر�ģ̬��*/
            self.close = function () {
                if (!self.opened) return;
                elements.modal.trigger('close');
            };

            /*
             * �������������·ݶ�Ӧ������
             * */
            self.setValue = function () {
                if (params.onChange) {
                    params.onChange(params); //���ֵ����������
                }
                params.atOnce && self.showResult();
            };

            /*input��ֵ*/
            self.showResult = function () {
                var result = {value: self.displayValue};
                var resultValue = params.formatValue ? params.formatValue(result) : result.value.join(' ');
                var method = elements.input[0].tagName.toLowerCase() === 'input' ? 'val' : 'text';       //console.log(elements.input[0].outerHTML)
                elements.input[method](resultValue);
            };


            /*��ʼ���б�*/
            self.initCols = function (ele) {
                var defaultValue = elements.input.data('val') && M.DateStringToArr(elements.input.data('val')) || self.displayValue.length && self.displayValue || params.value; //����

                var $this = $(ele), colIndex = elements.cols.index($this);
                //console.log(colIndex)

                var col = params.cols[colIndex];
                col.value = defaultValue[colIndex] || col.values[0];     //��ʼ��ֵ

                col.container = $this; //������
                col.wrapper = col.container.find('.picker-items-col-wrapper');
                col.items = col.container.find('.picker-item'); //ÿһ��


                /*
                 * ������Ҫ�õ��ı���
                 * */
                var isTouched, isMoved, startY, currentY, movedY, startTranslate, currentTranslate; //�϶���Ҫ�õ���ƫ��������
                var colHeight, itemsHeight, itemHeight;   //�߶�
                var minTranslate, maxTranslate;   //��ֹ�ѳ�����

                colHeight = col.container[0].offsetHeight;     //col�����߶�
                itemHeight = col.items[0].offsetHeight;     //item�߶�
                itemsHeight = itemHeight * col.items.length;

                minTranslate = colHeight / 2 + itemHeight / 2 - itemsHeight;  //�����϶����ƫ����
                maxTranslate = colHeight / 2 - itemHeight / 2;  //�����϶����ƫ����


                /*
                 * ��ʼ�����е�Ĭ��ֵ
                 * ���ø��е�λ��
                 * */
                col.setColTranslate = function (val) {
                    var activeIndex = col.activeIndex = $.inArray(val, col.values);    //console.log('init activeIndex',activeIndex);
                    var translateY = -activeIndex * itemHeight + maxTranslate;
                    fnTranslate(col.wrapper, translateY, 200);
                    col.highlightItem(activeIndex, translateY);
                };

                /*ѡ�����*/
                col.highlightItem = function (index, translate) {
                    if (!translate) translate = fnGetTranslate(col.wrapper[0], 'y');
                    if (!index) index = -Math.round((translate - maxTranslate) / itemHeight);  //touchmove

                    //console.log('index',index)
                    if (index < 0) index = 0;
                    if (index >= col.items.length) index = col.items.length - 1;

                    //set values
                    self.displayValue[colIndex] = col.value = col.values[index]; //�洢����Ҫ��ʾ��ֵ

                    //console.log(col.activeIndex,index)
                    if (col.activeIndex != index) col.activeIndex = index;

                    /*ѡ��item*/
                    col.items.eq(index).addClass('picker-selected').siblings().removeClass('picker-selected');
                };


                /*������¼�
                 * @param: action[String] on/off
                 * on-��  off-���
                 * */
                col.handleEvents = function (action) {
                    col.container[action]($.events.start, fnTouchStart);
                    col.container[action]($.events.move, fnTouchMove);
                    col.container[action]($.events.end, fnTouchEnd);
                };


                /*
                 * ��ע��
                 * touches�ǵ�ǰ��Ļ�����д�������б�;
                 * targetTouches�ǵ�ǰ���������д�������б�;
                 * changedTouches���漰��ǰ�¼��Ĵ�������б�
                 * */
                /*touch start*/
                function fnTouchStart(e) {
                    if (isMoved || isTouched) return false;
                    e.preventDefault();
                    isTouched = true;
                    startY = e.type === 'touchstart' ? e.targetTouches ? e.targetTouches[0].pageY : e.originalEvent.targetTouches[0].pageY : e.pageY;
                    //console.log('startY',startY);

                    startTranslate = currentTranslate = fnGetTranslate(col.wrapper[0], 'y');
                    //console.log('startTranslate', typeof startTranslate, startTranslate)
                }

                /*touch move*/
                function fnTouchMove(e) {
                    if (!isTouched) return false;
                    e.preventDefault();
                    isTouched = true;
                    currentY = e.type === 'touchmove' ? e.targetTouches ? e.targetTouches[0].pageY : e.originalEvent.targetTouches[0].pageY : e.pageY;
                    movedY = currentY - startY;

                    //ƫ����
                    currentTranslate = startTranslate + movedY;
                    //console.log('currentTranslate',currentTranslate);
                    if (currentTranslate > maxTranslate) currentTranslate = maxTranslate + itemHeight / 2; //������ȡ��Χ
                    if (currentTranslate < minTranslate) currentTranslate = minTranslate - itemHeight / 2; //������ȡ��Χ

                    //����
                    fnTranslate(col.wrapper, currentTranslate, 200);
                    col.highlightItem(null, currentTranslate);

                }

                /*touch end*/
                function fnTouchEnd(e) {
                    //console.log('fnTouchEnd')
                    isTouched = isMoved = false;
                    //ƫ����
                    currentTranslate = Math.round(currentTranslate / itemHeight) * itemHeight; //��������
                    if (currentTranslate > maxTranslate) currentTranslate = maxTranslate; //������ȡ��Χ
                    if (currentTranslate < minTranslate) currentTranslate = minTranslate; //������ȡ��Χ

                    //����
                    fnTranslate(col.wrapper, currentTranslate, 200);
                    self.setValue(); //���¶�λֵ

                }


                /*ѡ��Ĭ��ֵ*/
                col.setColTranslate(col.value);

                /*���¼�*/
                col.handleEvents('on');

            };


            /*
             * Function ����
             * @param ele Ŀ��Ԫ��
             * @param duration ����ִ��ʱ��
             * */
            function fnTransition(ele, duration) {
                var _style = 'all ' + (duration || 0) + 'ms linear';
                ele.css({
                    '-webkit-transition': _style,
                    'transition': _style
                });
            }

            /*
             * Function ƫ��
             * @param ele Ŀ��Ԫ��
             * @param offset ƫ����
             * @param duration ����ִ��ʱ��
             * */
            function fnTranslate(ele, offset, duration) {
                // �� webkit-transforms�� translate3d �Ķ�����õ�Ӳ������,�����������
                var _style = 'translate3d(0,' + (offset || 0) + 'px,0)';
                ele.css({
                    '-webkit-transform': _style,
                    'transform': _style
                });
                fnTransition(ele, duration);
            }


            /*
             * ��ȡƫ����
             * @param ele Ŀ��Ԫ��
             * @param axis �ᣨx/y��
             * */
            function fnGetTranslate(ele, axis) {
                //��ͬ����������ƻ��в�ͬ�Ĵ���ʽ,�˴����ӡ�����
                /*
                 * curStyle.transform
                 * ����  -webkit-transform: translate3d(10px,-100px,-5px);
                 * �õ������ַ��� matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, -100, -5, 1)
                 * ����  -webkit-transform: translate3d(0,-100px,0);
                 * �õ������ַ��� matrix(1, 0, 0, 1, 0, -100)
                 * */
                var matrix, curTransform, curStyle, transformMatrix;

                if (typeof axis === 'undefined') axis = 'x';   //Ĭ��Ϊx��

                curStyle = window.getComputedStyle(ele, null); // ��ȡ��ʽ����.
                if (window.WebKitCSSMatrix) {
                    //WebKitCSSMatrix ��WebKit�ں��ṩ�ɼ���transform�ķ���. ����֧��HTML5�������Ҳ�и��Եķ���.
                    transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
                    curTransform = (axis === 'x') ? transformMatrix.m41 : transformMatrix.m42;
                } else {
                    transformMatrix = curStyle.MozTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                    matrix = transformMatrix.toString().split(',');
                    if (axis === 'x') curTransform = (matrix.length === 16) ? parseFloat(matrix[12]) : parseFloat(matrix[4]);
                    if (axis === 'y') curTransform = (matrix.length === 16) ? parseFloat(matrix[13]) : parseFloat(matrix[5]);
                }

                return curTransform || 0;
            }

            /*fnOnHtmlClick*/
            function fnOnHtmlClick(e) {
                if (e.target != elements.input[0] && !$(e.target).closest('.picker-modal')[0]) {
                    var modal = $('.picker-modal.modal-in');
                    modal.trigger('close');
                }
            }


            /*��ʼ��*/
            if (params.inputReadOnly) elements.input.attr('readonly', true);

            /*
             * input onClick
             * */
            if (!self.inline) {
                $(window).off().on($.events.click, fnOnHtmlClick);
                elements.input.off().on($.events.click, function (e) {
                    e.stopPropagation();
                    if ($(this).hasClass('disabled')) return false;
                    if (!self.opened) {
                        var modal = $('.picker-modal.modal-in');
                        modal.trigger('close');
                        self.open();
                    }
                });
            }

        };


        /*========================
         * bind events
         * =======================*/
        $(document).off().on($.events.click, '.close-picker', function () {
            var modal = $('.picker-modal.modal-in');
            modal.trigger('confirm');
        });


        $.fn.picker = function (options) {
            var args = arguments;
            return this.each(function () {
                if (!this) return;
                var $this = $(this);

                var picker = $this.data("picker");
                if (!picker) {
                    var method = $this[0].tagName.toLowerCase() === 'input' ? 'val' : 'text';
                    var params = $.extend({
                        input: $this,
                        value: $this[method]().split(' ')
                    }, options || {});
                    picker = new Picker(params);
                    $this.data("picker", picker);
                }
                if (typeof options === 'string') {
                    picker[options].apply(picker, Array.prototype.slice.call(args, 1));
                }
            });
        };
    })(window.jQuery || window.Zepto);


    /*datetimePicker*/
    ;
    (function ($) {
        "use strict";
        /*Ĭ�ϲ���*/
        var defaults = {
            format: 'yyyy-MM-dd hh:mm', //�����ַ�����ʽ
            value: [],  //Ĭ��ֵ���磺['2015', '12', '29', '19', '15']
            yearLimit: [1950, 2030], //��ݷ�Χ
            level: 5,  //����Ĭ�Ͽ�ѡ�㼶
            onChange: function (params) {
                var days = M.getDaysByYearAndMonth(params.cols[0].value, params.cols[1].value);   //��������
                var currentValue = params.cols[2].value;
                if (currentValue > days) currentValue = days.toString(); //��
                params.cols[2].value = currentValue;
                params.cols[2].setColTranslate(currentValue);
            },
            formatValue: function (params) {
                return M.formatDate(params.value, params.format || defaults.format);
            }
        };

        /*��ǰʱ��*/
        defaults.value = M.DateStringToArr();   //Ĭ��Ϊ��ǰʱ��
        //console.log(defaults.value)

        /*��Ҫ��ʾ������*/
        defaults.cols = [
            {
                /*��ݷ�Χ*/
                values: M.makeArr(defaults.yearLimit[1], defaults.yearLimit[0]),
                suffix: '��'
            },
            {
                /*1-12�·�*/
                values: M.makeArr(12, 1),
                suffix: '��'
            },
            {
                /*1-31��*/
                values: M.makeArr(31, 1),
                suffix: '��'
            },
            {
                /*24ʱ*/
                values: M.makeArr(23),
                suffix: 'ʱ'
            },
            {
                /*60��*/
                values: M.makeArr(59),
                suffix: '��'
            },
            {
                /*60��*/
                values: M.makeArr(59),
                suffix: '��'
            }
        ];


        /*plugin*/
        $.fn.datetimePicker = function (options) {
            return this.each(function () {
                if (!this) return;
                var $this = $(this);

                var params = $.extend({}, defaults, options || {});
                var method = $this[0].tagName.toLowerCase() === 'input' ? 'val' : 'text';

                /*
                 * ��ʼ������params.value���ȼ�Ϊ
                 * option.value > data('val') > val()/text() > default.value
                 * */
                if (options && options.value) {
                    $this[method](M.formatDate(options.value, params.format));
                } else {
                    var dateStr = $this.data('val') || $this[method]();  //dateStr = '';
                    dateStr = $.trim(dateStr); //ȥ����λ�հ��ַ�
                    if (dateStr) params.value = M.DateStringToArr(dateStr);
                }

                //����dateArr
                params.value = Array.prototype.slice.call(params.value, 0, params.level); //console.log(params.value)

                $this.picker(params);
            });
        };


    })(window.jQuery || window.Zepto);

})();
