var PenfieldListeners = (function (syn) {

    var Events = (function () {

        var active = {};

        var create = (eventName, bubbles, cancelable, context) => {

            /**
             * @name Events.create
             * @param eventName | {String} | Name of event type you want to declare i.e. articleview
             * @param bubbles | {Boolean} | If event should bubble up through the event chain or not
             * @param cancelable | {Boolean} | If event can be canceled
             * @param context | {Element, Document, Window} | Specified target to deliver to when event is met
             **/

            if ('string' !== typeof eventName) {
                throw new Error('Create event @param { eventName } must be a string');
            }

            active[eventName] = (context || document).createEvent('Event');
            active[eventName].initEvent(eventName, bubbles, cancelable);
            
            return active[eventName];

        };

        return { create, active };

    })();

    var Analytics = (function () {

        var send = (data) =>  {

            /**
             * @name Analytics.send
             **/

            console.log(data);

            data.forEach((item) => {
                if (item.tracker) {
                    ga('Synthetix.send', {
                        hitType: 'event',
                        eventCategory: item.tracker.category,
                        eventAction: item.tracker.action,
                        eventLabel: item.tracker.label,
                        hitCallback: () => { console.log(' !! complete !! '); }
                    });
                }
            });

            // ga('Synthetix.send', {
            //     hitType: 'event',
            //     eventCategory: data.category,
            //     eventAction: data.action,
            //     eventLabel: data.label,
            //     hitCallback: () => { console.log(' !! complete !! '); }
            // });

        };

        var setup = (options) => {

            /**
             * @name Analytics.setup
             **/

            if (!Array.isArray(options)) {
                throw new Error('');
            }

        };

        var load = function () {

            /**
             * @name Analytics.load
             **/

            return syn.loadAssets.apply(this, arguments);
        };

        var google = (function (string) {

            var funcName = string,
                __ga     = window[funcName];

            function google (action, options) {

                /**
                 * @name Analytics.google
                 **/

                if (!funcName) { return; }

                if ('string' !== typeof action) {
                    throw new Error('The `action` @param must be a string. i.e. \'send\'');
                }

                if ('object' !== typeof options) {
                    throw new Error('')
                }

                if (-1 === ['create', 'send', 'require'].indexOf(action)) {
                    throw new Error('Not a valid action `' + action + 
                        '`, you can only send the following actions', whitelist.actions);
                }

                if (Events.active.penfieldanalytics) {
                    Events.active.penfieldanalytics.data = [ action, options ];
                    document.dispatchEvent(Events.active.penfieldanalytics);
                }

                return __ga.apply(null, [ action, options ]);
            }

            google.setup = (tag) => {

                /**
                 * @name Analytics.google.setup
                 **/

                if (!funcName) { return; }
                var clientId = __ga.getAll()[0].get('clientId');
                Component.store({ ga: clientId });
                return __ga.apply(null, ['create', tag, { 'clientId': clientId }]);
            };

            google.trackingId = () => {

                /**
                 * @name Analytics.google.trackingId
                 **/

                if (!funcName) { return false; }
                try {
                    var id = window[GoogleAnalyticsObject].getAll()[0].get('trackingId');
                    return id;
                } catch (e) { return null; }
            };

            return google;

        }(window.GoogleAnalyticsObject));

        var adobe = (function () {

            try {
                var __s = window.s || window.s_c_il[1];
            }

            catch (e) { console.warn('Unable to find adobe analytics'); }
            
            function adobe (name) {

                /**
                 * @name Analytics.adobe
                 **/

                __s.linkTrackVars = 'eVar16,eVar17';
                __s.eVar16 = name;
                __s.eVar17 = doc.title;

                if (Events.active.penfieldanalytics) {
                    Events.active.penfieldanalytics.data = [ action, options ];
                    document.dispatchEvent(Events.active.penfieldanalytics);
                }

                return __s.tl.apply(this, [true, 'o', name]);
            }

            adobe.setup = () => {

                /**
                 * @name Analytics.adobe.setup
                 **/

                var check = !__s ? false : true;
                Component.store({ adobe: check });
                return check;
            };

            return adobe;

        }());

        return { send, setup, load };

    })();

    var Product = (function () {

        var currentProduct = null;

        var channels = {
            livechat: 0,
            callback: 1,
            email: 2,
            voip: 3,
            video: 4,
            whatsapp: 5,
            skypeim: 6,
            sms: 7,
            twitter: 8,
            ticket: 9,
            facebook: 10,
            knowledge: 14,
            iva: 15,
            formagent: 16
        };
        
        var current = (action) => {

            /**
             * @name Product.current
             **/

            if ('delete' === action) { return currentProduct = null; }
            return currentProduct;
        };

        var trace = (func) => {

            /**
             * @name Product.trace
             * @param func | {Function} | Name of function which you want to trance 
             **/

            if (!syn.window) { return; }

            if ('function' !== typeof func) {
                throw new Error('Must be a function');
            }

            var Widgets = Object.keys(syn.window);

            var traced = Widgets.find((Widget) => {
                if ((func).caller instanceof syn.window[Widget].Function) {
                    return Widget;
                }
            });

            if ('undefined' !== typeof traced) {
                if (traced != currentProduct) { previousProduct = traced;  }
                currentProduct = traced;
            }

            return currentProduct;

        };

        var frame = () => {

            /**
             * @name Product.frame
             * @desc Will return the window of the frame where the customer last performed a click.
             *       This helps to determine if livechat was started from within another product
             **/

            var elem = document.activeElement;
            if (elem && elem.name == 'Synthetix Labs') {
                if (elem.contentWindow) {
                    return elem.contentWindow;
                }
            }

            return null;

        };

        return { current, trace, frame, channels }; 

    })();

    var Parse = (function () {

        var channel = (int) => {
            try {
                return Object.keys(Object.values(Product.channels).indexOf(+int));
            } catch (e) { return null; }
        };

        var url = (str, type, ignore) => {

            /**
             * @name Parse.url
             * @param str | {String} | URL string
             * @param type | {String} | Property names of location 
             *        [origin, protocol, host, hostname, port, pathname, search, hash, href]
             *
             * @param ignore | {String} | Regular expression or string which you'd like to remove url
             **/

            var link = document.createElement('a');
                link.href = str;

            var result = link[type].replace(ignore, '');

            document.body.appendChild(link);

            // preventing memory leaks due to 
            // amount of links which will generated

            link.href = null;
            link.parentNode.removeChild(link);

            return result;

        };

        var toSearchParameters = (params, skipobjects, prefix) => {

            if (skipobjects === void 0) { skipobjects = false; }

            if (prefix === void 0) { prefix = ''; }

            var result = '';

            if (typeof params !== 'object') {
                return prefix + '=' + encodeURIComponent(params) + '&';
            }

            for (var param in params) {
                var c = '' + prefix + _st(param, prefix);

                if (isObject(params[param]) && !skipobjects) {
                    result += toSearchParameters(params[param], false, '' + c);
                }

                else if (Array.isArray(params[param]) && !skipobjects) {
                    params[param].forEach((item, ind) => {
                        result += toSearchParameters(item, false, c + '[' + ind + ']');
                    });
                }

                else {
                    result += c + '=' + encodeURIComponent(params[param]) + '&';
                }
            }

            return result;

            function isObject (a) {
                if ((!!a) && (a.constructor === Object)) {
                    return true;
                }
                return false;
            }

            function _st (z, g) {
                return '' + (g != '' ? '[' : '') + z + (g != '' ? ']' : '');
            }

        };

        var formdata = (data) => {

            /**
             * @name Parse.formdata
             * @param data | {FormData} | Must FormData object 
             **/

            if (data.toString() != '[object FormData]') {
                throw new Error('@param data must be FormData');
            }

            var object = {};

            data.forEach(function (value, key) {
                if (!object.hasOwnProperty(key)) {
                    object[key] = value;
                    return;
                }

                if (!Array.isArray(object[key])) {
                    object[key] = [object[key]];    
                }

                object[key].push(value);
            });

            return object;

        };

        var payload = (data) => {

            /**
             * @name Parse.payload
             * @param data | {FormData, Object} | XHR payload which needs transformed to JSON
             **/

            return data.toString() != '[object FormData]' ? JSON.parse(data) : formdata(data);
        };

        var request = (options) => {

            /**
             * @name Parse.request
             * @param options | {Object} | synthetix.request XHR params {method: ..., url: ..., success: ...}
             **/

            if ('undifined' === typeof options) {
                throw new Error('To parse XHR request from Synthetix you must pass @param options');
            }

            // Single request
            if (!Array.isArray(options)) {
                return [ process(options) ].filter(Boolean);
            } else { return options.map(process).filter(Boolean); }

            function process (Opts, Index, Master) {

                var schema = {};

                if ('string' === typeof Opts.url) {
                    schema.resource = url(Opts.url, 'pathname', '/2.0/');
                }

                else {
                    throw new Error('You seem to be passing invalid data type for request url.');
                }

                schema.product = Product.current();

                switch (schema.resource) {

                    case 'external/search':

                        var article = Master.find((item) => {
                            return item.url.indexOf('external/article') !== -1;
                        });

                        var searchData  = JSON.parse(Opts.data);

                        if (['true', true].indexOf(searchData.autosuggest) !== -1) {
                            return;
                        }

                        // valid search performed by customer i.e. not autosuggest
                        else if (!article) {
                            schema.event = 'search';
                            schema.payload = articleData;

                            schema.tracker = {
                                category: 'Synthetix',
                                action: 'ArticleSearch',
                                label: searchData.query
                            };

                            if (Events.active.penfieldsearch) {
                                Events.active.penfieldsearch.data = schema;
                                document.dispatchEvent(Events.active.penfieldsearch);
                            }
                        }
                        
                        else {
                            var articleData = JSON.parse(article.data);

                            // searching for recommend articles not a valid customer
                            // search not to be included in analytics
                            if (searchData.query == articleData.question) { return; }
                            else {
                                schema.event = 'search';
                                schema.payload = articleData;

                                schema.tracker = {
                                    category: 'Synthetix',
                                    action: 'ArticleSearch',
                                    label: searchData.query
                                };

                                if (Events.active.penfieldsearch) {
                                    Events.active.penfieldsearch.data = schema;
                                    document.dispatchEvent(Events.active.penfieldsearch);
                                }
                            }
                        }

                    break;

                    case 'environment/variables':

                        if ('GET' == Opts.method.toUpperCase()) { return; }

                        try {
                            var variablesData = JSON.parse(Opts.data);
                        } catch (e) { return; }

                        var keys = Object.keys(variablesData);
                        var find = ['persistent', 'knowledge', 'opened', ''];

                        if (!keys.length) { return; }

                        if (keys.some(r => find.indexOf(r) !== -1)) {
                            return;
                        }

                        if ('DELETE' == Opts.method.toUpperCase()) {

                            if (Array.isArray(variablesData.delete)) {

                                // CLOSE EVENT
                                if (variablesData.delete.indexOf(Product.current()) !== -1) {
                                    schema.event = 'product_close';
                                    schema.payload = variablesData;

                                    schema.tracker = {
                                        category: 'Synthetix',
                                        action: 'ProductClose',
                                        label: schema.product
                                    };

                                    if (Events.active.penfieldclose) {
                                        Events.active.penfieldclose.data = null;
                                        document.dispatchEvent(Events.active.penfieldclose);
                                    }

                                } else { return; }

                            } else { return; }

                        }

                    break;

                    case 'external/article':

                        try {
                            var articleData = payload(Opts.data);
                        } catch (e) { return; }

                        schema.event = 'article_view';
                        schema.payload = articleData

                        schema.tracker = {
                            category: 'Synthetix',
                            action: 'ArticleView',
                            label: articleData.question
                        };

                        if (Events.active.penfieldarticleview) {
                            Events.active.penfieldarticleview.data = schema;
                            document.dispatchEvent(Events.active.penfieldarticleview);
                        }

                    break;

                    case 'external/article_feedback':

                        schema.event = 'article_feedback';
                        schema.payload = payload(Opts.data);

                        schema.tracker = {
                            category: 'Synthetix',
                            action: 'ArticleFeedback',
                            label: toSearchParameters(schema.payload)
                        };

                        if (Events.active.penfieldarticlefeedback) {
                            Events.active.penfieldarticlefeedback.data = schema;
                            document.dispatchEvent(Events.active.penfieldarticlefeedback);
                        }

                    break;

                    case 'external/trigger':

                        if ('GET' == Opts.method.toUpperCase()) { return; }

                        var triggerData = payload(Opts.data);
                        if ('accept' == triggerData.action) {
                            schema.event = 'product_open';
                            schema.payload = triggerData;

                            schema.tracker = {
                                category: 'Synthetix',
                                action: 'ProductOpen',
                                label: Parse.channel(triggerData.channel)
                            };

                            if (Opts.frame && Opts.frame.currentProduct) {
                                schema.origin = Opts.frame.currentProduct.productName;
                                schema.tracker.label = Parse.channel(triggerData.channel) + 
                                    ' launched from ' + schema.origin;
                            }

                            if (Events.active.penfieldopen) {
                                Events.active.penfieldopen.data = schema;
                                document.dispatchEvent(Events.active.penfieldopen);
                            }

                        }

                    break;

                    case 'queue/entity':

                        if ('POST' != Opts.method.toUpperCase()) { return; }

                        try {
                            var entityData = payload(Opts.data);
                        } catch (e) { return; }

                        schema.event = null;
                        schema.payload = entityData;

                        // livechat started
                        if (+entityData.chennel === 0) {

                        }

                        // callback started
                        else if (+entityData.chennel === 1) {

                        }

                        else { return; }

                    break;

                    default:
                        return;

                }

                return schema;

            }

        };

        return { request, url, formdata, payload, toSearchParameters, channel };

    })();

    var init = (opts = {}, fn) => {

        /**
         * @name init
         * @param opts | {Object} | 
         * @param fn | {Function} | Callback once function has completed
         **/

        syn.request = (function () {
            
            var RequestOptions   = [],
                RequestTimeout   = null,
                SynthetixRequest = syn.request;
                
            return function (options) {

                if (Events.active.penfieldrequests) {
                    Events.active.penfieldrequests.data = options;
                    document.dispatchEvent(Events.active.penfieldrequests);
                }

                clearTimeout(RequestTimeout);

                Product.trace(synthetix.request);
                
                // customer interactions are usualy 
                // followed by several api resources calls
                // grouping calls makes it easier for the
                // script to identify what interaction occurred

                options.frame = Product.frame();

                RequestOptions.push(options);
                RequestTimeout = setTimeout(() => {
                    var processedRequest = Parse.request(RequestOptions);
                    Analytics.send(processedRequest);

                    RequestOptions = [];
                }, 1000);
                
                if ('function' === typeof options.success) {
                    var Response = options.success;
                    options.success = function (res) {
                        return Response.apply(this, arguments);
                    }
                }

                SynthetixRequest.apply(this, arguments);

            }

        })();

    };

    // Creating event listeners
    Events.create('penfieldopen', true, true);
    Events.create('penfieldclose', true, true);
    Events.create('penfieldsearch', true, true);
    Events.create('penfieldarticleview', true, true);
    Events.create('penfieldarticlefeedback', true, true);
    Events.create('penfieldrequests', true, true);
    Events.create('penfieldanalytics', true, true);

    return { init, Analytics };

})(synthetix);