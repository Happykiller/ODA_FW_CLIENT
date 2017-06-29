/* global er */
// Library of tools for the framework Oda

/**
 * @author FRO
 * @date 2016-05-05
 *
 * If you want to define the modeExecute
 * ?modeExecution = full, app, or mini
 *
 * events :
 * oda-fully-loaded : Oda is ready
 * oda-notification-flash : the system want notify
 * oda-gapi-loaded : When Gapi is ready
 *
 */

var $;

(function($) {
    //BEGIN EXTEND JQUERY
    $.fn.exists = function(){
        return this.length>0;
    };

    $.fn.btEnable = function(){
        this.removeClass("disabled");
        this.removeAttr("disabled");
    };
    $.fn.btDisable = function(){
        if(!this.hasClass('disabled')){
            this.addClass("disabled");
        }
        this.attr("disabled", true);
    };
    //END EXTEND JQUERY

    //BEGIN POLYFILL
    if (typeof CustomEvent !== 'function') {
        var CustomEvent;

        CustomEvent = function(event, params) {
            var evt;
            params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: undefined
                };
            evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    if (!String.prototype.includes) {
        String.prototype.includes = function(searchString, position) {
            return this.indexOf(searchString, position) >= 0;
        };
    }

    /*
     * object.watch polyfill
     *
     * 2012-04-03
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */
    // object.watch
    if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
            enumerable: false
            , configurable: true
            , writable: false
            , value: function (prop, handler) {
                var
                oldval = this[prop]
                , newval = oldval
                , getter = function () {
                    return newval;
                }
                , setter = function (val) {
                    oldval = newval;
                    return newval = handler.call(this, prop, oldval, val);
                }
                ;
                
                if (delete this[prop]) { // can't watch constants
                    Object.defineProperty(this, prop, {
                        get: getter
                        , set: setter
                        , enumerable: true
                        , configurable: true
                    });
                }
            }
        });
    }

    // object.unwatch
    if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
            enumerable: false
            , configurable: true
            , writable: false
            , value: function (prop) {
                var val = this[prop];
                delete this[prop]; // remove accessors
                this[prop] = val;
            }
        });
    }
    //END POLYFILL

    'use strict';

    var
    /* version */
        VERSION = '0.170303.00'
        ;

    $.Oda = {
        /* Version number */
        version: VERSION,

        Session: null,

        SessionDefault: {
            "code_user" : "",
            "key" : "",
            "id" : 0,
            "userInfo" : {
                "locale" : "en",
                "firstName" : "",
                "lastName" : "",
                "mail" : "",
                "profile" : 0,
                "profileLabel" : "",
                "showTooltip" : 0
            }
        },

        Context: {
            /*
             ["cache","ajax","mokup","offline"]
             */
            modeInterface: ["cache","ajax","mokup","offline"],
            ModeExecution: {
                init: false,
                scene: false,
                notification: false,
                message: false,
                rooter: false,
                app: false,
                footer: false
            },
            debug: false,
            dev: false,
            appLibName: false,
            vendorName: "bower_components",
            rootPath: "",
            projectLabel: "Project",
            mainDiv: "oda-content",
            host: "",
            rest: "",
            resources: "resources/",
            window: window,
            console: console,
            startDate: false
        },

        Regexs: {
            mail: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|fr)\\b",
            login: "^[a-zA-Z0-9]{3,}$",
            pass: "^[a-zA-Z0-9]{4,}$",
            firstName: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            lastName: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,}$",
            noInjection: "^(?!.*?function())",
        },

        /**
         * @name $.Oda.init
         */
        init: function(){
            try {
                window.CKEDITOR_BASEPATH = $.Oda.Context.rootPath + $.Oda.Context.vendorName + '/ckeditor/';
                $.Oda.Session.userInfo.locale = $.Oda.Tooling.getLangBrowser();

                var listDepends = [
                    {"name": "library" , ordered : false, "list" : [
                        { "elt": $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/i8n/i8n.json", "type": "json", "target": function(p_json){$.Oda.I8n.datas = $.Oda.I8n.datas.concat(p_json);}},
                        { "elt": $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/css.css", "type": "css" },
                        { "elt": $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/templates/Oda.html", "type": "html", target: function(data){
                            $("body").append(data); 
                        }}
                    ]}
                ];

                if($.Oda.Tooling.isInArray("mokup",$.Oda.Context.modeInterface)){
                    var listDependsMokup = [
                        {"name" : "mokup" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/mokup/mokup.json", "type" : "json", "target" : function(p_json){$.Oda.MokUp.mokup = $.Oda.MokUp.mokup.concat(p_json);}}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsMokup);
                }

                if($.Oda.Tooling.isInArray("cache",$.Oda.Context.modeInterface)){
                    var listDependsCache = [
                        {"name" : "cache" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/cache/cache.json", "type" : "json", "target" : function(p_json){$.Oda.Cache.config = $.Oda.Cache.config.concat(p_json);}}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsCache);
                }

                if($.Oda.Context.ModeExecution.app){

                    var libName = "OdaApp.js";
                    if(!$.Oda.Context.dev && $.Oda.Context.appLibName){
                        libName = $.Oda.Context.appLibName;
                    }

                    var listDependsApp = [
                        {"name": "app", ordered: false, "list": [
                            { "elt" : $.Oda.Context.rootPath + "config/config.js", "type" : "script" },
                            { "elt" : $.Oda.Context.rootPath + "css/css.css", "type" : "css" },
                            { "elt" : $.Oda.Context.rootPath + "i8n/i8n.json", "type" : "json", "target" : function(p_json){$.Oda.I8n.datas = $.Oda.I8n.datas.concat(p_json);}},
                            { "elt" : $.Oda.Context.rootPath + "js/"+libName, "type": "script"}
                        ]}
                    ];

                    if($.Oda.Tooling.isInArray("mokup",$.Oda.Context.modeInterface)){
                        var listDependsMokupApp = [
                            {"name" : "mokupApp" , ordered : false, "list" : [
                                { "elt" : $.Oda.Context.rootPath + "mokup/mokup.json", "type" : "json", "target" : function(p_json){$.Oda.MokUp.mokup = $.Oda.MokUp.mokup.concat(p_json);}}
                            ]}
                        ];
                        listDepends = listDepends.concat(listDependsMokupApp);
                    }

                    if($.Oda.Tooling.isInArray("cache",$.Oda.Context.modeInterface)){
                        var listDependsCacheApp = [
                            {"name" : "cacheApp" , ordered : false, "list" : [
                                { "elt" : $.Oda.Context.rootPath + "cache/cache.json", "type" : "json", "target" : function(p_json){$.Oda.Cache.config = $.Oda.Cache.config.concat(p_json);}}
                            ]}
                        ];
                        listDepends = listDepends.concat(listDependsCacheApp);
                    }

                    listDepends = listDepends.concat(listDependsApp);
                }
                
                if($.Oda.Context.ModeExecution.widget){
                    $.Oda.Display.Widget.load();
                }

                if($.Oda.Context.ModeExecution.scene){

                    $.Oda.Router.routesAllowedDefault = ["","home","contact","forgot","subscrib","profile","resetPwd"];
                    $.Oda.Router.routesAllowed = $.Oda.Router.routesAllowedDefault.slice(0);

                    $.Oda.Router.addMiddleWare("support",function() {
                        $.Oda.Log.debug("MiddleWares : support");
                        $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/sys/param/maintenance", {callback: function(response){
                            try{
                                var maintenance = response.data.param_value;

                                if (maintenance === "1") {
                                    $.Oda.Router.routerExit = true;
                                    $.Oda.Router.routes.support.go();
                                }
                            }catch (e){
                                $.Oda.Router.routerExit = true;
                                $.Oda.Router.routes.support.go();
                            }
                        }});
                    });

                    $.Oda.Router.addMiddleWare("auth", function() {
                        $.Oda.Log.debug("MiddleWares : auth");
                        if (($.Oda.Session.hasOwnProperty("code_user")) && ($.Oda.Session.code_user !== "")) {
                            if ($.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                $.Oda.Interface.callRest($.Oda.Context.rest + "vendor/happykiller/oda/resources/api/session/check", {callback: function(data){
                                    if (data.data) {
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                }}, {
                                    "code_user": $.Oda.Session.code_user,
                                    "key": $.Oda.Session.key
                                });
                            } else {
                                $.Oda.Log.error("MiddleWares auth : route not allowed "+$.Oda.Router.current.route);
                                $.Oda.Router.routerExit = true;
                                $.Oda.Security.logout();
                            }
                        } else {
                            var session = $.Oda.Storage.get("ODA-SESSION");

                            if (session !== null) {
                                $.Oda.Session = session;
                                $.Oda.I8n.watchLanguage();

                                $.Oda.Interface.callRest($.Oda.Context.rest + "vendor/happykiller/oda/resources/api/session/check", {callback: function(data){
                                    if (data.data) {
                                        $.Oda.Security.loadRight({callback: function(){
                                            if (!$.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                                $.Oda.Router.routerExit = true;
                                                $.Oda.Security.logout();
                                            }
                                        }});
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                }}, {
                                    "code_user": session.code_user,
                                    "key": session.key
                                });
                            } else {
                                var params = $.Oda.Router.current.args;
                                if ((params.hasOwnProperty("getUser")) && (params.hasOwnProperty("getPass"))) {
                                    var auth = $.Oda.Security.auth({
                                        "login": params.getUser,
                                        "mdp": params.getPass,
                                        "reload": false
                                    });
                                    if (auth) {
                                        if (!$.Oda.Tooling.isInArray($.Oda.Router.current.route, $.Oda.Router.routesAllowed)) {
                                            $.Oda.Router.routerExit = true;
                                            $.Oda.Security.logout();
                                        }
                                    } else {
                                        $.Oda.Router.routerExit = true;
                                        $.Oda.Security.logout();
                                    }
                                } else {
                                    $.Oda.Router.routerExit = true;
                                    $.Oda.Security.logout();
                                }
                            }
                        }
                    });

                    $.Oda.Router.addDependencies("hightcharts", {
                        ordered : true,
                        "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/highcharts-release/highcharts.js", "type" : "script"},
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/highcharts-release/modules/exporting.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addDependencies("dataTables", {
                        ordered : true,
                        "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/datatables/media/js/jquery.dataTables.min.js", "type" : "script"},
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/dataTables.bootstrap.css", "type" : "css"},
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/js/dataTables/dataTables.bootstrap.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addDependencies("ckeditor", {
                        ordered : false,
                        "list" : [
                            { "elt": $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/ckeditor/ckeditor.js", "type" : "script"}
                        ]
                    });

                    $.Oda.Router.addRoute("auth", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/auth.html",
                        "title" : "oda-main.authentification",
                        "urls" : ["auth"],
                        "middleWares" : ["support"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("support", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/support.html",
                        "title" : "oda-main.support-title",
                        "urls" : ["support"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("404", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/404.html",
                        "title" : "oda-main.404-title",
                        "urls" : ["404"],
                        "system" : true
                    });

                    $.Oda.Router.addRoute("resetPwd", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/resetPwd.html",
                        "title" : "resetPwd.title",
                        "urls" : ["resetPwd"],
                        "middleWares" : ["support"],
                    });

                    $.Oda.Router.addRoute("contact", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/contact.html",
                        "title" : "oda-main.contact",
                        "urls" : ["contact"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("forgot", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/forgot.html",
                        "title" : "oda-main.forgot-title",
                        "urls" : ["forgot"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("subscrib", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/subscrib.html",
                        "title" : "oda-main.subscrib-title",
                        "urls" : ["subscrib"],
                        "middleWares" : ["support"]
                    });

                    $.Oda.Router.addRoute("home", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/home.html",
                        "title" : "oda-main.home-title",
                        "urls" : ["","home"],
                        "middleWares" : ["support", "auth"]
                    });

                    $.Oda.Router.addRoute("profile", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/profile.html",
                        "title" : "oda-main.profile-title",
                        "urls" : ["profile"],
                        "middleWares" : ["support", "auth"]
                    });

                    $.Oda.Router.addRoute("stats", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/stats.html",
                        "title" : "oda-stats.title",
                        "urls" : ["stats"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["hightcharts"]
                    });

                    $.Oda.Router.addRoute("admin", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/admin.html",
                        "title" : "oda-admin.title",
                        "urls" : ["admin"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["dataTables", "ckeditor"]
                    });

                    $.Oda.Router.addRoute("supervision", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/supervision.html",
                        "title" : "oda-supervision.title",
                        "urls" : ["supervision"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["dataTables"]
                    });

                    $.Oda.Router.addRoute("tests", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/tests.html",
                        "title" : "oda-tests.title",
                        "urls" : ["tests"],
                        "middleWares" : ["support", "auth"]
                    });

                    $.Oda.Router.addRoute("navigation", {
                        "path" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/partials/navigation.html",
                        "title" : "oda-navigation.title",
                        "urls" : ["navigation"],
                        "middleWares" : ["support", "auth"],
                        "dependencies" : ["dataTables"]
                    });

                    var listDependsScene = [
                        {"name" : "scene" , ordered : false, "list" : [
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/css/simple-sidebar.css", "type" : "css" },
                            { "elt" : $.Oda.Context.rootPath + $.Oda.Context.vendorName + "/Oda/resources/templates/Scene.html", "type": "html", target : function(data){ $( "body" ).append(data); }}
                        ]}
                    ];
                    listDepends = listDepends.concat(listDependsScene);
                }

                $.Oda.Loader.load({ depends : listDepends, functionFeedback : function(data){
                    if($.Oda.Context.ModeExecution.footer){
                        $('body').append('<div class="footer">Power with <a href="http://oda.happykiller.net" target="_blank">Oda</a></div>')
                    }

                    // init from config
                    if ($.Oda.Context.host !== ""){
                        $.Oda.Storage.storageKey = "ODA__"+$.Oda.Context.host+"__";
                    }
                    if($.Oda.Context.ModeExecution.notification){
                        $.Oda.Display.Notification.load();
                    }
                    if($.Oda.Context.ModeExecution.scene) {
                        if($("#"+ $.Oda.Context.mainDiv).exists()){
                            $("#"+ $.Oda.Context.mainDiv).remove();
                        }
                        $.Oda.Display.Scene.load();
                    }
                    if($.Oda.Context.ModeExecution.rooter){
                        $.Oda.Router.startRooter();
                    }
                    var d = new Date();
                    var n = d.getTime();
                    var mili = (d - $.Oda.Context.startDate.getTime());
                    $.Oda.Log.info("Oda fully loaded. (in "+mili+" miliseconds)");
                    $.Oda.Event.send({name:"oda-fully-loaded", data : { truc : data.msg }});
                }, functionFeedbackParams : {msg : "Welcome with Oda"}});
                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.init : " + er.message);
                return null;
            }
        },

        Controller: {},

        App: {},

        Cache: {
            config: [],
            cache: [],
            /**
             * @name $.Oda.Cache.save
             * @param {object} p_params
             * @param {string} p_params.key
             * @param {object} p_params.attrs
             * @param {object} p_params.datas
             * @returns {$.Oda.Cache}
             */
            save: function(p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {
                        var founded = false;
                        for (var indice in $.Oda.Cache.config) {
                            var elt = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(elt.key)) {
                                founded = true;
                                break;
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);

                            var d = new Date();
                            var date = d.getTime();

                            p_params.recordDate = date;

                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    $.Oda.Cache.cache.splice(indice, 1);
                                }
                            }
                            $.Oda.Cache.cache.push(p_params);
                            $.Oda.Storage.set("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            return this;
                        }else{
                            return this;
                        }
                    }else{
                        return this;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.save : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Cache.load
             * @desc interface cache
             * @param {object} p_params
             * @param {string} p_params.key
             * @param {object} p_params.attrs
             * @param {boolean} p_params.demande opt
             * @returns {$.Oda.Cache}
             */
            load: function(p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {

                        var founded = false;
                        var eltConfig;
                        for (var indice in $.Oda.Cache.config) {
                            eltConfig = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(eltConfig.key)) {
                                if (eltConfig.hasOwnProperty("onDemande") && (eltConfig.onDemande) && p_params.demande) {
                                    founded = true;
                                    break;
                                } else if ((eltConfig.hasOwnProperty("onDemande") && (eltConfig.onDemande === false)) || (!eltConfig.hasOwnProperty("onDemande"))) {
                                    founded = true;
                                    break;
                                }
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    if (eltConfig.ttl !== 0) {
                                        var d = new Date();
                                        var date = d.getTime();

                                        var dateTimeOut = elt.recordDate + (eltConfig.ttl * 1000);

                                        if (date > dateTimeOut) {
                                            return false;
                                        } else {
                                            return elt;
                                        }
                                    } else {
                                        return elt;
                                    }
                                }
                            }
                        }
                        return false;
                    }else{
                        return false;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.load : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Cache.loadWithOutTtl
             * @param {object} p_params
             * @param {string} p_params.key
             * @param {object} p_params.attrs
             * @returns {$.Oda.Cache}
             */
            loadWithOutTtl: function(p_params) {
                try {
                    if($.Oda.Session.code_user !== "") {

                        var founded = false;
                        for (var indice in $.Oda.Cache.config) {
                            var elt = $.Oda.Cache.config[indice];
                            if (p_params.key.includes(elt.key)) {
                                founded = true;
                                break;
                            }
                        }

                        if (founded) {
                            $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-" + $.Oda.Session.code_user, $.Oda.Cache.cache);
                            for (var indice in $.Oda.Cache.cache) {
                                var elt = $.Oda.Cache.cache[indice];
                                if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs, p_params.attrs))) {
                                    return elt;
                                }
                            }
                        }
                        return false;
                    }else{
                        return false;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.loadWithOutTtl : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Cache.remove
             * @param {object} p_params
             * @param {string} p_params.key
             * @param {object} p_params.attrs
             * @returns {$.Oda.Cache}
             */
            remove: function(p_params) {
                try {
                    $.Oda.Cache.cache = $.Oda.Storage.get("ODA-CACHE-"+$.Oda.Session.code_user, $.Oda.Cache.cache);

                    for(var indice in $.Oda.Cache.cache){
                        var elt = $.Oda.Cache.cache[indice];
                        if ((elt.key === p_params.key) && ($.Oda.Tooling.deepEqual(elt.attrs,p_params.attrs))){
                            $.Oda.Cache.cache.splice(indice,1);
                            break;
                        }
                    }
                    $.Oda.Storage.set("ODA-CACHE-"+$.Oda.Session.code_user,$.Oda.Cache.cache);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.remove : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Cache.clean
             * @desc remove the user cache
             * @returns {$.Oda.Cache}
             */
            clean: function() {
                try {
                    if($.Oda.Session.code_user !== "") {
                        $.Oda.Storage.remove("ODA-CACHE-"+$.Oda.Session.code_user);
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.clean : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Cache.cleanAll
             * @desc remove all the ODA-CACHE%
             * @returns {$.Oda.Cache}
             */
            cleanAll: function() {
                try {
                    var listCache = $.Oda.Storage.getIndex("ODA-CACHE");
                    for(var indice in listCache){
                        var key = $.Oda.Tooling.replaceAll({str : listCache[indice], find : $.Oda.Storage.storageKey, by : ''});
                        $.Oda.Storage.remove(key);
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Cache.cleanAll : " + er.message);
                    return null;
                }
            }
        },

        Loader: {
            Status: {
                init: 0,
                loading: 1,
                loaded: 2,
                fail: 3
            },
            iterator: 0,
            buffer: [],
            eltAlreadyLoad: {},
            /**
             * @name $.Oda.Loader.load
             * @param {Object} params
             * @param {Object} params.depends
             * @param {Object} params.functionFeedback
             * @param {Object} params.functionFeedbackParams
             * @returns {Boolean}
             */
            load: function(params){
                try {
                    var eltLoader = params;
                    eltLoader.id = $.Oda.Loader.iterator;

                    for(var indiceGrp in eltLoader.depends){
                        var grp = eltLoader.depends[indiceGrp];
                        grp.state = $.Oda.Loader.Status.init;
                        for(var indiceElt in grp.list){
                            var elt = grp.list[indiceElt];
                            elt.state = $.Oda.Loader.Status.init;
                        }
                    }

                    $.Oda.Loader.buffer.push(eltLoader);
                    $.Oda.Loader.iterator++;

                    $.Oda.Loader.loading({id : eltLoader.id});

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.load : " + er.message);
                }
            },
            /**
             * @name $.Oda.Loader.loading
             * @param {Object} p_params
             * @param p_params.id
             * @returns {$.Oda.Loader}
             */
            loading: function(p_params) {
                try {
                    var eltLoader = $.Oda.Loader.buffer[p_params.id];

                    for (var indiceGrp in eltLoader.depends) {
                        var grp = eltLoader.depends[indiceGrp];
                        if((grp.state === $.Oda.Loader.Status.init)){
                            $.Oda.Log.debug("Dependency group loading : "+grp.name);
                            grp.state = $.Oda.Loader.Status.loading;
                            $.Oda.Event.addListener({name : "oda-loader-"+p_params.id+"-"+grp.name, callback : function(e){
                                $.Oda.Loader.loading({id : e.detail.idLoader});
                                return this;
                            }
                            });
                            $.Oda.Loader.loadingGrp({idLoader : p_params.id, grp : grp});
                            return this;
                        }
                    }

                    if(eltLoader.hasOwnProperty("functionFeedback")){
                        if(eltLoader.hasOwnProperty("functionFeedbackParams")) {
                            eltLoader.functionFeedback(eltLoader.functionFeedbackParams);
                        }else{
                            eltLoader.functionFeedback();
                        }
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loading : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Loader.loadingGrp
             * @param {Object} p_params
             * @param p_params.idLoader
             * @param p_params.grp
             * @returns {$.Oda.Loader}
             */
            loadingGrp: function(p_params) {
                try {
                    var statutGrp = $.Oda.Loader.Status.loaded;
                    //lunch
                    for(var indiceElt in p_params.grp.list){
                        var elt = p_params.grp.list[indiceElt];
                        if(elt.state === $.Oda.Loader.Status.init){
                            $.Oda.Log.debug("Dependency element loading : "+ elt.elt + " of grp : "+p_params.grp.name);
                            elt.state = $.Oda.Loader.Status.loading;
                            $.Oda.Event.addListener({name : "oda-loader-"+p_params.idLoader+"-"+p_params.grp.name+"-"+elt.elt, callback : function(e){
                                $.Oda.Loader.loadingGrp({idLoader : e.detail.idLoader, grp : e.detail.grp});
                                return this;
                            }
                            });
                            $.Oda.Loader.loadingElt({idLoader:p_params.idLoader,grp:p_params.grp,elt:elt});
                            if(p_params.grp.ordered){
                                return this;
                            }
                        }else{
                            if(elt.state === $.Oda.Loader.Status.fail){
                                statutGrp = $.Oda.Loader.Status.fail;
                            }
                        }
                    }
                    //case all start but not all finish
                    if(!p_params.grp.ordered){
                        for(var indiceElt in p_params.grp.list) {
                            var elt = p_params.grp.list[indiceElt];
                            if (elt.state === $.Oda.Loader.Status.loading) {
                                return this;
                            }
                        }
                    }
                    if(p_params.grp.state !== $.Oda.Loader.Status.loaded) {
                        p_params.grp.state = statutGrp;
                        $.Oda.Log.debug("Dependency group loaded : " + p_params.grp.name + " with code : " + p_params.grp.state);
                        $.Oda.Event.send({
                            name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name, data: {
                                grpName: p_params.grp.name,
                                idLoader: p_params.idLoader,
                                grpState: statutGrp
                            }
                        });
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loadingGrp : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Loader.loadingElt
             * @param {object} p_params
             * @param p_params.idLoader
             * @param p_params.grp
             * @param p_params.elt
             * @returns {$.Oda.Loader}
             */
            loadingElt: function(p_params) {
                try {
                    if(p_params.elt.state !== $.Oda.Loader.Status.loaded){
                        if(!p_params.elt.hasOwnProperty("force")){
                            p_params.elt.force = false;
                        }
                        if(($.Oda.Loader.eltAlreadyLoad.hasOwnProperty(p_params.elt.elt)) &&
                            ($.Oda.Loader.eltAlreadyLoad[p_params.elt.elt] === $.Oda.Loader.Status.loaded) &&
                            (p_params.elt.force === false))
                        {
                            p_params.elt.state = $.Oda.Loader.Status.loaded;
                            $.Oda.Log.debug("Dependency element already loaded : "+ p_params.elt.elt + " of grp : "+ p_params.grp.name + " of  with code : " + p_params.elt.state);
                            $.Oda.Event.send({
                                name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name + "-" + p_params.elt.elt,
                                data: {
                                    grp : p_params.grp,
                                    idLoader : p_params.idLoader
                                }
                            });
                        }else{
                            switch(p_params.elt.type) {
                                case "css":
                                    $('<link/>', {
                                        rel: 'stylesheet',
                                        type: 'text/css',
                                        href: p_params.elt.elt
                                    }).appendTo('head');

                                    $.Oda.Loader.eltAlreadyLoad[p_params.elt.elt] = $.Oda.Loader.Status.loaded;
                                    p_params.elt.state = $.Oda.Loader.Status.loaded;
                                    $.Oda.Log.debug("Dependency element loaded : "+ p_params.elt.elt + " of grp : "+ p_params.grp.name + " of  with code : " + p_params.elt.state);
                                    $.Oda.Event.send({
                                        name: "oda-loader-" + p_params.idLoader + "-" + p_params.grp.name + "-" + p_params.elt.elt,
                                        data: {
                                            grp : p_params.grp,
                                            idLoader : p_params.idLoader
                                        }
                                    });

                                    break;
                                case "script":
                                case "json":
                                case "html" :
                                    $.ajax({
                                        url: p_params.elt.elt,
                                        dataType: p_params.elt.type,
                                        context : {"params" : p_params},
                                        success: function( data, textStatus, jqxhr) {
                                            var params = $(this)[0].params;
                                            if(params.elt.hasOwnProperty("target")){
                                                params.elt.target(data);
                                            }
                                            $.Oda.Loader.eltAlreadyLoad[params.elt.elt] = $.Oda.Loader.Status.loaded;
                                            params.elt.state = $.Oda.Loader.Status.loaded;
                                            $.Oda.Log.debug("Dependency element loaded : "+ params.elt.elt + " of grp : "+ params.grp.name + " of  with code : " + params.elt.state);
                                            $.Oda.Event.send({
                                                name: "oda-loader-" + params.idLoader + "-" + params.grp.name + "-" + params.elt.elt,
                                                data: {
                                                    grp : params.grp,
                                                    idLoader : params.idLoader
                                                }
                                            });
                                        },
                                        error : function( jqxhr, settings, exception ) {
                                            var params = $(this)[0].params;
                                            $.Oda.Loader.eltAlreadyLoad[params.elt.elt] = $.Oda.Loader.Status.fail;
                                            params.elt.state = $.Oda.Loader.Status.fail;
                                            $.Oda.Log.debug("Dependency element fail : "+ params.elt.elt + " of grp : "+ params.grp.name + " of  with code : " + params.elt.state);
                                            $.Oda.Event.send({
                                                name: "oda-loader-" + params.idLoader + "-" + params.grp.name + "-" + params.elt.elt,
                                                data: {
                                                    grp : params.grp,
                                                    idLoader : params.idLoader
                                                }
                                            });
                                        }
                                    });
                                    break;
                                default:
                                    $.Oda.Log.debug( "Type unknown for : "+p_params.elt.elt+"." );
                            }
                        }
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Loader.loadingElt : " + er.message);
                    return null;
                }
            },
        },

        Mobile: {
            /* return elet*/
            funcReturnGPSPosition: null,
            funcReturnCaptureImg: null,
            /* var intern */
            networkState: null,
            positionGps: {
                coords : {
                    latitude : 0,
                    longitude : 0,
                    altitude : 0,
                    accuracy : 0,
                    altitudeAccuracy : 0,
                    heading : 0,
                    speed : 0
                },
                timestamp : 0,
                statut : ''
            },
            pictureSource: null,
            destinationType: null,
            onMobile: false,
            onMobileTest: false,
            /**
             * @name $.Oda.Mobile.onSuccessGPSPosition
             * @desc getGPSPosition
             * @param {Object} p_position
             */
            onSuccessGPSPosition: function(p_position) {
                try {
                    $.Oda.Mobile.positionGps.coords = p_position.coords;
                    $.Oda.Mobile.positionGps.timestamp = p_position.timestamp;
                    $.Oda.Mobile.positionGps.statut = "OK";
                    $.Oda.Mobile.funcReturnGPSPosition($.Oda.Mobile.positionGps);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.onSuccessGPSPosition: " + er.message);
                }
            },
            /**
             * @name $.Oda.Mobile.onErrorGPSPosition
             * @desc getGPSPosition
             * @param {Object} p_position
             */
            onErrorGPSPosition: function(p_error) {
                try {
                    $.Oda.Mobile.positionGps.statut = "KO : code=>"+ p_error.code+", message=>"+ p_error.message;
                    $.Oda.Mobile.funcReturnGPSPosition($.Oda.Mobile.positionGps);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.onErrorGPSPosition: " + er.message);
                }
            },
            /**
             * @name $.Oda.Mobile.onPhotoSuccess
             * @param p_imageData
             */
            onPhotoSuccess: function(p_imageData) {
                try {
                    var imgSrc = "data:image/jpeg;base64,"+p_imageData;

                    $.Oda.Mobile.funcReturnCaptureImg(imgSrc);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.onPhotoSuccess: " + er.message);
                }
            },
            /**
             * @name $.Oda.Mobile.onPhotoURISuccess
             * @param p_imageURI
             */
            onPhotoURISuccess: function(p_imageURI) {
                try {
                    var imgSrc = p_imageURI;

                    $.Oda.Mobile.funcReturnCaptureImg(imgSrc);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.onPhotoURISuccess: " + er.message);
                }
            },
            /**
             * @name $.Oda.Mobile.onPhotoFail
             * @param p_message
             */
            onPhotoFail: function(p_message) {
                try {
                    alert('Failed because: ' + p_message);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.onPhotoFail: " + er.message);
                }
            },
            /**
             * @name $.Oda.Mobile.initModuleMobile
             * @returns {*}
             */
            initModuleMobile: function(){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.networkState = navigator.connection.type;
                    $.Oda.Mobile.pictureSource = navigator.camera.PictureSourceType;
                    $.Oda.Mobile.destinationType = navigator.camera.DestinationType;

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.initModuleMobile: " + er.message);
                    return null;
                }
            },
            ///////////////// PART NETWORK
            /**
             * @name $.Oda.Mobile.getConnectionString
             * @returns {Boolean}
             */
            getConnectionString: function(p_networkState){
                try {
                    var retour = "";

                    var states = {};
                    states[Connection.UNKNOWN]  = 'Unknown connection';
                    states[Connection.ETHERNET] = 'Ethernet connection';
                    states[Connection.WIFI]     = 'WiFi connection';
                    states[Connection.CELL_2G]  = 'Cell 2G connection';
                    states[Connection.CELL_3G]  = 'Cell 3G connection';
                    states[Connection.CELL_4G]  = 'Cell 4G connection';
                    states[Connection.NONE]     = 'No network connection';

                    retour = 'Connection type: ' + states[p_networkState];

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.getConnectionString: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Mobile.testConnection
             * @returns {Boolean}
             */
            testConnection: function(){
                try {
                    var boolRetour = true;

                    alert(this.getConnectionString(_networkState));

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.testConnection: " + er.message);
                    return null;
                }
            },
            ///////////////// PART GPS
            /**
             * @name $.Oda.Mobile.getGpsPosition
             * @param p_onReturn
             * @returns {*}
             */
            getGpsPosition: function(p_onReturn){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnGPSPosition = p_onReturn;

                    navigator.geolocation.getCurrentPosition(_onSuccessGPSPosition, _onErrorGPSPosition);

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.getGpsPosition: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Mobile.getGpsPositionString
             * @param p_position
             * @returns {*}
             */
            getGpsPositionString: function(p_position){
                try {
                    var retour = "";

                    retour += 'Latitude: '      + p_position.coords.latitude            + '\n' +
                        'Longitude: '               + p_position.coords.longitude           + '\n' +
                        'Altitude: '                + p_position.coords.altitude            + '\n' +
                        'Accuracy: '                + p_position.coords.accuracy            + '\n' +
                        'Altitude Accuracy: '       + p_position.coords.altitudeAccuracy    + '\n' +
                        'Heading: '                 + p_position.coords.heading             + '\n' +
                        'Speed: '                   + p_position.coords.speed               + '\n' +
                        'Timestamp: '               + p_position.timestamp                  + '\n' +
                        'statut: '                  + p_position.statut                     + '\n';

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.getGpsPositionString: " + er.message);
                    return null;
                }
            },
            ///////////////// PART CAMERA
            /**
             * @name $.Oda.Mobile.getPhotoFromCamera
             * @param p_retourCapture
             * @returns {*}
             */
            getPhotoFromCamera: function(p_retourCapture){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnCaptureImg = p_retourCapture;

                    navigator.camera.getPicture(_onPhotoSuccess, _onPhotoFail, { quality: 50, destinationType: _destinationType.DATA_URL });

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.getPhotoFromCamera: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Mobile.getPhotoFromLibrary
             * @param p_retourCapture
             * @returns {*}
             */
            getPhotoFromLibrary: function(p_retourCapture){
                try {
                    var boolRetour = true;

                    $.Oda.Mobile.funcReturnCaptureImg = p_retourCapture;

                    navigator.camera.getPicture(_onPhotoURISuccess, _onPhotoFail, { quality: 50, destinationType: _destinationType.FILE_URI, sourceType: _pictureSource.PHOTOLIBRARY });

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Mobile.getPhotoFromLibrary: " + er.message);
                    return null;
                }
            }
        },

        MokUp: {
            mokup: [],
            /**
             * @name $.Oda.MokUp.get
             * @param params
             * @param params.url
             * @param params.tabInput
             * @returns {*}
             */
            get: function(params){
                try {
                    var strInterface = params.url.replace($.Oda.Context.rest,"");

                    var elt;
                    for(var indice in $.Oda.MokUp.mokup){
                        if(params.url.includes($.Oda.MokUp.mokup[indice].interface)){
                            elt = $.Oda.MokUp.mokup[indice];
                            break;
                        }
                    }

                    var defaultValue = {"strErreur":"No mokup found for "+strInterface,"data":{},"statut":4};
                    var value = null;
                    if($.Oda.Tooling.isUndefined(elt)){
                        return defaultValue;
                    }else{
                        var attrs = $.Oda.Tooling.clone(params.tabInput);
                        if (attrs.hasOwnProperty("ctrl")) {
                            delete attrs.ctrl;
                        }
                        if (attrs.hasOwnProperty("milis")) {
                            delete attrs.milis;
                        }
                        if (attrs.hasOwnProperty("keyAuthODA")) {
                            delete attrs.keyAuthODA;
                        }

                        for(var indice in elt.value){
                            var valuePossible = elt.value[indice];
                            if(valuePossible.args === "default"){
                                defaultValue = valuePossible.return;
                            }
                            if($.Oda.Tooling.deepEqual(valuePossible.args,attrs)){
                                value = valuePossible.return;
                                break;
                            }
                        }
                    }
                    return (value === null) ? defaultValue : value;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.MokUp.get : " + er.message);
                    return null;
                }
            }
        },

        Event: {
            /**
             * @name $.Oda.Event.addListener
             * @param {Object} p_params
             * @param {string} p_params.name
             * @param {function} p_params.callback function(e) { e.detail ... }
             * @returns {$.Oda.Event}
             */
            addListener: function(p_params) {
                try {
                    // Listen for the event.
                    $.Oda.Context.window.addEventListener(p_params.name, p_params.callback, false);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Event.addListener : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Event.send
             * @param {Object} p_params
             * @param {string} p_params.name
             * @param {object} p_params.data
             * @returns {$.Oda.Event}
             */
            send: function(p_params) {
                try {
                    if(!p_params.hasOwnProperty("data")){
                        p_params.data = {};
                    }
                    var event = new CustomEvent(p_params.name, { detail : p_params.data });
                    $.Oda.Context.window.dispatchEvent(event);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Event.send : " + er.message);
                    return null;
                }
            }
        },

        Date: {
            /**
             * @name $.Oda.Date.getStrDateFR
             * @returns {String}
             */
            getStrDateFR : function(){
                try {
                    var currentTime = new Date();
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var strDate = jour + "/" + mois + "/" + annee;
                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFR() : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Date.getStrDateTimeFrFromUs
             * @param {String} p_strDateTime
             * @returns {String}
             */
            getStrDateTimeFrFromUs : function(p_strDateTime) {
                try {
                    var strDate = "";

                    strDate = p_strDateTime.substr(8,2) + "/" + p_strDateTime.substr(5,2) + "/" + p_strDateTime.substr(0,4) + " " + p_strDateTime.substr(10,(p_strDateTime.length - 10));

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTimeFrFromUs : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Date.getStrDateFrFromUs
             * @param {String} p_strDate
             * @returns {String}
             */
            getStrDateFrFromUs : function(p_strDate) {
                try {
                    var strDate = "";

                    strDate = p_strDate.substr(8,2) + "/" + p_strDate.substr(5,2) + "/" + p_strDate.substr(0,4);

                    return strDate;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateFrFromUs : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Date.convertSecondsToTime
             * @desc Seconds to hh:mm:ss
             * @param {int} p_second
             * @returns {String}
             */
            convertSecondsToTime : function(p_second) {
                try {
                    var sec_num = p_second;
                    var hours   = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);

                    if (hours   < 10) {hours   = "0"+hours;}
                    if (minutes < 10) {minutes = "0"+minutes;}
                    if (seconds < 10) {seconds = "0"+seconds;}
                    var time    = hours+':'+minutes+':'+seconds;
                    return time;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.convertSecondsToTime : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Date.getStrDateTime
             * @returns {String}
             */
            getStrDateTime : function() {
                try {
                    var currentTime = new Date();
                    var hours = $.Oda.Tooling.pad2(currentTime.getHours());
                    var minutes = $.Oda.Tooling.pad2(currentTime.getMinutes());
                    var annee = currentTime.getFullYear();
                    var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                    var jour = $.Oda.Tooling.pad2(currentTime.getDate());
                    var secondes = $.Oda.Tooling.pad2(currentTime.getSeconds());
                    var strDateTime = annee + "/" + mois + "/" + jour + " " + hours + ":" + minutes + ":" + secondes;
                    return strDateTime;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.getStrDateTime: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Date.dateFormat
             * @param {Date} myDate
             * @param {string} format
             * @example $.Oda.Date.dateFormat(new Date(), "yyyy-mm-dd")
             * @returns {string}
             */
            dateFormat: function(myDate, format){
                try {
                    if(!(myDate instanceof Date)){
                        myDate = new Date(myDate);
                    }

                    var yearFull = myDate.getFullYear();
                    var year = myDate.getYear();
                    var mounth = $.Oda.Tooling.pad2(myDate.getMonth() + 1);
                    var day = $.Oda.Tooling.pad2(myDate.getDate());
                    var hour = $.Oda.Tooling.pad2(myDate.getHours());
                    var minute = $.Oda.Tooling.pad2(myDate.getMinutes());
                    var second = $.Oda.Tooling.pad2(myDate.getSeconds());

                    var response = format
                    .replace(new RegExp('yyyy', "ig"), yearFull)
                    .replace(new RegExp('yy', "ig"),year)
                    .replace(new RegExp('mm', "ig"),mounth)
                    .replace(new RegExp('dd', "ig"),day)
                    .replace(new RegExp('hh', "ig"),hour)
                    .replace(new RegExp('mi', "ig"),minute)
                    .replace(new RegExp('ss', "ig"),second);

                    return response;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Date.dateFormat: " + er.message);
                    return null;
                }
            },
        },

        Interface: {
            /**
             * @name $.Oda.Interface.call
             * @desc factorisation pour choisir le type de call à faire
             * @param params
             * @returns {{strErreur: string, data: {}, statut: number}}
             */
            call: function(params){
                var response = {strErreur: "No call", data: {}, statut: 4}
                if(params.odaInterface.length>0){
                    var theInterface = params.odaInterface[0];
                    params.odaInterface.splice(0,1);
                    $.Oda.Log.debug("Call "+theInterface+" begin for: "+params.url);
                    response = $.Oda.Interface.Methode[theInterface](params);
                }
                return response;
            },
            /**
             * @name $.Oda.Interface.callRest
             * @desc For ajax call with more
             * @param {String} p_url
             * @param {Object} p_tabSetting
             * @param p_tabSetting.callback
             * @param p_tabSetting.odaCacheOnDemande
             * @param {Object} p_tabInput
             * @example 
             *  $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/user/search/mail/", {callback:function(response){
             *      console.log("hello");
             *      console.log(response);
             *  }}, { 
             *      email: "mail@mail.com"
             *  });
             * @returns {Object}
             */
            callRest: function(p_url, p_tabSetting, p_tabInput) {
                try {
                    //For no reg
                    if(p_tabSetting.hasOwnProperty("functionRetour") && !p_tabSetting.hasOwnProperty("callback")){
                        p_tabSetting.callback = p_tabSetting.functionRetour;
                        delete p_tabSetting.functionRetour;
                    }

                    var interfaces = $.Oda.Tooling.clone($.Oda.Context.modeInterface);
                    //remove using cache in debug mode
                    if($.Oda.Context.dev){
                        for(var index in interfaces){
                            if(interfaces[index] === "cache"){
                                interfaces.splice(index,1);
                            }
                        }
                    }
                    var jsonAjaxParam = {
                        url: p_url,
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        dataType: 'json',
                        type: 'GET',
                        async: p_tabSetting.hasOwnProperty("callback"),
                        odaInterface:interfaces,
                        context : {}
                    };

                    if(!p_tabSetting.hasOwnProperty("odaCacheOnDemande")){
                        p_tabSetting.odaCacheOnDemande = false;
                    }

                    if((p_tabInput === null) || (p_tabInput === undefined)){
                        p_tabInput = {
                            keyAuthODA: null
                        };
                    }

                    //création du jeton pour la secu
                    var session = $.Oda.Storage.get("ODA-SESSION");
                    var key = null;
                    if (session !== null) {
                        key = session.key;
                    } else {
                        key = p_tabInput.keyAuthODA;
                        delete p_tabInput.keyAuthODA;
                    }

                    p_tabInput.milis = $.Oda.Tooling.getMilise();
                    p_tabInput.ctrl = "OK";
                    p_tabInput.keyAuthODA = key;

                    jsonAjaxParam.data = p_tabInput;

                    for (var indice in p_tabSetting) {
                        jsonAjaxParam[indice] = p_tabSetting[indice];
                    }

                    jsonAjaxParam.context.odaKey = p_url;
                    jsonAjaxParam.context.odaAttrs = p_tabInput;

                    return $.Oda.Interface.call(jsonAjaxParam);
                } catch (er) {
                    var msg = "$.Oda.Interface.callRest : " + er.message;
                    $.Oda.Context.console.error(msg);
                    return null;
                }
            },
            Methode: {
                /**
                 * @name $.Oda.Interface.Methode.ajax
                 */
                ajax: function(params) {
                    var retour;
                    var jqXHRMaster = $.ajax(params)
                        .done(function(data, textStatus, jqXHR) {
                            if(data === undefined){
                                data = {strErreur: '', data: {}, statut: 4};
                            }else{
                                if (typeof data === 'object') {
                                    if ((data.hasOwnProperty("strErreur")) && ((data.strErreur == "key auth expiree.") || (data.strErreur == "key auth invalid."))) {
                                        $.Oda.Security.logout();
                                    }
                                } else {
                                    data = {strErreur: data, data: {}, statut: 4};
                                }
                            }

                            if((data.hasOwnProperty("strErreur")) && (data.strErreur === "not found")){
                                //go next interface on "not found rest"" Oda response
                                if((params.odaInterface.length>0)){
                                    retour = $.Oda.Interface.call(params);
                                }else{
                                    //Display the error message
                                    $.Oda.Event.send({
                                        name: "oda-notification-flash", 
                                        data: {
                                            type: "error", 
                                            msg: "$.Oda.Interface.Methode.ajax: " + data.strErreur
                                        }
                                    });
                                }
                            }else if ((data.hasOwnProperty("strErreur")) && (data.strErreur !== "") && (data.statut === 4)) {
                                //Display the error message
                                $.Oda.Event.send({
                                    name: "oda-notification-flash", 
                                    data: {
                                        type: "error", 
                                        msg: "$.Oda.Interface.Methode.ajax: " + data.strErreur
                                    }
                                });
                            } else if ($.Oda.Tooling.isInArray("cache", $.Oda.Context.modeInterface)){
                                //Store for cache
                                var attrs = $.Oda.Tooling.clone(this.odaAttrs);
                                if (attrs.hasOwnProperty("ctrl")) {
                                    delete attrs.ctrl;
                                }
                                if (attrs.hasOwnProperty("milis")) {
                                    delete attrs.milis;
                                }
                                if (attrs.hasOwnProperty("keyAuthODA")) {
                                    delete attrs.keyAuthODA;
                                }
                                $.Oda.Cache.save({
                                    key: this.odaKey,
                                    attrs: attrs,
                                    datas: data
                                });
                                $.Oda.Log.debug("Call ajax success for: "+params.url);
                                data.context = this;
                                if ($.Oda.Tooling.isUndefined(params.callback)) {
                                    retour = data;
                                }else {
                                    params.callback(data);
                                }
                            }else{
                                $.Oda.Log.debug("Call ajax success for: "+params.url);
                                data.context = this;
                                if ($.Oda.Tooling.isUndefined(params.callback)) {
                                    retour = data;
                                }else {
                                    params.callback(data);
                                }
                            }
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            var msg = textStatus + " - " + errorThrown + " on " + params.url;
                            $.Oda.Log.error("$.Oda.Interface.Methode.ajax: " + msg);

                            var data = {"strErreur": msg, "data": {}, "statut": 404};

                            if((params.odaInterface.length>0)&&(textStatus === "error")){
                                retour = $.Oda.Interface.call(params);
                            }else{
                                $.Oda.Event.send({
                                    name: "oda-notification-flash", 
                                    data: {
                                        type: "error", 
                                        msg: "$.Oda.Interface.Methode.ajax: " + msg
                                    }
                                });
                                data.context = this;
                                if ($.Oda.Tooling.isUndefined(params.callback)) {
                                    retour = data;
                                } else {
                                    params.callback(data);
                                }
                            }
                        });
                    return retour;
                },
                /**
                 * @name $.Oda.Interface.Methode.mokup
                 * @param params
                 * @returns {*}
                 */
                mokup: function(params) {
                    var retour = $.Oda.MokUp.get({url: params.url, tabInput: params.data});
                    if((retour.hasOwnProperty("strErreur")) && (retour.strErreur.startsWith("No mokup found for")) && (params.odaInterface.length>0)){
                        return $.Oda.Interface.call(params);
                    }else{
                        retour.context = params.context;
                        $.Oda.Log.debug("Call mokup success for : "+params.url);
                        if ($.Oda.Tooling.isUndefined(params.callback)) {
                            return retour;
                        } else {
                            params.callback(retour);
                            return;
                        }
                    }
                },
                /**
                 * @name $.Oda.Interface.Methode.cache
                 * @param params
                 * @returns {*}
                 */
                cache: function(params) {
                    var attrs = $.Oda.Tooling.clone(params.data);
                    if(attrs.hasOwnProperty("ctrl")){
                        delete attrs.ctrl;
                    }
                    if(attrs.hasOwnProperty("milis")){
                        delete attrs.milis;
                    }
                    if(attrs.hasOwnProperty("keyAuthODA")){
                        delete attrs.keyAuthODA;
                    }
                    var retour = $.Oda.Cache.load({key: params.url, attrs: attrs, demande: params.odaCacheOnDemande});
                    if(retour){
                        var datas = retour.datas;
                        datas.context = params.context;
                        $.Oda.Log.debug("Call cache success for: "+params.url);
                        if ($.Oda.Tooling.isUndefined(params.callback)) {
                            return datas;
                        } else {
                            params.callback(datas);
                            return;
                        }
                    }else{
                        if(params.odaInterface.length>0){
                            return $.Oda.Interface.call(params);
                        }else{
                            var msg = "No found in cache: "+params.url+", and cache is the last interface.";
                            $.Oda.Event.send({
                                name: "oda-notification-flash", 
                                data: {
                                    type: "error", 
                                    msg: msg
                                }
                            });
                            var data = {strErreur: msg, data: {}, statut: 404};
                            $.Oda.Log.error(msg);
                            data.context = params.context;
                            if ($.Oda.Tooling.isUndefined(params.callback)) {
                                return data;
                            } else {
                                params.callback(data);
                                return;
                            }
                        }
                    }
                },
                /**
                 * @name $.Oda.Interface.Methode.offline
                 * @param {Object} p_params
                 * @param p_params.attr
                 * @returns {$.Oda.Interface}
                 */
                offline: function(params) {
                    try {
                        var attrs = $.Oda.Tooling.clone(params.data);
                        if(attrs.hasOwnProperty("ctrl")){
                            delete attrs.ctrl;
                        }
                        if(attrs.hasOwnProperty("milis")){
                            delete attrs.milis;
                        }
                        if(attrs.hasOwnProperty("keyAuthODA")){
                            delete attrs.keyAuthODA;
                        }
                        var retour = $.Oda.Cache.loadWithOutTtl({key: params.url, attrs: attrs});

                        if(retour){
                            var datas = retour.datas;
                            datas.context = params.context;
                            $.Oda.Log.debug("Call offline success for : "+params.url);
                            if ($.Oda.Tooling.isUndefined(params.callback)) {
                                return datas;
                            } else {
                                params.callback(datas);
                                return;
                            }
                        }else{
                            if(params.odaInterface.length>0){
                                return $.Oda.Interface.call(params);
                            }else{
                                var msg = "No found in offline : "+params.url+", and offline is the last interface.";
                                $.Oda.Event.send({
                                    name: "oda-notification-flash", 
                                    data: {
                                        type: "error", 
                                        msg: msg
                                    }
                                });
                                var data = {strErreur: msg, data: {}, statut: 404};
                                data.context = params.context;
                                if ($.Oda.Tooling.isUndefined(params.callback)) {
                                    return data;
                                } else {
                                    params.callback(data);
                                    return;
                                }
                            }
                        }
                    } catch (er) {
                        $.Oda.Context.console.error("$.Oda.Interface.offline : " + er.message);
                        return null;
                    }
                },
            },
            /**
             * @name $.Oda.Interface.getParameter
             * #ex $.Oda.Interface.getParameter("contact_mail_administrateur");
             * @param {string} p_param_name
             * @returns { int|varchar }
             */
            getParameter: function(p_param_name) {
                try {
                    var strResponse;
                    var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/sys/param/"+p_param_name, {});
                    if(json_retour.strErreur === ""){
                        var type = json_retour.data.param_type;
                        var value = json_retour.data.param_value;
                        switch (type) {
                            case "int":
                                strResponse = parseInt(value);
                                break;
                            case "float":
                                strResponse = $.Oda.Tooling.arrondir(parseFloat(value),2);
                                break;
                            case "varchar":
                                strResponse =  value;
                                break;
                            default:
                                strResponse =  value;
                                break;
                        }
                    }

                    return strResponse;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.getParameter : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Interface.getRangs
             * @returns {json}
             */
            getRangs: function() {
                try {
                    var valeur = $.Oda.Storage.get("ODA_rangs");
                    if(valeur === null){
                        var retour = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/rank/", {});
                        if(retour.strErreur === ""){
                            valeur = retour.data;
                        }else{
                            $.Oda.Display.Notification.error(retour.strErreur);
                        }

                        $.Oda.Storage.set("ODA_rangs",valeur,$.Oda.Storage.ttl_default);
                    }

                    return valeur;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.getRangs: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Interface.addStat
             * @example $.Oda.Interface.addStat('ADMI', 'page_home.html', 'checkAuth : ok');
             * @param {String} p_user
             * @param {String} p_page
             * @param {String} p_action
             */
            addStat: function(p_user, p_page, p_action) {
                try {
                     $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/sys/page/trace", {type: "post", callback: function(){
                         $.Oda.Log.debug("$.Oda.Interface.addStat:'"+p_user+"', '"+p_page+"', '"+p_action+"'");
                     }}, {
                        user: p_user,
                        page: p_page,
                        action: p_action
                    });
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.addStat: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Interface.sendMail
             * @example $.Oda.Interface.sendMail({email_mails_dest:'fabrice.rosito@gmail.com',message_html:'HelloContent',sujet:'HelloSujet'});
             * @example return {"data":{"resultat": "ok"}}
             * @param {Object} p_params
             * @param {String} p_params.email_mails_dest mandatory 
             * @param {String} p_params.message_html mandatory 
             * @param {String} p_params.sujet mandatory 
             * @param {String} p_params.email_mail_ori optional 
             * @param {String} p_params.email_labelle_ori optional 
             * @param {String} p_params.email_mail_reply optional 
             * @param {String} p_params.email_labelle_reply optional 
             * @param {String} p_params.email_mails_copy optional 
             * @param {String} p_params.email_mails_cache optional 
             * @param {String} p_params.message_txt optional 
             * @returns {Object}
             */
            sendMail: function(p_params) {
                try {
                    var params_attempt = {
                        email_mails_dest : null,
                        message_html : null,
                        sujet : null
                    };

                    var params = $.Oda.Tooling.checkParams(p_params, params_attempt);
                    if(params === null){
                        return false;
                    }

                    var returns = $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/script/send_mail.php", {type : 'POST'}, params);

                    return returns;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Interface.sendMail :" + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Interface.traceLog
             * @example $.Oda.Interface.traceLog({msg:"hello"});
             * @param {Object} p_params
             * @param {String} p_params.msg
             * @returns {$.Oda.Interface}
             */
            traceLog: function(p_params) {
                try {
                    $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/sys/log/", {type: "post", callback: function(response){
                        $.Oda.Log.debug("Log success id:"+response.data);
                    }}, {
                        type: 1,
                        msg: p_params.msg
                    });
                    return this;
                } catch (er) {
                    $.Oda.Context.console.error("$.Oda.Interface.traceLog) :" + er.message);
                    return null;
                }
            },
        },

        Display: {
            Polyfill: {
                /**
                 * @name $.Oda.Display.Polyfill.createHtmlElement
                 * @param {Object} params
                 * @param params.name mandatory
                 * @param params.createdCallback mandatory var elt = $(this);
                 * @param params.attachedCallback optional
                 * @param params.detachedCallback optional
                 * @param params.attributeChangedCallback optional (attrName, oldValue, newValue)
                 * @returns {$.Oda.Polyfill}
                 */
                /** example <oda-card card-id="1" card-quality="Rare">Abomination</oda-card>
                    $.Oda.Display.Polyfill.createHtmlElement({
                        name: "oda-card",
                        createdCallback: function(){
                            var elt = $(this);
                            var id = elt.attr("card-id");
                            var qualite = elt.attr("card-quality");
                            elt.css("color", $.Oda.App.colorCard[qualite]);
                            elt.attr("data-toggle","tooltip");
                            elt.attr("data-placement","auto");
                            elt.attr("data-html",true);
                            elt.attr("class",'oda-tooltip-class');
                            elt.attr("title",'<img src="img/cards/'+id+'.png" />');
                            elt.tooltip();
                        }
                    });
                 */
                createHtmlElement: function(params){
                    try {
                        $.Oda.Log.debug("CreateHtmlElement: " + params.name);
                        var elt = Object.create(HTMLElement.prototype);
                        
                        elt.createdCallback = params.createdCallback;

                        if(params.attributeChangedCallback !== undefined){
                            elt.attributeChangedCallback = params.attributeChangedCallback;
                        }

                        if(params.attachedCallback !== undefined){
                            elt.attachedCallback = params.attachedCallback;
                        }

                        if(params.detachedCallback !== undefined){
                            elt.detachedCallback = params.detachedCallback;
                        }
                            
                        document.registerElement(params.name, {
                            prototype: elt
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.polyfill.createHtmlElement : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Polyfill.extendHtmlElement
                 * @param {Object} params
                 * @param params.name mandatory
                 * @param params.type mandatory a, p, br, etc
                 * @param params.createdCallback mandatory var elt = $(this);
                 * @param params.attachedCallback optional
                 * @param params.detachedCallback optional
                 * @param params.attributeChangedCallback optional (attrName, oldValue, newValue)
                 * @returns {$.Oda.Polyfill}
                 */
                /** example <a href="coucou" is="oda-link" oda-link-value="nonici">Hello</a>
                    $.Oda.Display.Polyfill.extendHtmlElement({
                        name: "oda-link",
                        type: "a",
                        createdCallback: function(){
                            var elt = $(this);
                            var link = elt.attr("oda-link-value");
                            console.log("link: "+ link);
                        }
                    });
                */
                extendHtmlElement: function(params){
                    try {
                        $.Oda.Log.debug("extendHtmlElement: " + params.name);
                        
                        var elt = Object.create(HTMLElement.prototype);
                        
                        elt.createdCallback = params.createdCallback;

                        if(params.attributeChangedCallback !== undefined){
                            elt.attributeChangedCallback = params.attributeChangedCallback;
                        }

                        if(params.attachedCallback !== undefined){
                            elt.attachedCallback = params.attachedCallback;
                        }

                        if(params.detachedCallback !== undefined){
                            elt.detachedCallback = params.detachedCallback;
                        }
                            
                        document.registerElement(params.name, {
                            prototype: elt,
                            extends: params.type
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.polyfill.extendHtmlElement : " + er.message);
                        return null;
                    }
                }
            },
            Notification: {
                id: 0,
                /**
                 * @name $.Oda.Display.Notification.success
                 * @example $.Oda.Display.Notification.success("Hello !");
                 * @param {String} p_message
                 * @returns {$.Oda.Display.Notification}
                 */
                success: function(p_message){
                    this.create(p_message,"success", 2000);
                },
                /**
                 * @name $.Oda.Display.Notification.successI8n
                 * @example $.Oda.Display.Notification.successI8n("home.hello");
                 * @param {String} p_message
                 * @returns {$.Oda.Display.Notification}
                 */
                successI8n: function(p_message){
                    this.create($.Oda.I8n.getByString(p_message),"success", 2000);
                },
                /**
                 * @name $.Oda.Display.Notification.info
                 */
                info: function(p_message){
                    this.create(p_message,"info", 3000);
                },
                /**
                 * @name $.Oda.Display.Notification.infoI8n
                 */
                infoI8n: function(p_message){
                    this.create($.Oda.I8n.getByString(p_message),"info", 3000);
                },
                /**
                 * @name $.Oda.Display.Notification.warning
                 */
                warning: function(p_message){
                    this.create(p_message,"warning", 5000);
                },
                /**
                 * @name $.Oda.Display.Notification.warningI8n
                 */
                warningI8n: function(p_message){
                    this.create($.Oda.I8n.getByString(p_message),"warning", 5000);
                },
                /**
                 * @name $.Oda.Display.Notification.danger
                 */
                danger: function(p_message){
                    this.create(p_message,"danger");
                },
                /**
                 * @name $.Oda.Display.Notification.dangerI8n
                 */
                dangerI8n: function(p_message){
                    this.create($.Oda.I8n.getByString(p_message),"danger");
                },
                /**
                 * @name $.Oda.Display.Notification.error
                 */
                error: function(p_message){
                    this.create(p_message,"danger");
                    $.Oda.Log.error(p_message);
                },
                /**
                 * @name $.Oda.Display.Notification.errorI8n
                 */
                errorI8n: function(p_message){
                    var message = $.Oda.I8n.getByString(p_message);
                    this.create(message,"danger");
                    $.Oda.Log.error(message);
                },
                /**
                 * @name $.Oda.Display.Notification.load
                 * @returns {$.Oda.Notification}
                 */
                load: function() {
                    try {
                        var html = $.Oda.Display.TemplateHtml.create({
                            template : "oda-notification-tpl"
                        });
                        $("body").append(html);
                        $.Oda.Event.addListener({name : "oda-notification-flash", callback : function(e){
                            $.Oda.Display.Notification[e.detail.type](e.detail.msg);
                            return this;
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.load : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Notification.create
                 * @desc Show notification
                 * @param {string} p_message
                 * @param {string} p_type
                 * @param {int} p_type
                 * @returns {boolean}
                 */
                create: function(p_message, p_type, time) {
                    try {
                        $.Oda.Display.Notification.id++;
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "oda-notification-message-tpl",
                            scope:{
                                type: p_type,
                                id: $.Oda.Display.Notification.id,
                                message: p_message
                            }
                        });
                        $("#oda-notification").append(strHtml);

                        if(!$.Oda.Tooling.isUndefined(time)){
                            $.Oda.Tooling.timeout($.Oda.Display.Notification.remove,time,{id:$.Oda.Display.Notification.id});
                        }

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.create :" + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Notification.remove
                 * @param {object} params
                 * @param {int} params.id
                 * @returns {$.Oda.Notification}
                 */
                remove: function(params){
                    try {
                        $('#oda-notification-'+params.id).fadeOut( 500, function(){
                            $( this ).remove();
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.remove :" + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Notification.removeAll
                 * @returns {$.Oda.Notification}
                 */
                removeAll: function(){
                    try {
                        var $notif = $("[id^='oda-notification-']").filter(function(index){
                            var $elt = $(this);
                            return $elt.hasClass("alert");
                        }).fadeOut( 500, function(){
                            $( this ).remove();
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Notification.removeAll :" + er.message);
                        return null;
                    }
                }
            },
            Scene: {
                /**
                 * @name $.Oda.Display.Scene.load
                 * @returns {$.Oda.Display.Scene}
                 */
                load: function() {
                    try {
                        var htmlScene = $.Oda.Display.TemplateHtml.create({
                            template : "oda-scene-tpl"
                        });
                        $("body").append(htmlScene);

                        $("[oda-avatar-name=avatar]").click(function(e) {
                            e.preventDefault();
                            $("#wrapper").toggleClass("toggled");
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Scene.load : " + er.message);
                        return null;
                    }
                },
            },
            MenuSlide: {
                display: false,
                /**
                 * @name $.Oda.Display.MenuSlide.show
                 */
                show: function(){
                    try {
                        if (!this.display) {
                            var strHtml = $.Oda.Display.TemplateHtml.create({
                                template: "oda-scene-menuSlide-logged-tpl",
                                scope: {
                                    firstName: $.Oda.Session.userInfo.firstName.substr(0,9),
                                    lastName: $.Oda.Session.userInfo.lastName.substr(0,9)
                                }
                            });
                            $('#menuSlide').html(strHtml);
                            this.display = true;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.show : " + er.message);
                    }
                },
                /**
                 * @name $.Oda.Display.MenuSlide.remove
                 */
                remove: function(){
                    try {
                        $("#wrapper").removeClass("toggled");
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template: "oda-scene-menuSlide-default-tpl"
                        });
                        $('#menuSlide').html(strHtml);
                        this.display = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.MenuSlide.remove: " + er.message);
                    }
                }
            },
            Menu: {
                display: false,
                /**
                 * @name $.Oda.Display.Menu.show
                 */
                show: function(){
                    try {
                        if(!this.display){
                            $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/navigation/right/", {"callback": function(response){
                                var strHTML = "";
                                var datas = response.data;
                                var cate = "";

                                for (var indice in datas) {
                                    if((datas[indice].id_categorie !== "98") && ((datas[indice].id_categorie !== "1"))){
                                        if(datas[indice].id_categorie !== cate){
                                            cate = datas[indice].id_categorie;
                                            if(indice !== "0"){
                                                strHTML += "</ul></li>";
                                            }

                                            strHTML += '<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><oda-label oda-label-value="'+datas[indice].Description_cate+'"/><span class="caret"></span></a><ul class="dropdown-menu" role="menu">';
                                        }
                                        var route = datas[indice].Lien;
                                        route = route.replace("api_page_","");
                                        route = route.replace("page_","");
                                        route = route.replace(".html","");
                                        strHTML += "<li><a onclick=\"$.Oda.Router.navigateTo({'route':'"+route+"','args':{}});\"><oda-label oda-label-value='"+datas[indice].Description_courte+"'/></a></li>";
                                    }
                                }
                                $('#menu').html(strHTML);
                                $.Oda.Display.display = true;
                            }});
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.show : " + er.message);
                    }
                },
                /**
                 * @name $.Oda.Display.Menu.remove
                 */
                remove: function(){
                    try {
                        $('#menu').html('');
                        this.display = false;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Menu.remove : " + er.message);
                    }
                }
            },
            Message: {
                /**
                 * @name $.Oda.Display.Message.show
                 * @returns {$.Oda}
                 */
                show: function() {
                    try {
                        $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/message/current", { callback: function(response) {
                            for(var indice in response.data){
                                var message = response.data[indice];
                                if ( ! $( "#oda-message-"+message.id ).length ) {
                                    var strHtml = $.Oda.Display.TemplateHtml.create({
                                        template: "oda-message-tpl",
                                        scope: {
                                            alertType: message.niveau,
                                            id: message.id,
                                            message: message.message
                                        }
                                    });
                                    $('#'+$.Oda.Context.mainDiv).before(strHtml);
                                }
                            }
                        }}, { 
                            code_user: $.Oda.Session.code_user
                         });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.show: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Message.hide
                 * @param {object} p_params
                 * @param {object} p_params.id
                 * @returns {$.Oda}
                 */
                hide: function(p_params) {
                    try {
                        $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/message/read/"+p_params.id , {callback: function(datas) {
                            $('#oda-message-'+p_params.id).remove();
                        }});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Message.hide  : " + er.message);
                        return null;
                    }
                }
            },
            Popup: {
                iterator: 0,
                /**
                 * @name $.Oda.Display.Popup.open
                 * @param {Object} p_params
                 * @param {string} p_params.name opt
                 * @param {string} p_params.size opt (sm, lg)
                 * @param {string} p_params.label
                 * @param {string} p_params.details
                 * @param {string} p_params.footer opt
                 * @param {function} p_params.callback opt
                 * @param {object} p_params.callbackParams opt
                 */
                open: function(p_params){
                    try {
                        if(!p_params.hasOwnProperty("name")){
                            $.Oda.Display.Popup.iterator++;
                            p_params.name = 'oda-popup' + $.Oda.Display.Popup.iterator;
                        }

                        var htmlPopUp = $.Oda.Display.TemplateHtml.create({
                            template : "oda-popup-tpl",
                            scope : {
                                name : p_params.name
                            }
                        });
                        $( "body" ).append(htmlPopUp);

                        if(p_params.hasOwnProperty("size")){
                            $('#'+p_params.name+' .modal-dialog').addClass("modal-"+p_params.size);
                        }

                        $('#'+p_params.name+'_label').html("<b>"+p_params.label+"</b>");

                        var contentPopup = p_params.details;
                        $('#'+p_params.name+'_content').html(contentPopup);

                        if(p_params.hasOwnProperty("footer")){
                            $('#'+p_params.name+'_footer').html(p_params.footer);
                        }else{
                            $('#'+p_params.name+'_footer').html('<button type="button" class="btn btn-default" data-dismiss="modal"><oda-label oda-label-value="oda-main.bt-close"/></button>');
                        }

                        if(p_params.hasOwnProperty("callback")) {
                            $('#'+p_params.name).on('shown.bs.modal', function(e) {
                                if(p_params.hasOwnProperty("callbackParams")) {
                                    p_params.callback(p_params.callbackParams);
                                }else{
                                    p_params.callback();
                                }
                            });
                        }else{
                            $( "#"+p_params.name ).unbind( "shown.bs.modal" );
                        }

                        $('#'+p_params.name).on('hidden.bs.modal', function(e) {
                            $('#'+p_params.name).remove();
                        })

                        $('#'+p_params.name).modal("show");
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.open : " + er.message);
                    }
                },
                /**
                 * @name $.Oda.Display.Popup.close
                 * @param {object} p_params
                 * @param {string} p_params.name
                 * @returns {$.Oda.Display.Popup}
                 */
                close: function(p_params) {
                    try {
                        if($.Oda.Tooling.isUndefined(p_params)){
                            var p_params = {};
                        }

                        if(!p_params.hasOwnProperty('name')){
                            p_params.name = 'oda-popup' + $.Oda.Display.Popup.iterator;
                        }

                        $('#'+p_params.name).modal("hide");
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.close : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Popup.closeAll
                 * @returns {$.Oda.Display.Popup}
                 */
                closeAll: function() {
                    try {
                        $('.modal').each(function(index, value) {
                            $(value).modal("hide");
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Popup.closeAll : " + er.message);
                        return null;
                    }
                }
            },
            TemplateHtml: {
                iterateLoadTemplate:0,
                /**
                 * @name $.Oda.Display.TemplateHtml.create
                 * @param {Object} p_params
                 * @param {string} p_params.template
                 * @param {Object} p_params.scope opt
                 * @param {Function} p_params.callback opt
                 * @returns {$.Oda.Display.TemplateHtml}
                 */
                create: function(p_params) {
                    try {
                        $.Oda.Log.debug("$.Oda.Display.TemplateHtml.create: " + p_params.template);
                        var $template = $('#'+p_params.template);
                        if(p_params.hasOwnProperty("callback")){
                        
                            if($template.html() === undefined){
                                if($.Oda.Display.TemplateHtml.iterateLoadTemplate < 10){
                                    $.Oda.Display.TemplateHtml.iterateLoadTemplate++;
                                    $.Oda.Log.error("$.Oda.Display.TemplateHtml.create: template load problem, retry.");
                                    setTimeout(function(){ 
                                        $.Oda.Display.TemplateHtml.create(p_params);
                                    }, 200);
                                }
                            }else{
                                var strHtml = $template.html();

                                if(p_params.hasOwnProperty("scope")){
                                    var listExpression = $.Oda.Tooling.findBetweenWords({str: $template.html(), first: "{{", last: "}}" });
                                    for(var indice in listExpression){
                                        var resultEval = $.Oda.Display.TemplateHtml.eval({exrp: listExpression[indice], scope: p_params.scope});
                                        strHtml = $.Oda.Tooling.replaceAll({str: strHtml, find: '{{'+listExpression[indice]+'}}', by: resultEval});
                                    }
                                }

                                p_params.callback(strHtml);
                            }
                        }else{
                            if($template.html() === undefined){
                                throw new Error("Template not load.");
                            }

                            var strHtml = $template.html();

                            if(p_params.hasOwnProperty("scope")){
                                var listExpression = $.Oda.Tooling.findBetweenWords({str: $template.html(), first: "{{", last: "}}" });
                                for(var indice in listExpression){
                                    var resultEval = $.Oda.Display.TemplateHtml.eval({exrp: listExpression[indice], scope: p_params.scope});
                                    strHtml = $.Oda.Tooling.replaceAll({str: strHtml, find: '{{'+listExpression[indice]+'}}', by: resultEval});
                                }
                            }

                            return strHtml;
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.create: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.TemplateHtml.eval
                 * @param {Object} p_params.exrp
                 * @param {Object} p_params.scope
                 * @param {Object} p_params
                 * @returns {String}
                 */
                eval: function(p_params) {
                    try {
                        'use strict'

                        var source = '(function(' + Object.keys(p_params.scope).join(', ') + ') { return ' + p_params.exrp + ';})';

                        var compiled = eval(source);

                        var result = [];
                        for (var property in p_params.scope) {
                            if (p_params.scope.hasOwnProperty(property)) {
                                result.push(p_params.scope[property]);
                            }
                        }

                        var evaluate = compiled.apply(p_params.scope, result);

                        return evaluate;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.TemplateHtml.eval : " + er.message);
                        return null;
                    }
                }
            },
            Table: {
                /**
                 * @name $.Oda.Display.Table.createDataTable
                 * @param {String} p_params.target
                 * @param {Array} p_params.data
                 * @param {Array} p_params.attribute
                 * @param {String} p_params.attribute[indice].header
                 * @param {Function(data, type, full, meta, row)} p_params.attribute[indice].value
                 * @param {Boolean} p_params.attribute[indice].withFilter Optional
                 * @param {String} p_params.attribute[indice].align Optional
                 * @param {String} p_params.attribute[indice].size Optional
                 * @param {Object} p_params.option Optional
                 * @param {Object} p_params
                 * @example $.Oda.Display.Table.createDataTable({
                 *      target: "test",
                 *      data: [{
                 *          id: 1
                 *      }],
                 *      attribute: [
                 *          {
                 *              header: "Id",
                 *              size: "50px",
                 *              align: "center",
                 *              value: function(data, type, full, meta, row){
                 *                  return row.id;
                 *              }
                 *          }
                 *      ]
                 *  });
                 * @returns {$.Oda.Display.Table}
                 */
                createDataTable: function(p_params){
                    try {
                        //Check if all params are presents
                        var params_attempt = {
                            target: null,
                            data: null,
                            attribute: null
                        };

                        var params = $.Oda.Tooling.checkParams(p_params, params_attempt);
                        if(params === null){
                            return false;
                        }

                        //Check if the format of data is correct
                        if(!Array.isArray(p_params.data)){
                            $.Oda.Log.error("$.Oda.Display.Table.createDataTable: paramater 'data' is not an array");
                            return false;
                        }else{
                            if((p_params.data.length > 0) && ($.Oda.Tooling.getTypeOfVar(p_params.data[0]) !== "Object")){
                                $.Oda.Log.error("$.Oda.Display.Table.createDataTable: content paramater 'data' is not an object");
                                return false;
                            }
                        }

                        var divTable = $('#'+p_params.target);

                        var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered hover" id="table-'+p_params.target+'" style="width: 100%">';

                        var footer = "";

                        for(var indice in p_params.attribute){
                            var eltA = p_params.attribute[indice];
                            if(eltA.hasOwnProperty('withFilter')){
                                footer += '<tfoot><tr>';
                                for(var indiceElt in p_params.attribute){
                                    var eltB = p_params.attribute[indiceElt];
                                    if(eltB.hasOwnProperty('withFilter') && eltB.withFilter){
                                        footer += '<th></th>';
                                    }else{
                                        footer += '<th>null</th>';
                                    }
                                }
                                footer += '</tr></tfoot>';
                                break;
                            }
                        }

                        strhtml += footer + '</table>';
                        divTable.html(strhtml);

                        var eltTable = $('#table-'+p_params.target);

                        var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(p_params.data);

                        var dataTableParamsDefault = {
                            "iDisplayLength": 20,
                            "language" : $.Oda.I8n.getByGroupName('oda-datatables'),
                            "aaData": objDataTable.data
                        };

                        var dataTableParams = $.Oda.Tooling.merge({
                            "default": dataTableParamsDefault,
                            "source": p_params.option
                        });

                        dataTableParams.aaData = objDataTable.data;

                        var columns = [];
                        var columnDefs = [];
                        var i = 0;
                        for(var key in p_params.attribute){
                            var colomn = {
                                "sTitle": p_params.attribute[key].header
                            }
                            if(p_params.attribute[key].hasOwnProperty('align')){
                                if(p_params.attribute[key].align === 'right'){
                                    colomn.sClass = 'dataTableColRight';
                                }else if(p_params.attribute[key].align === 'left'){
                                    colomn.sClass = 'dataTableColLeft';
                                }else if(p_params.attribute[key].align === 'center'){
                                    colomn.sClass = 'dataTableColCenter';
                                }else{
                                    colomn.sClass = p_params.attribute[key].align;
                                }
                            }
                            if(p_params.attribute[key].hasOwnProperty('size')){
                                colomn.width = p_params.attribute[key].size;
                            }
                            columns.push(colomn);

                            // do whatever you want to the function here
                            var temp = p_params.attribute[key].value.toString();

                            var reg = new RegExp("row.[a-zA-Z\_\-]+", "gi");
                            var tab = temp.match(reg);

                            for(var indice in tab){
                                var tabElt = tab[indice].split('.');
                                temp = $.Oda.Tooling.replaceAll({
                                    "str": temp,
                                    "find": tab[indice],
                                    "by": 'full['+objDataTable.entete[tabElt[1]]+']'
                                });
                            }

                            // now replace the original function
                            var newImple = new Function('data', 'type', 'full', 'meta', temp.substring(temp.indexOf('{')+1,temp.lastIndexOf('}')));

                            var value = {
                                "mRender": newImple,
                                "aTargets": [i]
                            }
                            columnDefs.push(value);
                            i++;
                        }

                        dataTableParams.aoColumns = columns;

                        dataTableParams.aoColumnDefs = columnDefs;

                        var oTable = eltTable.DataTable(dataTableParams);

                        $('#table-'+p_params.target+' tbody').on('click', 'tr', function() {
                            if ($(this).hasClass('selected')) {
                                $(this).removeClass('selected');
                            }
                            else {
                                oTable.$('tr.selected').removeClass('selected');
                                $(this).addClass('selected');
                            }
                        });

                        $('#table-'+p_params.target+' tfoot th').each(function(i) {
                            var valOdaAttri = $(this).attr("oda-attr");
                            if (valOdaAttri == "select") {
                                var select = $('<select data-mini="true"><option></option></select>')
                                    .appendTo($(this).empty())
                                    .on('change', function() {
                                        var val = $(this).val();

                                        oTable.column(i)
                                            .search(val ? '^' + $(this).val() + '$' : val, true, false)
                                            .draw();
                                    });

                                oTable.column(i - 1).data().unique().sort().each(function(d, j) {
                                    select.append('<option value="' + d + '">' + d + '</option>');
                                });
                            } else {
                                if($(this).html() !== 'null'){
                                    $('<input type="text" placeholder="Search" size="4"/>')
                                        .appendTo($(this).empty())
                                        .on('keyup change', function() {
                                            oTable
                                                .column(i)
                                                .search(this.value)
                                                .draw();
                                        });
                                }else{
                                    $(this).html('')
                                }
                            }
                        });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Table.createDataTable: " + er.message);
                        return null;
                    }
                }
            },
            Push: {
                /**
                 * @name $.Oda.Display.Push.create
                 * @param {Object} params
                 * @param params.message
                 * @param params.options opt
                 * @ex $.Oda.Display.Push.create({message:'Hello', options:{body: "notification body", icon: $.Oda.Context.host+"/img/favicon.png"}});
                 * @returns {$.Oda.Display.Push}
                 */
                create: function(params) {
                    try {
                        // Voyons si le navigateur supporte les notifications
                        if (!("Notification" in $.Oda.Context.window)) {
                            $.Oda.Log.warning("Ce navigateur ne supporte pas les notifications desktop");
                            return null;
                        }
                        // Voyons si l'utilisateur est OK pour recevoir des notifications
                        else if ($.Oda.Context.window.Notification.permission === "granted") {
                            if((params.options !== undefined) && (params.options !== null)){
                                return new $.Oda.Context.window.Notification(params.message, params.options);
                            }else{
                                return new $.Oda.Context.window.Notification(params.message);
                            }
                        }
                        // Sinon, nous avons besoin de la permission de l'utilisateur
                        // Note : Chrome n'implémente pas la propriété statique permission
                        // Donc, nous devons vérifier s'il n'y a pas 'denied' à la place de 'default'
                        else if ($.Oda.Context.window.Notification.permission !== 'denied') {
                            $.Oda.Context.window.Notification.requestPermission(function(permission) {
                                // Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
                                if(!('permission' in $.Oda.Context.window.Notification)) {
                                    $.Oda.Context.window.Notification.permission = permission;
                                }
                                // Si l'utilisateur est OK, on crée une notification
                                if (permission === "granted") {
                                    if((params.options !== undefined) && (params.options !== null)){
                                        var notification = new $.Oda.Context.window.Notification(params.message, params.options);
                                    }else{
                                        var notification = new $.Oda.Context.window.Notification(params.message);
                                    }
                                }
                            });
                            return true;
                        }
                        // Comme ça, si l'utlisateur a refusé toute notification, et que vous respectez ce choix,
                        // il n'y a pas besoin de l'ennuyer à nouveau.
                        return null;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Push.create : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Push.createI8n
                 * @param {Object} params
                 * @param params.message
                 * @returns {$.Oda.Display.Push}
                 */
                createI8n: function(params) {
                    try {
                        params.message = $.Oda.I8n.getByString(params.message);
                        return this.create(params);
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Push.createI8n : " + er.message);
                        return null;
                    }
                }
            },
            Widget: {
                /**
                 * @name $.Oda.Display.Widget.load
                 */
                load: function(){
                    try {
                        $.Oda.Display.Widget.loadBtn();
                        $.Oda.Display.Widget.loadTextInput();
                        $.Oda.Display.Widget.loadAreaInput();
                        $.Oda.Display.Widget.loadCheckboxInput();
                        $.Oda.Display.Widget.loadSelectInput();
                        $.Oda.Display.Widget.loadLoading();
                        $.Oda.Display.Widget.loadLabel();
                        $.Oda.Display.Widget.loadAvatar();
                        $.Oda.Display.Widget.loadGuidance();
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.load: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.checkBtnEnter
                 */
                checkBtnEnter: function(){
                    try {
                        $(document).unbind("keypress");
                        var maxPrio;
                        var maxBt;
                        $('[oda-btn-enter]').each( function(index) {
                            var current = $(this);
                            current.removeClass("btn-listenEnter");
                            var currentPrio = parseInt(current.attr("oda-btn-enter"));
                            if((maxPrio === undefined) || (currentPrio > maxPrio)){
                                maxPrio = currentPrio;
                                maxBt = current;
                            }else{
                                current.removeClass("btn-listenEnter");
                            }
                        });
                        if(maxBt){
                            maxBt.addClass("btn-listenEnter");
                            $(document).keypress(function(e) {
                                if(e.which === 13) {
                                    if(maxBt.attr("oda-btn-click")){
                                        maxBt.click();
                                    }else{
                                        throw new Error('Not clickable');
                                    }
                                }
                            });
                        }
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.checkBtnEnter: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadBtn
                 */
                loadBtn: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-btn",
                            createdCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-btn-name");

                                if(name){
                                    if(($.Oda.Context.window.document.getElementById(name))){
                                        throw new Error("Id:'"+name+"' already exist");
                                    }

                                    if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                        throw new Error("Name:'"+name+"' already exist");
                                    }

                                    elt.attr("id", name);
                                    elt.attr("name", name);
                                }
                                
                                elt.attr("type", "button");
                                
                                var text = elt.text();  
                                if(text !== ""){        
                                    elt.html('<oda-label oda-label-value="'+text+'"/>');
                                }  

                                var style = elt.attr("oda-btn-style");
                                var alreadyClass = elt.attr("class");
                                if(alreadyClass){
                                    elt.attr("class", 'btn btn-'+style + " " + alreadyClass);
                                }else{
                                    elt.attr("class", 'btn btn-'+style);
                                }
                                
                                var iconAfter = elt.attr("oda-btn-icon-after");
                                var iconBefore = elt.attr("oda-btn-icon-before");
                                if(iconBefore){
                                    elt.prepend('<span class="glyphicon glyphicon-'+iconBefore+'" aria-hidden="true"></span> ');
                                }
                                if(iconAfter){
                                    elt.append(' <span class="glyphicon glyphicon-'+iconAfter+'" aria-hidden="true"></span>');
                                }

                                var odaBtnEnter = elt.attr("oda-btn-enter");
                                if(odaBtnEnter){
                                    $.Oda.Display.Widget.checkBtnEnter();
                                }

                                var odaBtnTips = elt.attr("oda-btn-tips");
                                if(odaBtnTips){
                                    var tipsTrad = $.Oda.I8n.getByString(odaBtnTips);
                                    elt.attr("title", tipsTrad);
                                }

                                elt.click(function( event ) {
                                    event.preventDefault();
                                    var disabled = elt.attr("disabled");
                                    var click = elt.attr("oda-btn-click");
                                    if(click && !disabled){
                                        try{
                                            var newclick = new Function(click);
                                            newclick();
                                        }catch(e){
                                            throw new Error('Not a function');
                                        }
                                    }
                                });
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var elt = $(this);
                                switch(attrName) {
                                    default:
                                }
                            },
                            attachedCallback: function(){
                                var elt = $(this);
                                var odaBtnEnter = elt.attr("oda-btn-enter");
                                if(odaBtnEnter){
                                    $.Oda.Display.Widget.checkBtnEnter();
                                }
                            },
                            detachedCallback: function(){
                                $.Oda.Display.Widget.checkBtnEnter();
                            }
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadBtn: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.checkInputText
                 * @param {Object} p
                 * @param p.elt
                 * @param p.required
                 * @param p.check
                 * @returns {$.Oda.Display.Widget}
                 */
                checkInputText: function(p) {
                    try {
                        var $elt = $(p.elt);
                        if(p.required && (($elt.val() === undefined) || ($elt.val() === ""))){
                            $elt.data("isOk", false);
                            $elt.css("border-color","#FF0000");
                        }else{
                            if(p.check){
                                if(p.check.startsWith("Oda.Regexs:")){
                                    p.check = p.check.replace("Oda.Regexs:", '');
                                    p.check = $.Oda.Regexs[p.check];
                                }

                                var patt = new RegExp(p.check, "g");
                                var res = patt.test($elt.val());
                                if(res){
                                    $elt.data("isOk", true);
                                    $elt.css("border-color","#04B404");
                                }else{
                                    $elt.data("isOk", false);
                                    $elt.css("border-color","#FF0000");
                                }
                            }
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.checkInputText: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.checkTextValue
                 * @param {Object} p
                 * @param p.elt
                 * @param p.text
                 * @param p.required
                 * @param p.check
                 * @returns {$.Oda.Display.Widget}
                 */
                checkTextValue: function(p) {
                    try {
                        var $elt = $(p.elt);
                        if(p.required && ((p.text === undefined) || (p.text === ""))){
                            $elt.data("isOk", false);
                            $elt.css("border-color","#FF0000");
                        }else{
                            if(p.check){
                                if(p.check.startsWith("Oda.Regexs:")){
                                    p.check = p.check.replace("Oda.Regexs:", '');
                                    p.check = $.Oda.Regexs[p.check];
                                }

                                var patt = new RegExp(p.check, "g");
                                var res = patt.test(p.text);
                                if(res){
                                    $elt.data("isOk", true);
                                    $elt.css("border-color","#04B404");
                                }else{
                                    $elt.data("isOk", false);
                                    $elt.css("border-color","#FF0000");
                                }
                            }
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.checkTextValue: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadTextInput
                 */
                loadTextInput: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-input-text",
                            createdCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-text-name");

                                if(($.Oda.Context.window.document.getElementById(name))){
                                    throw new Error("Id:'"+name+"' already exist");
                                }

                                if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                    throw new Error("Name:'"+name+"' already exist");
                                }

                                var type = elt.attr("oda-input-text-type");
                                if(!type){
                                    type = "text";
                                }

                                var value = elt.attr("oda-input-text-value");
                                if(!value){
                                    value = "";
                                }

                                var label = elt.attr("oda-input-text-label");
                                var labelTrad = "";
                                var labelDisplayHtml = "";
                                if(!label){
                                    labelDisplayHtml = "display:none;";
                                }else{
                                    labelTrad = '<oda-label oda-label-value="'+label+'"/>';
                                }

                                var tips = elt.attr("oda-input-text-tips");
                                var tipsHtml = "";
                                var tipsDisplayHtml = "";
                                if(tips){
                                    tipsHtml = $.Oda.I8n.getByString(tips);
                                }else{
                                    tipsDisplayHtml = "display:none;";
                                }

                                var advice = elt.attr("oda-input-text-advice");
                                var adviceHtml = "";
                                var adviceDisplayInputHtml = "input-group";
                                var adviceDisplayHtml = "";
                                if(advice){
                                    adviceHtml = $.Oda.I8n.getByString(advice);
                                }else{
                                    adviceDisplayInputHtml = "";
                                    adviceDisplayHtml = "display:none;";
                                }

                                var required = elt.attr("required");
                                var requiredStart = "";
                                var requiredBalise = "";
                                if(required){
                                    requiredStart = '<span style="color:red;">*</span>';
                                    requiredBalise = 'required';
                                }

                                var disabled = elt.attr("disabled");
                                var disabledBalise = "";
                                if(disabled){
                                    disabledBalise = 'disabled';
                                }

                                var html  = $.Oda.Display.TemplateHtml.create({
                                    template: "oda-widget-input-text-tpl",
                                    scope: {
                                        id: name,
                                        name: name,
                                        label: labelTrad,
                                        requiredStart: requiredStart,
                                        requiredBalise: requiredBalise,
                                        disabledBalise: disabledBalise,
                                        type: type,
                                        tips: tipsHtml,
                                        advice: adviceHtml,
                                        labelDisplay: labelDisplayHtml,
                                        tipsDisplay: tipsDisplayHtml,
                                        adviceDisplayInput: adviceDisplayInputHtml,
                                        adviceDisplay: adviceDisplayHtml,
                                        value: value
                                    }
                                });

                                $(this).html(html);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var elt = $(this);
                                var name = elt.attr("oda-input-text-name");
                                var $inputText = $('#'+name);
                                switch(attrName) {
                                    case "oda-input-text-value":
                                        $inputText.val(newValue);
                                        break;
                                    case "disabled":
                                        if(oldValue === null){
                                            $inputText.attr("disabled","");
                                        }else{
                                            $inputText.removeAttr("disabled");
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-text-name");
                                var tips = elt.attr("oda-input-text-tips");
                                var advice = elt.attr("oda-input-text-advice");
                                var placeholder = elt.attr("oda-input-text-placeholder");
                                var check = elt.attr("oda-input-text-check");
                                var required = elt.attr("required");
                                var paste = elt.attr("oda-input-text-paste");
                                var debounce = elt.attr("oda-input-text-debounce");
                                var throttle = elt.attr("oda-input-text-throttle");

                                var $inputText = $('#'+name);

                                if(tips){
                                    var tipsText = $.Oda.I8n.getByString(tips);
                                    var $spanTips = $inputText.parent().parent().find('span:last');
                                    $inputText.focus(function() {
                                        $spanTips.html(tipsText);
                                    });
                                    $inputText.focusout(function() {
                                        $spanTips.html("&nbsp;");
                                    });
                                }

                                if(advice){
                                    var $buttonAdvice = $inputText.parent().parent().find('button:last');
                                    $buttonAdvice.click(function() {
                                        $(this).popover('show');
                                    });
                                }

                                if(placeholder){
                                    $inputText.attr("placeholder",$.Oda.I8n.getByString(placeholder));
                                }

                                if(paste && paste === "false"){
                                    $inputText.bind("paste",function(e) {
                                        e.preventDefault();
                                    });
                                }

                                $.Oda.Display.Widget.checkInputText({
                                    elt: $inputText.get(0),
                                    required: required,
                                    check: check
                                });

                                $inputText.bind("keyup mouseup change",function(e){
                                    $.Oda.Display.Widget.checkInputText({
                                        elt: e.target,
                                        required: required,
                                        check: check
                                    });
                                    if(debounce){
                                        $.Oda.Tooling.debounce(function(){
                                                $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                            },
                                            parseInt(debounce)
                                        );
                                    }else if(throttle){
                                        $.Oda.Tooling.throttle(function(){
                                                $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                            },
                                            parseInt(throttle)
                                        );
                                    }else{
                                        $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                    }
                                });
                            },
                            detachedCallback: function(){
                            }
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadTextInput: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadTextInput
                 */
                loadAreaInput: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-input-area",
                            createdCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-area-name");

                                if(($.Oda.Context.window.document.getElementById(name))){
                                    throw new Error("Id:'"+name+"' already exist");
                                }

                                if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                    throw new Error("Name:'"+name+"' already exist");
                                }

                                var hight = elt.attr("oda-input-area-hight");
                                if(!hight){
                                    hight = "3";
                                }

                                var value = elt.attr("oda-input-area-value");
                                if(!value){
                                    value = "";
                                }

                                var label = elt.attr("oda-input-area-label");
                                var labelTrad = "";
                                var labelDisplayHtml = "";
                                if(!label){
                                    labelDisplayHtml = "display:none;";
                                }else{
                                    labelTrad = '<oda-label oda-label-value="'+label+'"/>';
                                }

                                var tips = elt.attr("oda-input-area-tips");
                                var tipsHtml = "";
                                var tipsDisplayHtml = "";
                                if(tips){
                                    tipsHtml = $.Oda.I8n.getByString(tips);
                                }else{
                                    tipsDisplayHtml = "display:none;";
                                }

                                var required = elt.attr("required");
                                var requiredStart = "";
                                var requiredBalise = "";
                                if(required){
                                    requiredStart = '<span style="color:red;">*</span>';
                                    requiredBalise = 'required';
                                }

                                var disabled = elt.attr("disabled");
                                var disabledBalise = "";
                                if(disabled){
                                    disabledBalise = 'disabled';
                                }

                                var html  = $.Oda.Display.TemplateHtml.create({
                                    template: "oda-widget-input-area-tpl",
                                    scope: {
                                        id: name,
                                        name: name,
                                        label: labelTrad,
                                        requiredStart: requiredStart,
                                        requiredBalise: requiredBalise,
                                        hight: hight,
                                        labelDisplay: labelDisplayHtml,
                                        tips: tipsHtml,
                                        tipsDisplay: tipsDisplayHtml,
                                        disabledBalise: disabledBalise,
                                        value: value
                                    }
                                });

                                $(this).html(html);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var elt = $(this);
                                var name = elt.attr("oda-input-area-name");
                                var rich = elt.attr("oda-input-area-rich");
                                var $inputArea = $('#'+name);
                                switch(attrName) {
                                    case "oda-input-area-value":
                                        $inputArea.val(newValue);
                                        break;
                                    case "disabled":
                                        if(rich){
                                            if(oldValue === null){
                                                CKEDITOR.instances[name].setReadOnly(true);
                                            }else{
                                                CKEDITOR.instances[name].setReadOnly(false);
                                            }
                                        }else{
                                            if(oldValue === null){
                                                $inputArea.attr("disabled","");
                                            }else{
                                                $inputArea.removeAttr("disabled");
                                            }
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-area-name");
                                var tips = elt.attr("oda-input-area-tips");
                                var placeholder = elt.attr("oda-input-area-placeholder");
                                var check = elt.attr("oda-input-area-check");
                                var required = elt.attr("required");
                                var paste = elt.attr("oda-input-area-paste");
                                var debounce = elt.attr("oda-input-area-debounce");
                                var throttle = elt.attr("oda-input-area-throttle");
                                var rich = elt.attr("oda-input-area-rich");

                                if(rich){
                                    try{
                                        CKEDITOR.replace(name);
                                    }catch(e){
                                        $.Oda.Log.error('Rich area demand for widget:"'+name+'" but CKEDITOR not loaded');
                                        rich = false;
                                    }
                                }

                                var $inputArea = $('#'+name);

                                if(tips){
                                    var tipsText = $.Oda.I8n.getByString(tips);
                                    var $spanTips = $inputArea.parent().parent().find('span:last');
                                    if(rich){
                                        CKEDITOR.instances[name].on('focus', function() {
                                            $spanTips.html(tipsText);
                                        });
                                        CKEDITOR.instances[name].on('blur', function() {
                                            $spanTips.html("&nbsp;");
                                        });
                                    }else{
                                        $inputArea.focus(function() {
                                            $spanTips.html(tipsText);
                                        });
                                        $inputArea.focusout(function() {
                                            $spanTips.html("&nbsp;");
                                        });
                                    }
                                }

                                if(placeholder){
                                    $inputArea.attr("placeholder",$.Oda.I8n.getByString(placeholder));
                                }

                                if(paste && paste === "false"){
                                    $inputArea.bind("paste",function(e) {
                                        e.preventDefault();
                                    });
                                }

                                if(rich){
                                    $.Oda.Display.Widget.checkTextValue({
                                        elt: $inputArea.get(0),
                                        text: CKEDITOR.instances[name].getData(),
                                        required: required,
                                        check: check
                                    });

                                    CKEDITOR.instances[name].on('change', function() {
                                        $.Oda.Display.Widget.checkTextValue({
                                            elt: $inputArea.get(0),
                                            text: CKEDITOR.instances[name].getData(),
                                            required: required,
                                            check: check
                                        });
                                        if(debounce){
                                            $.Oda.Tooling.debounce(function(){
                                                    $.Oda.Scope.Gardian.findByElt({id: name});
                                                },
                                                parseInt(debounce)
                                            );
                                        }else if(throttle){
                                            $.Oda.Tooling.throttle(function(){
                                                    $.Oda.Scope.Gardian.findByElt({id: name});
                                                },
                                                parseInt(throttle)
                                            );
                                        }else{
                                            $.Oda.Scope.Gardian.findByElt({id: name});
                                        }
                                    });
                                }else{
                                    $.Oda.Display.Widget.checkInputText({
                                        elt: $inputArea.get(0),
                                        required: required,
                                        check: check
                                    });

                                    $inputArea.bind("keyup mouseup change",function(e){
                                        $.Oda.Display.Widget.checkInputText({
                                            elt: e.target,
                                            required: required,
                                            check: check
                                        });
                                        if(debounce){
                                            $.Oda.Tooling.debounce(function(){
                                                    $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                                },
                                                parseInt(debounce)
                                            );
                                        }else if(throttle){
                                            $.Oda.Tooling.throttle(function(){
                                                    $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                                },
                                                parseInt(throttle)
                                            );
                                        }else{
                                            $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                        }
                                    });
                                }
                            },
                            detachedCallback: function(){
                            }
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadAreaInput: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadCheckboxInput
                 */
                loadCheckboxInput: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-input-checkbox",
                            createdCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-checkbox-name");

                                if(($.Oda.Context.window.document.getElementById(name))){
                                    throw new Error("Id:'"+name+"' already exist");
                                }

                                if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                    throw new Error("Name:'"+name+"' already exist");
                                }

                                var value = elt.attr("oda-input-checkbox-value");
                                if(!value){
                                    value = "";
                                }

                                var label = elt.attr("oda-input-checkbox-label");
                                var labelTrad = "";
                                var labelDisplayHtml = "";
                                if(!label){
                                    labelDisplayHtml = "display:none;";
                                }else{
                                    labelTrad = '<oda-label oda-label-value="'+label+'"/>';
                                }

                                var required = elt.attr("required");
                                var requiredStart = "";
                                var requiredBalise = "";
                                if(required){
                                    requiredStart = '<span style="color:red;">*</span>';
                                    requiredBalise = 'required';
                                }

                                var tips = elt.attr("oda-input-checkbox-tips");
                                var tipsHtml = "";
                                if(tips){
                                    tipsHtml = $.Oda.I8n.getByString(tips);
                                }

                                var disabled = elt.attr("disabled");
                                var disabledBalise = "";
                                if(disabled){
                                    disabledBalise = 'disabled';
                                }

                                var html  = $.Oda.Display.TemplateHtml.create({
                                    template: "oda-widget-input-checkbox-tpl",
                                    scope: {
                                        id: name,
                                        name: name,
                                        label: labelTrad,
                                        labelDisplay: labelDisplayHtml,
                                        requiredStart: requiredStart,
                                        requiredBalise: requiredBalise,
                                        disabledBalise: disabledBalise,
                                        tips: tipsHtml,
                                        value: value
                                    }
                                });

                                $(this).html(html);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var elt = $(this);
                                var name = elt.attr("oda-input-checkbox-name");
                                var $inputCheckbox = $('#'+name);
                                switch(attrName) {
                                    case "disabled":
                                        if(oldValue === null){
                                            $inputCheckbox.attr("disabled","");
                                        }else{
                                            $inputCheckbox.removeAttr("disabled");
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-checkbox-name");
                                var required = elt.attr("required");
                                var $inputCheckbox = $('#'+name);
                                if(!required){
                                    $inputCheckbox.data("isOk", true);
                                }else{
                                    $inputCheckbox.data("isOk", $inputCheckbox.is(":checked"));
                                }
                                $inputCheckbox.val($inputCheckbox.is(":checked"));
                                $inputCheckbox.change(function(e){
                                    var $elt = $(this);
                                    $elt.val($elt.is(":checked"));
                                    if(!required){
                                        $elt.data("isOk", true);
                                    }else{
                                        $elt.data("isOk", $elt.is(":checked"));
                                    }
                                    $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                });
                            },
                            detachedCallback: function(){
                            }
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadCheckboxInput: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.checkInputText
                 * @param {Object} p
                 * @param p.elt
                 * @returns {$.Oda.Display.Widget}
                 */
                refreshAvailablesOfSelect: function(p){
                    try {
                        var elt = $(p.elt);
                        var name = elt.attr("oda-input-select-name");
                        var order = elt.attr("oda-input-select-order");
                        var $select = $('#' + name);
                        $select.find('option').remove();

                        var value = elt.attr("oda-input-select-value");
                        if(!value){
                            value = "";
                        }

                        var availablesString = elt.attr("oda-input-select-availables");
                        var funct = new Function("return " + availablesString);
                        var availables = funct();
                        if(!Array.isArray(availables)){
                            throw new Error("availables is not an array for:'"+name+"'.");
                        }
                        if(availables.length > 0){
                            if(typeof availables[0] === "object"){
                                var display = elt.attr("oda-input-select-display");
                                if(!display){
                                    throw new Error("display is not define for:'"+name+"' event availables are object.");
                                }
                                var functDisplay = new Function('elt',"return " + display);

                                var response = elt.attr("oda-input-select-response");
                                if(!response){
                                    throw new Error("response is not define for:'"+name+"' event availables are object.");
                                }
                                var functResponse = new Function('elt',"return " + response);

                                for(var index in availables){
                                    var currentValue = availables[index];
                                    var displayCalc = functDisplay(currentValue);
                                    currentValue["valueTrad"] = $.Oda.I8n.getByString(displayCalc);
                                }

                                if(order === "desc"){
                                    listWavailablesithTrad = $.Oda.Tooling.order({
                                        collection: availables, compare: function(elt1, elt2){
                                            if(elt1.valueTrad < elt2.valueTrad){
                                                return 1;
                                            }else if(elt1.valueTrad > elt2.valueTrad){
                                                return -1;
                                            }else{
                                                return 0;
                                            }
                                        }
                                    });
                                }else if(order === "asc"){
                                    availables = $.Oda.Tooling.order({
                                        collection: availables, compare: function(elt1, elt2){
                                            if(elt1.valueTrad > elt2.valueTrad){
                                                return 1;
                                            }else if(elt1.valueTrad < elt2.valueTrad){
                                                return -1;
                                            }else{
                                                return 0;
                                            }
                                        }
                                    });
                                }

                                $select.append($('<option>').text($.Oda.I8n.get('oda-main','select-default')).val(''));
                                for(var index in availables){
                                    var currentValue = availables[index];
                                    var responseCalc = functResponse(currentValue);
                                    $select.append($('<option>').text(currentValue.valueTrad).val(responseCalc));
                                }
                                $select.val(value);
                            }else{
                                var listWithTrad = [];
                                for(var index in availables){
                                    var currentValue = availables[index];
                                    listWithTrad.push({
                                        value: currentValue,
                                        valueTrad : $.Oda.I8n.getByString(currentValue)
                                    });
                                }

                                if(order === "desc"){
                                    listWithTrad = $.Oda.Tooling.order({
                                        collection: listWithTrad, compare: function(elt1, elt2){
                                            if(elt1.valueTrad < elt2.valueTrad){
                                                return 1;
                                            }else if(elt1.valueTrad > elt2.valueTrad){
                                                return -1;
                                            }else{
                                                return 0;
                                            }
                                        }
                                    });
                                }else if(order === "asc"){
                                    listWithTrad = $.Oda.Tooling.order({
                                        collection: listWithTrad, compare: function(elt1, elt2){
                                            if(elt1.valueTrad > elt2.valueTrad){
                                                return 1;
                                            }else if(elt1.valueTrad < elt2.valueTrad){
                                                return -1;
                                            }else{
                                                return 0;
                                            }
                                        }
                                    });
                                }

                                $select.append($('<option>').text($.Oda.I8n.get('oda-main','select-default')).val(''));
                                for(var index in listWithTrad){
                                    var currentValue = listWithTrad[index];
                                    $select.append($('<option>').text(currentValue.valueTrad).val(currentValue.value));
                                }
                                $select.val(value);
                            }
                        }else{
                            $select.append($('<option>').text($.Oda.I8n.get('oda-main','select-default')).val(''));
                            $select.val(value);
                        }
                        $.Oda.Scope.Gardian.findByElt({id: name});
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.refreshAvailablesOfSelect: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadSelectInput
                 */
                loadSelectInput: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-input-select",
                            createdCallback: function(){
                                var elt = $(this);
                                var name = elt.attr("oda-input-select-name");

                                if(($.Oda.Context.window.document.getElementById(name))){
                                    throw new Error("Id:'"+name+"' already exist");
                                }

                                if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                    throw new Error("Name:'"+name+"' already exist");
                                }

                                var label = elt.attr("oda-input-select-label");
                                var labelTrad = "";
                                var labelDisplayHtml = "";
                                if(!label){
                                    labelDisplayHtml = "display:none;";
                                }else{
                                    labelTrad = '<oda-label oda-label-value="'+label+'"/>';
                                }

                                var required = elt.attr("required");
                                var requiredStart = "";
                                var requiredBalise = "";
                                if(required){
                                    requiredStart = '<span style="color:red;">*</span>';
                                    requiredBalise = 'required';
                                }

                                var tips = elt.attr("oda-input-select-tips");
                                var tipsHtml = "";
                                if(tips){
                                    tipsHtml = $.Oda.I8n.getByString(tips);
                                }

                                var disabled = elt.attr("disabled");
                                var disabledBalise = "";
                                if(disabled){
                                    disabledBalise = 'disabled';
                                }

                                var html  = $.Oda.Display.TemplateHtml.create({
                                    template: "oda-widget-input-select-tpl",
                                    scope: {
                                        id: name,
                                        name: name,
                                        label: labelTrad,
                                        labelDisplay: labelDisplayHtml,
                                        requiredStart: requiredStart,
                                        requiredBalise: requiredBalise,
                                        disabledBalise: disabledBalise,
                                        tips: tipsHtml
                                    }
                                });

                                $(this).html(html);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var elt = $(this);
                                var name = elt.attr("oda-input-select-name");
                                var $select = $('#' + name);
                                var value = elt.attr("oda-input-select-value");
                                if(!value){
                                    value = "";
                                }
                                switch(attrName) {
                                    case "oda-input-select-availables":
                                        $.Oda.Display.Widget.refreshAvailablesOfSelect({elt:this});
                                        break;
                                    case "oda-input-select-value":
                                        $select.val(value);
                                        break;
                                    case "disabled":
                                        if(oldValue === null){
                                            $select.attr("disabled","");
                                        }else{
                                            $select.removeAttr("disabled");
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){
                                $.Oda.Display.Widget.refreshAvailablesOfSelect({elt:this});
                                var elt = $(this);
                                var name = elt.attr("oda-input-select-name");
                                var required = elt.attr("required");
                                var $inputSelect = $('#'+name);

                                if(!required){
                                    $inputSelect.data("isOk", true);
                                    $inputSelect.css("border-color","#04B404");
                                }else{
                                    if($inputSelect.val()!==""){
                                        $inputSelect.data("isOk", true);
                                        $inputSelect.css("border-color","#04B404");
                                    }else{
                                        $inputSelect.data("isOk", false);
                                        $inputSelect.css("border-color","#FF0000");
                                    }
                                }
                                $inputSelect.change(function(e){
                                    var $elt = $(this);
                                    if(!required){
                                        $elt.data("isOk", true);
                                        $elt.css("border-color","#04B404");
                                    }else{
                                        if($elt.val()!==""){
                                            $elt.data("isOk", true);
                                            $elt.css("border-color","#04B404");
                                        }else{
                                            $elt.data("isOk", false);
                                            $elt.css("border-color","#FF0000");
                                        }
                                        }
                                    $.Oda.Scope.Gardian.findByElt({id: e.target.id});
                                });
                            },
                            detachedCallback: function(){
                            }
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadSelectInput: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadLoading
                 */
                loadLoading: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-loading",
                            createdCallback: function(){
                                var elt = $(this);
                                var html  = $.Oda.Display.TemplateHtml.create({
                                    template: "oda-loading-tpl"
                                });
                                $(this).html(html);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){},
                            attachedCallback: function(){},
                            detachedCallback: function(){}
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadLoading: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadLabel
                 */
                loadLabel: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-label",
                            createdCallback: function(){
                                var $elt = $(this);
                                var name = $elt.attr("oda-label-name");

                                if(name){
                                    if(($.Oda.Context.window.document.getElementById(name))){
                                        throw new Error("Id:'"+name+"' already exist");
                                    }

                                    if(($.Oda.Context.window.document.getElementsByName(name).length > 0)){
                                        throw new Error("Name:'"+name+"' already exist");
                                    }

                                    $elt.attr("id", name);
                                    $elt.attr("name", name);
                                }

                                //todo event on change language
                                $.Oda.Display.Widget.calcLabel($elt);

                                $.Oda.Event.addListener({
                                    name: "oda-language-changed", 
                                    callback: function(e){
                                        $.Oda.Display.Widget.calcLabel($elt, e.detail.new);
                                    }
                                });
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var $elt = $(this);
                                switch(attrName) {
                                    case "oda-label-value":
                                    case "oda-label-group":
                                    case "oda-label-lang":
                                    case "oda-label-default-lang":
                                    case "oda-label-variables":
                                        $.Oda.Display.Widget.calcLabel($elt);
                                        break;
                                    default:
                                }
                            },
                            attachedCallback: function(){},
                            detachedCallback: function(){}
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadLabel: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.calcLabel
                 */
                calcLabel: function($elt, newLanguage){
                    try {
                        var value = $elt.attr("oda-label-value");
                        $.Oda.Log.debug("Oda label calc: "+value);
                        var group = $elt.attr("oda-label-group");
                        var lang = $elt.attr("oda-label-lang");
                        if(!lang && newLanguage){
                            lang = newLanguage;
                        }
                        var defaultLang = $elt.attr("oda-label-default-lang");
                        var variables = $elt.attr("oda-label-variables");
                        if(group){
                            if(variables){
                                try{
                                    var funct = new Function("return " + variables);
                                    variables = funct();
                                }catch(e){
                                    throw new Error("Widget oda-label for value:'"+value+"' => Syntaxe of variables not correct JSON");
                                }
                            }

                            var inputs = {
                                defaultLang: defaultLang,
                                forced: lang,
                                variables: variables
                            }

                            var labelTrad = $.Oda.I8n.get(group, value, inputs);
                        }else{
                            var labelTrad = $.Oda.I8n.getByString(value, newLanguage);
                        }
                        $elt.html(labelTrad);
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.calcLabel: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadAvatar
                 */
                loadAvatar: function(){
                    try {
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-avatar",
                            createdCallback: function(){
                                var $elt = $(this);
                                var name = $elt.attr("oda-avatar-name");

                                if(($.Oda.Context.window.document.getElementById(name)) || !name){
                                    throw new Error("Id:'"+name+"' already exist");
                                }

                                $.Oda.Display.Widget.setImageAvatar($elt);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var $elt = $(this);
                                switch(attrName) {
                                    case "oda-avatar-user":
                                        $.Oda.Display.Widget.setImageAvatar($elt);
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){},
                            detachedCallback: function(){}
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadAvatar: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.setImageAvatar
                 */
                setImageAvatar: function($elt){
                    try {
                        var name = $elt.attr("oda-avatar-name");
                        var user = $elt.attr("oda-avatar-user");
                        var height = $elt.attr("oda-avatar-height");
                        var width = $elt.attr("oda-avatar-width");

                        var codeUser = ($.Oda.Session.code_user==="")?"noUser":$.Oda.Session.code_user;

                        if(user && user !== ""){
                            codeUser = user;
                        }
                        
                        var src = $.Oda.Context.rest+'vendor/happykiller/oda/resources/api/avatar/'+codeUser+'?mili'+$.Oda.Tooling.getMilise();

                        var divHeight;
                        var imgHeight;
                        var imgHeightDec;
                        if(height){
                            divHeight = height;
                            imgHeight = $.Oda.Tooling.arrondir(height/1.5,0);
                            imgHeightDec = $.Oda.Tooling.arrondir(imgHeight/2,0);
                        }else{
                            divHeight = 100;
                            imgHeight = 67;
                            imgHeightDec = 34;
                        }
                        src+='&h='+ divHeight;

                        var divWidth;
                        var imgWidth;
                        var imgWidthDec;
                        if(width){
                            divWidth = width;
                            imgWidth = $.Oda.Tooling.arrondir(width/1.5,0);
                            imgWidthDec = $.Oda.Tooling.arrondir(imgWidth/2,0);
                        }else{
                            divWidth = 100;
                            imgWidth = 67;
                            imgWidthDec = 34;
                        }
                        src+='&w='+ divWidth;

                        var html  = $.Oda.Display.TemplateHtml.create({
                            template: "oda-avatar-tpl",
                            scope: {
                                src: src,
                                name: name,
                                height: divHeight,
                                imgHeight: imgHeight,
                                imgHeightDec: imgHeightDec,
                                width: divWidth,
                                imgWidth: imgWidth,
                                imgWidthDec: imgWidthDec
                            }
                        });

                        $elt.html(html);
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.setImageAvatar: " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Display.Widget.loadGuidance
                 */
                loadGuidance: function(){
                    try {
                        $(document).on("click", ".popover .close" , function(){
                            $(this).parents(".popover").popover('hide');
                        });
                        $(document).on("click", ".popover .guidance-next" , function(){
                            var $elt = $(this);
                            var id = $elt.data('id');
                            $elt.parents(".popover").popover('hide');
                            var guidanceStorage = $.Oda.Storage.get("ODA-GUIDANCE-"+$.Oda.Session.code_user);
                            if(guidanceStorage){
                                guidanceStorage[id].status = 'read';
                                $.Oda.Storage.set("ODA-GUIDANCE-"+$.Oda.Session.code_user, guidanceStorage);
                            }
                            $.Oda.Guidance.run();
                        });
                        $(document).on("click", ".popover .guidance-read" , function(){
                            var $elt = $(this);
                            var id = $elt.data('id');
                            var guidanceStorage = $.Oda.Storage.get("ODA-GUIDANCE-"+$.Oda.Session.code_user);
                            if(guidanceStorage){
                                guidanceStorage[id].status = 'read';
                                $.Oda.Storage.set("ODA-GUIDANCE-"+$.Oda.Session.code_user, guidanceStorage);
                            }
                            $elt.parents(".popover").popover('hide');
                        });
                        $.Oda.Display.Polyfill.createHtmlElement({
                            name: "oda-guidance",
                            createdCallback: function(){
                                var $elt = $(this);
                            },
                            attributeChangedCallback: function(attrName, oldValue, newValue){
                                var $elt = $(this);
                                switch(attrName) {
                                    case "attr":
                                        break;
                                    default:
                                        break;
                                }
                            },
                            attachedCallback: function(){
                                var $elt = $(this);
                                var id = $elt.attr("oda-guidance-id");
                                $.Oda.Log.debug('Oda-guidance creation: '+ id);
                                var location = $elt.attr("oda-guidance-location");
                                if(!location){
                                    location = "auto"
                                }
                                var next = $elt.attr("oda-guidance-next");
                                var title = $elt.attr("oda-guidance-title");
                                $elt.attr("class","oda-guidance");
                                
                                var $target = $('#'+id);
                                if($target.exists()){
                                    var strHtml = $elt.html();
                                    if(strHtml.indexOf('<') === -1){
                                        strHtml = '<oda-label oda-label-value="'+strHtml+'"/>';
                                    }
                                    strHtml += '<p style="text-align:center;"><a href="#" class="btn btn-info btn-xs guidance-'+((next)?'next':'read')+'" data-id="'+id+'"><oda-label oda-label-value="guidance-read" oda-label-group="oda-main"/></a></p>';
                                    
                                    var strTitle = "";
                                    if(title){
                                        strTitle = '<oda-label oda-label-value="'+title+'"/>';
                                    }else{
                                        strTitle = '<oda-label oda-label-value="guidance" oda-label-group="oda-main"/>';
                                    }
                                    strTitle += '<a href="#" class="close" data-dismiss="alert">×</a>';

                                    $target.popover({
                                        trigger: "manual",
                                        placement : location,
                                        html : true,
                                        title : strTitle,
                                        content : strHtml
                                    });
                                }
                            },
                            detachedCallback: function(){}
                        });
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Display.Widget.loadGuidance: " + er.message);
                        return null;
                    }
                }
            }
        },

        Tooling: {
            timerDebounce: null,
            timerThrottle: null,
            lastThrottle: null,
            /**
             * @name $.Oda.Tooling.checkParams
             * @param {Object} p_params
             * @param {json} p_def ex : {attr1 : null, attr2 : "truc"}
             * @desc null for mandatory params, present with default value or not for optional
             */
            checkParams: function(p_params, p_def) {
                try {
                    var params = $.Oda.Tooling.clone(p_params);

                    var param_return = {};

                    for (var key in p_def) {
                        if(p_def[key] === null){
                            if(params[key] === undefined){
                                throw {
                                    name:        "Parameter missing",
                                    level:       "Show Stopper",
                                    message:     "Param : "+key+" missing",
                                    htmlMessage: "Param : "+key+" missing",
                                    toString:    function(){return this.name + ": " + this.message;}
                                };
                            }else{
                                param_return[key] = params[key];
                            }
                        }else{
                            if(params[key] === undefined){
                                param_return[key] = p_def[key];
                            }else{
                                param_return[key] = params[key];
                            }
                        }
                        delete params[key];
                    }

                    for (var key in params) {
                        param_return[key] = params[key];
                    }

                    return param_return;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.checkParams : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.urlDownloadFromServerResources
             * @param {Object} p_params
             * @param p_params.strPath relative from resources/
             * @returns {String}
             */
            urlDownloadFromServerResources: function(p_params) {
                try {
                    var url = $.Oda.Context.rest+'vendor/happykiller/oda/resources/script/download.php&fic=../../../../../../../resources/'+p_params.strPath;
                    return url;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.urlDownloadFromServerResources : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.timeout
             * @param func
             * @param time
             * @param arg
             * @returns {*}
             */
            timeout: function(func, time, arg){
                try {
                    setTimeout(func, time, arg);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.timeout : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.arrondir
             * @param {float|int} p_value
             * @param {int} p_precision
             * @returns {float|int}
             */
            arrondir: function(p_value, p_precision){
                try {
                    var retour = 0;
                    var coef = Math.pow(10, p_precision);

                    if(coef !== 0){
                        retour = Math.round(p_value*coef)/coef;
                    }else{
                        retour = Math.round(p_value);
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.arrondir : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.clone
             * @desc Clone an object JS
             * @param{object} p_params
             * @returns {object}
             */
            clone: function(p_params) {
                try {
                    if (null === p_params || "object" !== typeof p_params) return p_params;
                    var copy = p_params.constructor();
                    for (var attr in p_params) {
                        if (p_params.hasOwnProperty(attr)) copy[attr] = p_params[attr];
                    }
                    return copy;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clone : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.deepEqual
             * @param {object} elt1
             * @param {object} elt2
             * @returns {$.Oda.Tooling}
             */
            deepEqual: function(elt1, elt2) {
                try {
                    if ((typeof elt1 === "object" && elt1 !== null) && (typeof elt2 === "object" && elt2 !== null)) {
                        if (Object.keys(elt1).length !== Object.keys(elt2).length)
                            return false;

                        for (var prop in elt1) {
                            if (elt2.hasOwnProperty(prop))
                            {
                                if (! $.Oda.Tooling.deepEqual(elt1[prop], elt2[prop]))
                                    return false;
                            }
                            else
                                return false;
                        }

                        return true;
                    }
                    else if (elt1 !== elt2)
                        return false;
                    else
                        return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.deepEqual : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.debounce
             * @param callback Function
             * @param delay Integer
             * @returns {$.Oda.Tooling}
             */
            debounce: function(callback, delay) {
                try {
                    var args = arguments;
                    var context = this;
                    clearTimeout($.Oda.Tooling.timerDebounce);
                    $.Oda.Tooling.timerDebounce = setTimeout(function(){
                        callback.apply(context, args);
                    }, delay);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.debounce : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.decodeHtml
             * @param {string} html
             * @returns {string}
             */
            decodeHtml: function(html) {
                try {
                    var decoded = $('<div/>').html(html).text();
                    return decoded;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.decodeHtml : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.findBetweenWords
             * @param {object} p_params
             * @param p_params.str
             * @param p_params.first
             * @param p_params.last
             * @returns {Array}
             */
            findBetweenWords: function(p_params) {
                try {
                    var listReturn = [];
                    var r = new RegExp(p_params.first + '(.*?)' + p_params.last, 'gm');
                    var list = p_params.str.match(r);

                    for (var indice in list){
                        listReturn[indice] = list[indice].replace(p_params.first,'').replace(p_params.last,'');
                    }
                    return listReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.findBetweenWords : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.replaceAll
             * @param p_params
             * @param p_params.str
             * @param p_params.find
             * @param p_params.by
             * @param p_params.ignoreCase by default false
             * @returns {String}
             */
            replaceAll: function(p_params) {
                try {
                    if(p_params.str === undefined){
                        throw new Error('Parameter "str" for find: "'+p_params.find+'" is missing in params of $.Oda.Tooling.replaceAll');
                    }

                    if((p_params.find === undefined)||(p_params.find === '')){
                        throw new Error('Parameter "find" for by:"'+p_params.by+'" is missing in params of $.Oda.Tooling.replaceAll');
                    }

                    if(p_params.by === undefined){
                        throw new Error('Parameter "by" for find: "'+p_params.find+'" is missing in params of $.Oda.Tooling.replaceAll');
                    }

                    if(p_params.str === ''){
                        return p_params.str;
                    }

                    if(p_params.find === ''){
                        return p_params.str;
                    }

                    var opt = "g";
                    if(p_params.hasOwnProperty('ignoreCase') && p_params.ignoreCase){
                        opt = 'gi';
                    }

                    var strFind = p_params.find.replace(/([.?*+^$[\]\\(){}|-])/gi, "\\$1");

                    var re = new RegExp(strFind, opt);

                    var strReturn = p_params.str.replace(re, p_params.by);

                    return strReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.replaceAll : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.clearSlashes
             * @param {type} path
             * @returns {unresolved}
             */
            clearSlashes: function(string) {
                try {
                    return string.toString().replace(/\/$/, '').replace(/^\//, '');
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.clearSlashes : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getLangBrowser
             * @returns {String}
             */
            getLangBrowser: function(p_params) {
                try {
                    var lang = "";
                    if(!$.Oda.Tooling.isUndefined(navigator.language)){
                        switch (true) {
                            case navigator.language.includes('fr') :
                                lang = 'fr';
                                break;
                            case navigator.language.includes('en') :
                                lang = 'en';
                                break;
                            case navigator.language.includes('es') :
                                lang = 'es';
                                break;
                            case navigator.language.includes('it') :
                                lang = 'it';
                                break;
                            default:
                                lang = navigator.language;
                        }
                    }
                    return lang;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getLangBrowser : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getListValeurPourAttribut
             * @param {json} p_obj
             * @param {string} p_attribut
             * @returns {Array}
             */
            getListValeurPourAttribut: function(p_obj, p_attribut, p_type) {
                try {
                    var retour = [];

                    for (var indice in p_obj) {
                        for (var key in p_obj[indice]) {
                            if(key === p_attribut){
                                if(typeof p_type !== "undefined"){
                                    var valeur = null;
                                    if(p_type === "int"){
                                        valeur = parseInt(p_obj[indice][key]);
                                    }else if(p_type === "float"){
                                        valeur = parseFloat(p_obj[indice][key]);
                                    }else{
                                        valeur = new p_type(p_obj[indice][key]);
                                    }
                                    retour[retour.length] = valeur;
                                }else{
                                    retour[retour.length] = p_obj[indice][key];
                                }
                            }
                        }
                    }

                    return retour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getListValeurPourAttribut : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getTypeOfVar
             * @param {unknown} v
             * @example of return Array, Object, String, Number, Boolean
             * @returns {string}
             */
            getTypeOfVar: function(v){
                try {
                    var response = Object.prototype.toString.call(v);
                    return response.substring(8, response.length-1);
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getTypeOfVar : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.isInArray
             * @param {object} p_value
             * @param {array} p_array
             * @returns {Boolean}
             */
            isInArray: function(p_value, p_array) {
                try {
                    var boolRetour = false;

                    for(var indice in p_array){
                        if($.Oda.Tooling.deepEqual(p_value,p_array[indice])){
                            boolRetour = true;
                            break;
                        }
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isInArray : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.isUndefined
             * @desc is ndefined N
             * @param {object} p_object
             * @returns {Boolean}
             */
            isUndefined: function(p_object) {
                try {
                    var boolReturn = true;

                    if(typeof p_object !== "undefined"){
                        boolReturn = false;
                    }

                    return boolReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isUndefined : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getMilise
             * @returns {string}
             */
            getMilise: function() {
                try {
                    var d = new Date();
                    return d.getTime();
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getMilise : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getParameterGet
             * @param {Object} p
             * @param p.url
             * @example $.Oda.Tooling.getParameterGet({url:'http://localhost/how/#page?attr=1'});
             * @returns {Object}
             */
            getParameterGet: function(p) {
                try {
                    var result = {};
                    var tableau = decodeURI(p.url).split("?");
                    if(tableau.length > 1){
                        tableau = tableau[1];
                        tableau = tableau.split("&");
                        for (var indice in tableau){
                            var tmp = tableau[indice].split("=");
                            result[tmp[0]] = tmp[1];
                        }
                    }
                    return result;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getParameterGet : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.getParamsLibrary
             * @param {Object} p_params
             * @param p_params.library
             * @returns {Object}
             */
            getParamsLibrary: function(p_params) {
                try {
                    var listParams = {};

                    if($.each){
                        $("script[src*='"+p_params.library+"']").each(function(index, value){
                            var src = $(value).attr("src");
                            listParams = $.Oda.Tooling.getParameterGet({url : src});
                        });
                    }

                    return listParams;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.getParamsLibrary : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.objectSize
             * @param {Object} obj
             * @returns {Int}
             */
            objectSize: function(obj) {
                try {
                    var size = 0, key;
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) size++;
                    }
                    return size;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objectSize : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.objDataTableFromJsonArray
             * @param {object} p_JsonArray
             * @returns {object}
             */
            objDataTableFromJsonArray: function(p_JsonArray){
                try {
                    var objRetour = { statut : "ok"};

                    var arrayEntete = {};
                    var i = 0;
                    for(var key in p_JsonArray[0]){
                        arrayEntete[key] = i;
                        i++;
                    }
                    objRetour.entete = arrayEntete;

                    var arrayData = [];
                    for(var indice in p_JsonArray){
                        var subArrayData = [];
                        for(var key in p_JsonArray[indice]){
                            subArrayData[subArrayData.length] = p_JsonArray[indice][key];
                        }
                        arrayData[arrayData.length] = subArrayData;
                    }

                    objRetour.data = arrayData;

                    return objRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.objDataTableFromJsonArray : " + er.message);
                    var objRetour = { statut : "ko"};
                    return objRetour;
                }
            },
            /**
             * @name $.Oda.Tooling.order
             * @param {Object} p_params
             * @param p_params.collection
             * @param p_params.compare with a, b
             * @description compare must be return 1 si a before b, -1 if b before a, 0 if equal
             * @example
             * $.Oda.Tooling.order({
             *      collection: inputs, compare: function(elt1, elt2){
             *          if(elt1.label < elt2.label){
             *              return 1;
             *          }else if(elt1.label > elt2.label){
             *              return -1;
             *          }else{
             *              return 0;
             *          }
             *      }
             *  })
             * @returns {$.Oda.Tooling}
             */
            order: function(p_params) {
                try {
                    var clone = this.clone(p_params.collection);

                    var newCollection = this.orderInter({
                        collectionOri:  clone,
                        collectionDest: [],
                        compare: p_params.compare
                    });
                    return newCollection;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.order : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.orderInter
             * @param {Object} p_params
             * @param p_params.collectionOri
             * @param p_params.collectionDest
             * @param p_params.compare
             * @returns {$.Oda.Tooling}
             */
            orderInter: function(p_params) {
                try {
                    if(p_params.collectionOri.length > 0){
                        var min = {
                            value: null,
                            index: null
                        };

                        for(var index in p_params.collectionOri){
                            var elt = p_params.collectionOri[index];
                            if(min.value === null){
                                min.value = elt;
                                min.index = parseInt(index);
                            }else{
                                var resultCompare = p_params.compare(min.value, elt);
                                if(resultCompare === 1){
                                    min.value = elt;
                                    min.index = parseInt(index);
                                }
                            }
                        }

                        p_params.collectionOri.splice(min.index,1);
                        p_params.collectionDest.push(min.value);

                        return this.orderInter({
                            collectionOri:  p_params.collectionOri,
                            collectionDest: p_params.collectionDest,
                            compare: p_params.compare
                        });
                    }else{
                        return p_params.collectionDest;
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.orderInter : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.pad2
             * @param {int} number
             * @returns {String}
             */
            pad2: function(number) {
                try {
                    if(typeof number !== "integer"){
                        number = parseInt(number);
                    }
                    return (number < 10 ? '0' : '') + number;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.pad2 : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.postResources
             * @desc for send resources in the resources folder
             * @param {Object} params
             * @param params.idInput mandatory
             * @param params.folder optional
             * @param p_params.names optional
             * @param params.callback mandatory
             * @returns {Object}
             */
            postResources: function(params) {
                try {
                    var strUrl = $.Oda.Context.rest+'vendor/happykiller/oda/resources/script/postResources.php?path='+params.folder;

                    if(params.idInput !== ""){
                        var inputElement = $("#"+params.idInput);
                        var files = inputElement[0].files;
                        var data = new FormData();
                        $.each(files, function(i, file) {
                            if(params.names !== undefined){
                                if(params.names[i] !== undefined){
                                    data.append(params.names[i], file);
                                }
                            }else{
                                data.append(file.name, file);
                            }
                        });

                        var ajax = $.ajax({
                            url: strUrl,
                            data: data,
                            cache: false,
                            contentType: false,
                            processData: false,
                            dataType : "json",
                            type: 'POST',
                            success : function(p_resultat, p_statut){
                                params.callback(p_resultat.data);
                            },
                            error : function(p_resultat, p_statut, p_erreur){
                                params.callback({"error": p_erreur });
                            }
                        });

                    }else{
                        $.Oda.Log.error("Erreur pas d'élement selectionné.");
                    }

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.postResources : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.throttle
             * @param callback Function
             * @param delay Integer
             * @returns {$.Oda.Tooling}
             */
            throttle: function(callback, delay) {
                try {
                    var now = +new Date();
                    var context = this;
                    var args = arguments;
                    if($.Oda.Tooling.lastThrottle && (now  < $.Oda.Tooling.lastThrottle + delay)){
                        clearTimeout($.Oda.Tooling.timerThrottle);
                        $.Oda.Tooling.timerThrottle = setTimeout(function(){
                            callback.apply(context, args);
                            $.Oda.Tooling.lastThrottle = now;
                        }, delay);
                    }else{
                        callback.apply(context, args);
                        $.Oda.Tooling.lastThrottle = now;
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.throttle : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.detectBrower
             * @returns {$.Oda.Tooling}
             */
            detectBrower: function() {
                try {
                    var browser,
                        version,
                        mobile,
                        os,
                        osversion,
                        bit,
                        ua = window.navigator.userAgent,
                        platform = window.navigator.platform;

                    if ( /MSIE/.test(ua) ) {

                        browser = 'Internet Explorer';

                        if ( /IEMobile/.test(ua) ) {
                            mobile = 1;
                        }

                        version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];

                    } else if ( /Trident/.test(ua) ) {

                        browser = 'Internet Explorer';

                        var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) != null){
                            version = RegExp.$1;
                        }

                    } else if ( /Chrome/.test(ua) ) {
                        // Platform override for Chromebooks
                        if ( /CrOS/.test(ua) ) {
                            platform = 'CrOS';
                        }

                        browser = 'Chrome';
                        version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];

                    } else if ( /Opera/.test(ua) ) {

                        browser = 'Opera';

                        if ( /mini/.test(ua) || /Mobile/.test(ua) ) {
                            mobile = 1;
                        }

                    } else if ( /Android/.test(ua) ) {

                        browser = 'Android Webkit Browser';
                        mobile = 1;
                        os = /Android\s[\.\d]+/.exec(ua)[0];

                    } else if ( /Firefox/.test(ua) ) {

                        browser = 'Firefox';

                        if ( /Fennec/.test(ua) ) {
                            mobile = 1;
                        }
                        version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];

                    } else if ( /Safari/.test(ua) ) {

                        browser = 'Safari';

                        if ( (/iPhone/.test(ua)) || (/iPad/.test(ua)) || (/iPod/.test(ua)) ) {
                            os = 'iOS';
                            mobile = 1;
                        }

                    }

                    if ( !version ) {

                        version = /Version\/[\.\d]+/.exec(ua);

                        if (version) {
                            version = version[0].split('/')[1];
                        } else {
                            version = /Opera\/[\.\d]+/.exec(ua)[0].split('/')[1];
                        }

                    }

                    if ( platform === 'MacIntel' || platform === 'MacPPC' ) {
                        os = 'Mac OS X';
                        osversion = /10[\.\_\d]+/.exec(ua)[0];
                        if ( /[\_]/.test(osversion) ) {
                            osversion = osversion.split('_').join('.');
                        }
                    } else if ( platform === 'CrOS' ) {
                        os = 'ChromeOS';
                    } else if ( platform === 'Win32' || platform == 'Win64' ) {
                        os = 'Windows';
                        bit = platform.replace(/[^0-9]+/,'');
                    } else if ( !os && /Android/.test(ua) ) {
                        os = 'Android';
                    } else if ( !os && /Linux/.test(platform) ) {
                        os = 'Linux';
                    } else if ( !os && /Windows/.test(ua) ) {
                        os = 'Windows';
                    }

                    $.Oda.Context.window.ui = {
                        browser : browser,
                        version : version,
                        mobile : mobile,
                        os : os,
                        osversion : osversion,
                        bit: bit
                    };

                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.detectBrower : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.isOdaConpatible
             * @returns {Boolean}
             */
            isOdaConpatible: function() {
                try {
                    var boolRetour = true;
                    if(($.Oda.Context.window.ui.browser === "Internet Explorer") && (parseFloat($.Oda.Context.window.ui.version) < 11)){
                        console.error("Oda fatal error: Internet Explorer before 11 not supported.");
                        boolRetour = false;
                    }

                    if(!document.registerElement){
                        console.error("Oda fatal error: Webcomposant not supported.");
                        boolRetour = false;
                        if($.Oda.Context.window.ui.browser === "Firefox"){
                            console.log("You can activate Webcomposant: https://developer.mozilla.org/en-US/docs/Web/Web_Components#Enabling_Web_Components_in_Firefox");
                            console.log("'about:config' in url, and activate 'dom.webcomponents.enabled' by double click.");
                        }
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.isOdaConpatible : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.merge
             * @param {Object} params.default
             * @param {Object} params.source
             * @param {Object} params
             * @returns {Object}
             */
            merge: function(params) {
                try {
                    var objReturn = this.clone(params.default);

                    //if array
                    if(Array.isArray(objReturn)){
                        //for each elt of target we apply the partn array
                        var defaultEltArray = objReturn[0];
                        objReturn = [];
                        for(var index in params.source){
                            objReturn.push(this.merge({default: defaultEltArray, source: params.source[index]}));
                        }
                        //if object    
                    }else if((objReturn !== null) && (objReturn !== undefined) && (objReturn.constructor === Object)){
                        for(var key in objReturn){
                            if((params.source !== null) && (params.source !== undefined) && (params.source[key] !== undefined)){
                                objReturn[key] =  this.merge({default: objReturn[key], source: params.source[key]});
                            }
                        }

                        //check if sources attrib in more
                        for (var key in params.source) {
                            if(!objReturn.hasOwnProperty(key)){
                                objReturn[key] = params.source[key];
                            }
                        }
                    }else if(params.source !== null){
                        objReturn = params.source;
                    }

                    return objReturn;

                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.merge : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.filter
             * @param {Array} params.src
             * @param {Function|Object} params.condition
             * @param {Object} params
             * @returns {Object}
             */
            filter: function(params){
                try {
                    if(!(params.src instanceof Array)){
                        throw {
                            name:        "Wrong type of src",
                            level:       "Show Stopper",
                            message:     "src is not an array",
                            htmlMessage: "src is not an array",
                            toString:    function(){return this.name + ": " + this.message;}
                        };
                    }
                    var tabReturn = [];

                    if(params.condition instanceof Function){
                        for(var index in params.src){
                            var elt = params.src[index];
                            if(params.condition(elt)){
                                tabReturn.push(elt);
                            }
                        }
                    }else if(params.condition instanceof Object){
                        for(var index in params.src){
                            var elt = params.src[index];
                            var gardian = false;
                            for(var keyCondition in params.condition){
                                var conditionAttribute = params.condition[keyCondition];
                                if(elt.hasOwnProperty(keyCondition) && elt[keyCondition] === conditionAttribute){
                                    gardian = true;
                                }
                            }
                            if(gardian){
                                tabReturn.push(elt);
                            }
                        }
                    }else{
                        throw {
                            name:        "Wrong type of condition",
                            level:       "Show Stopper",
                            message:     "condition is not an object or function",
                            htmlMessage: "condition is not an object or function",
                            toString:    function(){return this.name + ": " + this.message;}
                        };
                    }

                    return tabReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.filter : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.jsonToStringHtml
             * @param {Object} p
             * @param {Object} p.json
             * @example $.Oda.Tooling.jsonToStringHtml({json:[{"coucou":"value"}]});
             * @returns {String}
             */
            jsonToStringHtml: function(p){
                try {
                    var str = JSON.stringify(p.json);
                    str = $.Oda.Tooling.replaceAll({
                        str: str,
                        find: "'",
                        by: "\'"
                    });
                    str = $.Oda.Tooling.replaceAll({
                        str: str,
                        find: '"',
                        by: "'"
                    });
                    return str;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.jsonToStringHtml: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.stringToOdaCrypt
             * @param {String} str
             * @example $.Oda.Tooling.stringToCrypt('{"userCode":"ILRO","valideDate":1491902766000}');
             * @returns {String}
             */
            stringToOdaCrypt: function(str){
                try {
                    var strOdaCrypt = '';
                    for(var i=0;i<str.length;i++) {
                        strOdaCrypt += ''+str.charCodeAt(i).toString(16);
                    }
                    return strOdaCrypt;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.stringToOdaCrypt: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Tooling.odaCryptToString
             * @param {String} strOdaCrypt
             * @example $.Oda.Tooling.stringToCrypt('{"userCode":"ILRO","valideDate":1491902766000}');
             * @returns {String}
             */
            odaCryptToString: function(strOdaCrypt){
                try {
                    var hex = strOdaCrypt.toString();//force conversion
                    var str = '';
                    for (var i = 0; i < hex.length; i += 2){
                        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                    }
                    return str;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Tooling.odaCryptToString: " + er.message);
                    return null;
                }
            }
        },

        I8n: {
            datas: [],
            /**
             * @name $.Oda.I8n.get
             * @param {string} p_group
             * @param {string} p_tag
             * @param {object} options
             * @param {string} options.defaultLang
             * @param {string} options.forced
             * @param {object} options.variables
             * @example $.Oda.I8n.get("qcm-main","test", {defaultLang: "en", variables: {var1 : "coucou", var2: "hello"});
             * @returns {String}
             */
            get: function(p_group, p_tag, options) {
                try {
                    var returnvalue = "Not define";

                    if((options !== undefined) && (options.forced !== undefined)){
                        for (var grpId in $.Oda.I8n.datas) {
                            var grp = $.Oda.I8n.datas[grpId];
                            if((grp.groupName === p_group) && grp.hasOwnProperty(options.forced) && grp[options.forced].hasOwnProperty(p_tag)){
                                returnvalue = grp[options.forced][p_tag];
                                if((options !== undefined) && (options.variables !== undefined)){
                                    for(var key in options.variables){
                                        returnvalue = $.Oda.Tooling.replaceAll({
                                            str: returnvalue,
                                            find: "{{"+key+"}}",
                                            by: options.variables[key]
                                        });
                                    }
                                }
                                break;
                            }
                        }
                    }else{
                        for (var grpId in $.Oda.I8n.datas) {
                            var grp = $.Oda.I8n.datas[grpId];
                            if((grp.groupName === p_group) && grp.hasOwnProperty($.Oda.Session.userInfo.locale) && grp[$.Oda.Session.userInfo.locale].hasOwnProperty(p_tag)){
                                returnvalue = grp[$.Oda.Session.userInfo.locale][p_tag];
                                if((options !== undefined) && (options.variables !== undefined)){
                                    for(var key in options.variables){
                                        returnvalue = $.Oda.Tooling.replaceAll({
                                            str: returnvalue,
                                            find: "{{"+key+"}}",
                                            by: options.variables[key]
                                        });
                                    }
                                }
                                break;
                            }
                        }
                    }

                    if((returnvalue === "Not define") && (options !== undefined) && (options.defaultLang !== undefined)){
                        for (var grpId in $.Oda.I8n.datas) {
                            var grp = $.Oda.I8n.datas[grpId];
                            if((grp.groupName === p_group) && grp.hasOwnProperty(options.defaultLang) && grp[options.defaultLang].hasOwnProperty(p_tag)){
                                returnvalue = grp[options.defaultLang][p_tag];
                                if((options !== undefined) && (options.variables !== undefined)){
                                    for(var key in options.variables){
                                        returnvalue = $.Oda.Tooling.replaceAll({
                                            str: returnvalue,
                                            find: "{{"+key+"}}",
                                            by: options.variables[key]
                                        });
                                    }
                                }
                                break;
                            }
                        }
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.get: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.I8n.getByString
             * @param {string} tag
             * @param {string} lang
             * @returns {String}
             */
            getByString: function(tag, lang) {
                try {
                    var returnvalue = tag;

                    var tab = tag.split(".");
                    if((tab.length === 2)){
                        var tmp = $.Oda.I8n.get(tab[0], tab[1], {
                            forced: lang
                        });
                        if(tmp !== "Not define"){
                            returnvalue = tmp;
                        }
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.getByString: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.I8n.getByGroupName
             * @param {string} p_group
             * @returns {String}
             */
            getByGroupName: function(groupName) {
                try {
                    var returnvalue = "Not define";

                    for (var grpId in $.Oda.I8n.datas) {
                        var grp = $.Oda.I8n.datas[grpId];
                        if((grp.groupName === groupName) && grp.hasOwnProperty($.Oda.Session.userInfo.locale) ){
                            returnvalue = grp[$.Oda.Session.userInfo.locale];
                            break;
                        }
                    }

                    return returnvalue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.getByGroupName: " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.I8n.watchLanguage
             * @returns {$.Oda.I8n}
             */
            watchLanguage: function() {
                try {
                    if(!$.Oda.I8n.notifChangeExist){
                        $.Oda.I8n.notifChangeExist = true;
                        $.Oda.Event.addListener({name: "oda-language-changed", callback: function(e){
                                $.Oda.Log.debug('Language change on '+e.detail.event+' from: '+e.detail.old+ ' for:'+e.detail.new);
                            }
                        });
                    }
                    $.Oda.watch('Session', function (id, oldval, newval) {
                        if(oldval.userInfo.locale !== newval.userInfo.locale){
                            $.Oda.Event.send({
                                name:"oda-language-changed",
                                data:{
                                    event: "Session",
                                    old: oldval.userInfo.locale,
                                    new: newval.userInfo.locale
                                }
                            });
                        }
                        return newval;
                    });
                    $.Oda.Session.watch('userInfo', function (id, oldval, newval) {
                        if(oldval.locale !== newval.locale){
                            $.Oda.Event.send({
                                name:"oda-language-changed",
                                data:{
                                    event: "userInfo",
                                    old: oldval.locale,
                                    new: newval.locale
                                }
                            });
                        }
                        return newval;
                    });
                    $.Oda.Session.userInfo.watch('locale', function (id, oldval, newval) {
                        if(oldval !== newval){
                            $.Oda.Event.send({
                                name:"oda-language-changed",
                                data:{
                                    event: "locale",
                                    old: oldval,
                                    new: newval
                                }
                            });
                        }
                        return newval;
                    });
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.I8n.watchLanguage: " + er.message);
                    return null;
                }
            }
        },

        Security: {
            /**
             * @name $.Oda.Security.auth
             * @param {String} p_params.login
             * @param {String} p_params.mdp
             * @param {object} p_params
             * @returns {$.Oda}
             */
            auth: function(p_params) {
                try {
                    $.Oda.Log.debug("$.Oda.Security.auth begin.");
                    $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/session/", {type: "post", callback:function(response){
                        if(response.strErreur !== ""){
                            $.Oda.Storage.remove("ODA-SESSION");
                            $.Oda.Display.Notification.warning(response.strErreur);
                        }else{
                            var code_user = response.data.code_user.toUpperCase();
                            var key = response.data.keyAuthODA;

                            var session = {
                                "code_user": code_user,
                                "key": key
                            };

                            $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/user/current", {callback:function(response){
                                if(response.strErreur === ""){
                                    var userInfo = {
                                        "locale": response.data.langue,
                                        "lastName": response.data.nom,
                                        "firstName": response.data.prenom,
                                        "mail": response.data.mail,
                                        "profile": response.data.profile,
                                        "profileLabel": response.data.labelle,
                                        "showTooltip": response.data.montrer_aide_ihm
                                    };
                                    session.userInfo = userInfo;
                                    session.id = response.data.id_user;
                                    $.Oda.Storage.set("ODA-SESSION",session,43200);
                                    $.Oda.Session = session;
                                    $.Oda.I8n.watchLanguage();
                                    $.Oda.Security.loadRight({
                                        callback: function(){
                                            $.Oda.Router.routerExit = false;
                                            if(p_params.reload){
                                                $.Oda.Router.navigateTo();
                                            }
                                        }
                                    });
                                }else{
                                    $.Oda.Storage.remove("ODA-SESSION");
                                    $.Oda.Display.Notification.warning(response.strErreur);
                                    $.Oda.Router.routerExit = false;
                                    if(p_params.reload){
                                        $.Oda.Router.navigateTo();
                                    }
                                }
                            }}, { 
                                keyAuthODA: key
                            });
                        }
                    }}, { 
                        userCode: p_params.login, 
                        password: p_params.mdp 
                    });
                    return this;
                } catch (er) {
                    $.Oda.Log.Log.error("$.Oda.Security.auth : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Security.loadRight
             * @example $.Oda.Security.loadRight({callbakc:function(){...})
             * @param {function} p.callback
             * @param {object} p
             * @returns {$.Oda}
             */
            loadRight: function(p) {
                try {
                    $.Oda.Router.routesAllowed = $.Oda.Router.routesAllowedDefault.slice(0);
                    $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/navigation/right/", {callback: function(response){
                        var datas = response.data;
                        for (var indice in datas) {
                            if((datas[indice].id_categorie !== "1")){
                                var route = datas[indice].Lien;
                                route = route.replace("api_page_","");
                                route = route.replace("page_","");
                                route = route.replace(".html","");
                                $.Oda.Router.routesAllowed.push(route);
                            }
                        }
                        p.callback();
                    }});
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Security.loadRight: " + er.message);
                }
            },
            /**
             * @name $.Oda.Security.logout
             */
            logout: function(){
                try {
                    if($.Oda.Session.key !== ""){
                        $.Oda.Interface.callRest($.Oda.Context.rest+"vendor/happykiller/oda/resources/api/session/"+$.Oda.Session.key, {type: "delete", callback:function(response){
                            $.Oda.Storage.remove("ODA-CACHE-"+$.Oda.Session.code_user);
                            $.Oda.Session = $.Oda.SessionDefault;
                            $.Oda.I8n.watchLanguage();
                            $.Oda.Storage.remove("ODA-SESSION");
                            $.Oda.Display.MenuSlide.remove();
                            $.Oda.Display.Menu.remove();
                            $.Oda.Router.routes.auth.go();
                        }});
                    }else{
                        $.Oda.Storage.remove("ODA-CACHE-"+$.Oda.Session.code_user);
                            $.Oda.Session = $.Oda.SessionDefault;
                            $.Oda.I8n.watchLanguage();
                            $.Oda.Storage.remove("ODA-SESSION");
                            $.Oda.Display.MenuSlide.remove();
                            $.Oda.Display.Menu.remove();
                            $.Oda.Router.routes.auth.go();
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Security.logout: " + er.message);
                }
            }
        },

        Worker: {
            /**
             * @name $.Oda.Worker.lib
             */
            lib: function(){
                this.$Oda = {
                    Context : {
                        rest : "$$REST$$"
                    },

                    Session : {
                        code_user : "$$CODEUSER$$",
                        key : "$$ODAKEY$$"
                    },

                    message : function(cmd, parameter){
                        try {
                            this.cmd = cmd;
                            this.parameter = parameter;
                        } catch (er) {
                            $Oda.log("ERROR($Oda.message : " + er.message);
                        }
                    },

                    log : function(msg){
                        console.log(msg);
                    },

                    callRest: function(p_url, p_tabSetting, p_tabInput) {
                        try {
                            var jsonAjaxParam = {
                                url : p_url,
                                contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
                                dataType : 'json',
                                type : 'GET'
                            };

                            p_tabInput.milis = this.getMilise();
                            p_tabInput.ctrl = "OK";
                            p_tabInput.keyAuthODA = this.Session.key;

                            jsonAjaxParam.data = p_tabInput;

                            //traitement determinant async ou pas
                            var async = true;
                            if(p_tabSetting.functionRetour === null){
                                async = false;
                                jsonAjaxParam.async = false;
                            }

                            for(var indice in p_tabSetting){
                                jsonAjaxParam[indice] = p_tabSetting[indice];
                            }

                            //si retour synchron init retour
                            var v_retourSync = null;

                            //Utilisé notament pour les workers qui ne peuvent avoir Jquey et donc Ajax
                            var xhr_object = new XMLHttpRequest();

                            switch (jsonAjaxParam.type){
                                case "GET":
                                case "get":
                                    var url = jsonAjaxParam.url+"?tag=1";

                                    for(var key in jsonAjaxParam.data){
                                        var param = jsonAjaxParam.data[key].toString();
                                        url += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type, url, false);
                                    xhr_object.send(null);
                                    break;
                                case "POST":
                                case "post":
                                default:
                                    var params = "tag=1";
                                    for(var key in jsonAjaxParam.data){
                                        var param = jsonAjaxParam.data[key].toString();
                                        params += "&"+key+"="+(param.replace(new RegExp("&", "g"), '%26'));
                                    }

                                    xhr_object.open(jsonAjaxParam.type,jsonAjaxParam.url, false);
                                    xhr_object.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                                    xhr_object.send(params);
                                    break;
                            }

                            v_retourSync =  {"strErreur": "No call", "data": {}, "statut": 4};
                            switch (jsonAjaxParam.dataType) {
                                case "json":
                                    if (xhr_object.readyState === 4 && xhr_object.status === 200) {
                                        v_retourSync = JSON.parse(xhr_object.responseText);
                                    } else {
                                        v_retourSync = {"strErreur": "$Oda.callRest : " + xhr_object.status + " " + xhr_object.statusText, "data": {}, "statut": 4};
                                    }
                                    break;
                                case "text":
                                default:
                                    if (xhr_object.readyState === 4) {
                                        v_retourSync = xhr_object.responseText;
                                    } else {
                                        v_retourSync = "$Oda.callRest : " + xhr_object.status + " " + xhr_object.statusText;
                                    }
                                    break;
                            }

                            delete self.xhr_object;

                            return v_retourSync;
                        } catch (er) {
                            var msg = "ERROR($Oda.callRest) : " + er.message;
                            $Oda.log(msg);
                            return null;
                        }
                    },

                    /**
                     * @name getMilise
                     * @returns {string}
                     */
                    getMilise : function() {
                        try {
                            var d = new Date();
                            return d.getTime();
                        } catch (er) {
                            $Oda.log("ERROR($Oda.getMilise) : " + er.message);
                            return null;
                        }
                    },

                    /**
                     * arrondir
                     * @param {float|int} p_value
                     * @param {int} p_precision
                     * @returns {float|int}
                     */
                    arrondir : function(p_value, p_precision){
                        try {
                            var retour = 0;
                            var coef = Math.pow(10, p_precision);

                            if(coef !== 0){
                                retour = Math.round(p_value*coef)/coef;
                            }else{
                                retour = Math.round(p_value);
                            }

                            return retour;
                        } catch (er) {
                            $Oda.log("ERROR($Oda.arrondir) : " + er.message);
                            return null;
                        }
                    }
                };
            },
            /**
             * @name $.Oda.Worker.message
             * @param cmd
             * @param parameter
             */
            message: function(cmd, parameter){
                try {
                    this.cmd = cmd;
                    this.parameter = parameter;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.message : " + er.message);
                }
            },
            /**
             * @name $.Oda.Worker.initWorker
             * @desc pour initialiser un worker
             * @param {string} p_nameWorker
             * @param {string} p_fonctionRetour
             * @returns {Worker}
             */
            initWorker: function(p_nameWorker, p_dataInit, p_functionCore, p_fonctionRetour) {
                try {
                    var strFunctionLib = $.Oda.Worker.lib.toString();
                    strFunctionLib = strFunctionLib.substring(12);
                    strFunctionLib = strFunctionLib.substring(0, strFunctionLib.length - 1);
                    strFunctionLib = strFunctionLib.replace("$$CODEUSER$$",$.Oda.Session.code_user);
                    strFunctionLib = strFunctionLib.replace("$$ODAKEY$$",$.Oda.Session.key);
                    strFunctionLib = strFunctionLib.replace("$$REST$$",$.Oda.Context.rest);

                    var strFunctionCore = p_functionCore.toString();
                    strFunctionCore = strFunctionCore.substring(12);
                    strFunctionCore = strFunctionCore.substring(0, strFunctionCore.length - 1);

                    var blob = new Blob([strFunctionLib+strFunctionCore], {type: 'application/javascript'});

                    var monWorker = new Worker(window.URL.createObjectURL(blob));

                    monWorker.addEventListener("message", function(event) {
                        p_fonctionRetour(event.data);
                    }, false);

                    return monWorker;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.initWorker : " + er.message);
                }
            },
            /**
             * @name $.Oda.Worker.terminateWorker
             * @desc pour finir le worker
             * @param {type} p_worker
             * @returns {undefined}
             */
            terminateWorker: function(p_worker) {
                try {
                    // On aurait pu créer une commande 'stop' qui aurait été traitée
                    // au sein du worker qui se serait fait hara-kiri via .close()
                    p_worker.terminate();
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Worker.terminateWorker : " + er.message);
                }
            }
        },

        Guidance: {
            /**
             * @name $.Oda.Guidance.run
             */
            run: function(){
                try {
                    $.Oda.Log.debug('$.Oda.Guidance.run.')
                    var guidanceStorage = $.Oda.Storage.get("ODA-GUIDANCE-"+$.Oda.Session.code_user); 
                    if(!guidanceStorage){
                        guidanceStorage = {};
                    }
                    $('oda-guidance').each(function(){
                        $elt = $(this);
                        var id = $elt.attr("oda-guidance-id");
                        var next = $elt.attr("oda-guidance-next");
                        if(guidanceStorage[id] === undefined){
                            guidanceStorage[id] = {
                                status: (next)?'next':'show'
                            };
                        }
                    });
                    $.Oda.Storage.set("ODA-GUIDANCE-"+$.Oda.Session.code_user, guidanceStorage);
                    var gardianNext = false;
                    for(var key in guidanceStorage){
                        var elt = guidanceStorage[key];
                        if(elt.status === "show"){
                            var $elt = $('#'+key);
                            if(!$elt.next('div.popover:visible').length){
                                $elt.popover('show');
                            }
                        }else if((elt.status === 'next')&&(!gardianNext)){
                            gardianNext = true;
                            var $elt = $('#'+key);
                            if(!$elt.next('div.popover:visible').length){
                                $elt.popover('show');
                            }
                        }
                    }
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Guidance.run: " + er.message);
                }
            }
        },

        Scope: {
            Gardian: {
                inventory: {},
                /**
                 * @name $.Oda.Scope.Gardian.add
                 * @param {Object} p_params
                 * @param p_params.id
                 * @param p_params.listElt
                 * @param p_params.function
                 * @returns {$.Oda.Scope.Gardian}
                 */
                add: function(p_params) {
                    try {
                        $.Oda.Scope.Gardian.inventory[p_params.id] = {
                            listElt : p_params.listElt,
                            function : p_params.function
                        };
                        p_params.function();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.add : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Scope.Gardian.remove
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Scope.Gardian}
                 */
                remove: function(p_params) {
                    try {
                        $.each($.Oda.Scope.Gardian.inventory, function( key, value ) {
                            delete $.Oda.Scope.Gardian.inventory[key];
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.remove : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Scope.Gardian.removeAll
                 * @returns {$.Oda.Scope.Gardian}
                 */
                removeAll: function() {
                    try {
                        $.Oda.Scope.Gardian.inventory = {};
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.removeAll : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name $.Oda.Scope.Gardian.findByElt
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.Scope.Gardian}
                 */
                findByElt: function(p_params) {
                    try {
                        $.each($.Oda.Scope.Gardian.inventory, function( key, value ) {
                            if($.Oda.Tooling.isInArray(p_params.id, value.listElt)){
                                value.function({elt : p_params.id});
                            };
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.Scope.Gardian.findByElt : " + er.message);
                        return null;
                    }
                },
            }
        },

        Storage: {
            /* Version number */
            version : VERSION,
            ttl_default : 86400, //24H
            storageKey : "ODA__default__",
            /**
             * @name Oda.Storage.isStorageAvaible
             * @returns {Boolean}
             */
            isStorageAvaible: function(){
                try {
                    var boolRetour = false;

                    if (localStorage) {
                        boolRetour = true;
                    }

                    return boolRetour;
                } catch (er) {
                    $.Oda.Log.error("Oda.Storage.isStorageAvaible : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.set
             * @param {string} p_key
             * @param {json} p_value
             * @param {integer} p_ttl in seconde
             * @example $.Oda.Storage.set('key',{'key':'value'});
             * @returns {Boolean}
             */
            set: function(p_key, p_value, p_ttl) {
                try {
                    var d = new Date();
                    var date = d.getTime();

                    var ttl = 0;
                    if(typeof(p_ttl) !== 'undefined'){
                        ttl = p_ttl;
                    }

                    var storage = {
                        "value" : p_value,
                        "recordDate" : date,
                        "ttl" : ttl
                    };

                    var data = JSON.stringify(storage);

                    var compressed;
                    if(typeof(LZString) !== 'undefined'){
                        compressed = LZString.compressToUTF16(data);
                    }else{
                        compressed = data;
                    }

                    localStorage.setItem(this.storageKey + p_key, compressed);

                    return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.set : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.get
             * @param {string} p_key
             * @param {json} p_default
             * @example $.Oda.Storage.get('key',{'key':'value'});
             * @returns {json}
             */
            get: function(p_key, p_default) {
                try {
                    var myValue = null;

                    var compressed = localStorage.getItem($.Oda.Storage.storageKey+p_key);
                    if(compressed !== null){
                        var data;
                        if(typeof(LZString) !== 'undefined'){
                            data = LZString.decompressFromUTF16(compressed);
                        }else{
                            data = compressed;
                        }
                        var myStorage = JSON.parse(data);

                        myValue = myStorage.value;

                        if((myStorage.value !== null)&&(myStorage.ttl !== 0)){
                            var d = new Date();
                            var date = d.getTime();

                            var dateTimeOut = myStorage.recordDate + (myStorage.ttl*1000);

                            if(date > dateTimeOut){
                                this.remove(p_key);
                                myValue = null;
                            }
                        }

                        if((myValue === null)&&(typeof(p_default) !== 'undefined')){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }else{
                        if(typeof(p_default) !== 'undefined'){
                            this.set(p_key, p_default);
                            myValue = p_default;
                        }
                    }

                    return myValue;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.get : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.setTtl
             * @desc reset ttl with new
             * @param {string} p_key
             * @param {int} p_ttl
             * @returns {boolean}
             */
            setTtl: function(p_key, p_ttl) {
                try {
                    var myReturn = false;

                    var myStorage = localStorage.getItem($.Oda.Storage.storageKey+p_key);

                    if(myStorage !== null) {

                        var data;
                        if (typeof(LZString) !== 'undefined') {
                            data = LZString.decompressFromUTF16(myStorage);
                        } else {
                            data = myStorage;
                        }
                        var value = JSON.parse(data);

                        var myReturn = $.Oda.Storage.set(p_key, value.value, p_ttl);
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.setTtl : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.getTtl
             * @param {string} p_key
             * @returns {int}
             */
            getTtl: function(p_key) {
                try {
                    var myReturn = 0;

                    var myStorage = localStorage.getItem($.Oda.Storage.storageKey+p_key);

                    if(myStorage !== null){

                        var data;
                        if(typeof(LZString) !== 'undefined'){
                            data = LZString.decompressFromUTF16(myStorage);
                        }else{
                            data = myStorage;
                        }
                        var value = JSON.parse(data);

                        var d = new Date();
                        var date = d.getTime();

                        var dateTimeOut = value.recordDate + (value.ttl*1000);

                        myReturn = dateTimeOut - date;
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.getTtl : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.setTtl
             * @param {string} p_key
             * @returns {int}
             */
            remove: function(p_key) {
                try {
                    var myReturn = true;

                    localStorage.removeItem($.Oda.Storage.storageKey+p_key);

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.setTtl : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.reset
             * @returns {int}
             */
            reset: function() {
                try {
                    var myReturn = true;

                    for (var indice in localStorage) {
                        localStorage.removeItem(indice);
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.reset : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Storage.getIndex
             * @param {string} p_key
             * @returns {array}
             */
            getIndex: function(p_filtre) {
                try {
                    var myReturn = [];

                    for (var indice in localStorage) {
                        var patt = new RegExp($.Oda.Storage.storageKey+p_filtre, 'gi');
                        var res = patt.test(indice);
                        if(res){
                            myReturn.push(indice);
                        }
                    }

                    return myReturn;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Storage.getIndex : " + er.message);
                    return null;
                }
            }
        },

        Router: {
            current: {
                route : "",
                args : []
            },
            routes: {},
            routerExit: false,
            routesAllowed: [],
            routeDependencies: [],
            routesAllowedDefault: [],
            MiddleWares: {},
            /**
             * @name $.Oda.Router.navigateTo
             * @param {object} p_request
             * @returns {$.Oda.Router}
             */
            navigateTo: function(p_request) {
                try {
                    $.Oda.Display.Popup.closeAll();

                    $.Oda.Router.routerExit = false;

                    if($.Oda.Tooling.isUndefined(p_request)){
                        p_request = $.Oda.Router.current;
                    }

                    for(var name in $.Oda.Router.routes){
                        for(var indice in $.Oda.Router.routes[name].urls){
                            var url = $.Oda.Router.routes[name].urls[indice];
                            if(url === p_request.route){
                                $.Oda.Router.current = p_request;

                                if($.Oda.Session.code_user !== ""){
                                    $.Oda.Interface.addStat($.Oda.Session.code_user, $.Oda.Router.current.route, "request");
                                }

                                $.Oda.Router.routes[name].go(p_request);

                                if ($('#wrapper').exists()) {
                                    $("#wrapper").removeClass("toggled");
                                }
                                return this;
                            }
                        }
                    }

                    $.Oda.Log.error(p_request.route + " not found.");
                    $.Oda.Router.routes["404"].go(p_request);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.navigateTo : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.addRoute
             * @param {String} name description
             * @param {object} p_routeDef
             * @returns {$.Oda.Router}
             */
            addRoute: function(p_name, p_routeDef) {
                try {
                    if(!p_routeDef.hasOwnProperty("system")){
                        p_routeDef.system = false;
                    }
                    p_routeDef.go = function(p_request){
                        $.Oda.Router.routerGo({"routeDef" : this, "request" : p_request});
                    };
                    if(!p_routeDef.hasOwnProperty("middleWares")){
                        p_routeDef.middleWares = [];
                    }
                    if(!p_routeDef.hasOwnProperty("dependencies")){
                        p_routeDef.dependencies = [];
                    }
                    $.Oda.Router.routes[p_name] = p_routeDef;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.addRoute : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.addMiddleWare
             * @param {string} p_name
             * @param {object} p_midlleWareDef
             * @returns {$.Oda.Router}
             */
            addMiddleWare: function(p_name, p_midlleWareDef) {
                try {
                    $.Oda.Router.MiddleWares[p_name] = p_midlleWareDef;
                    $.Oda.Router.MiddleWares[p_name].name = p_name;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.addMiddleWare : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.addDependencies
             * @param {string} p_name
             * @param {object} p_dependenciesLoad
             * @returns {$.Oda.Router}
             */
            addDependencies: function(p_name, p_dependenciesLoad) {
                try {
                    p_dependenciesLoad.name = p_name;
                    $.Oda.Router.routeDependencies[p_name] = p_dependenciesLoad;
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.addDependencies : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.loadPartial
             * @param {Object} p_params
             * @returns {$.Oda.Router}
             */
            loadPartial: function(p_params) {
                try {
                    $.get(p_params.routeDef.path, function(data) {
                        $('#'+$.Oda.Context.mainDiv).html(data);
                        $("[oda-avatar-name=avatar]").attr('oda-avatar-user',$.Oda.Session.code_user);
                        if($.Oda.Session.code_user !== ""){
                            $.Oda.Guidance.run();
                        }
                    })
                    .fail(function(){
                        $.Oda.Log.error("$.Oda.Router.loadPartial : " + p_params.routeDef.path + " not found.");
                    });
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.loadPartial : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.startRooter
             * @returns {$.Oda.Router}
             */
            startRooter: function() {
                try {
                    if($("#projectLabel").exists()){
                        $("#projectLabel").text($.Oda.Context.projectLabel);
                    }

                    if(!$("#"+ $.Oda.Context.mainDiv).exists()){
                        $(" body ").append('<!-- content --><div id="'+ $.Oda.Context.mainDiv + '"><oda-loading></oda-loading></div>');
                    }

                    var hash = decodeURI($.Oda.Context.window.location.hash.substring(1).replace(/\?(.*)$/, ''));
                    var loc = $.Oda.Context.window.location + '';
                    var locationRacine = loc.replace(/#(.*)$/, '').replace(/\?(.*)$/, '')+'#';

                    var paramsGet = $.Oda.Tooling.getParameterGet({url: decodeURI($.Oda.Context.window.location)});

                    var obj = { Page: hash, Url: locationRacine };
                    $.Oda.Context.window.history.pushState(obj, obj.Page, obj.Url);

                    $.Oda.Router.current = {
                        route: hash,
                        args: paramsGet
                    };

                    this.navigateTo($.Oda.Router.current);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.startRooter : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Router.routerGo
             * @param {object} p_params description
             * @returns {$.Oda.Router}
             */
            routerGo: function(p_params) {
                try {
                    $.Oda.Log.debug("RouterGo : " + p_params.routeDef.path);

                    $('#' + $.Oda.Context.mainDiv).html('<oda-loading/>')

                    //HASH
                    if (!p_params.routeDef.system) {
                        var urlRoute = $.Oda.Router.current.route;
                        var urlArg = "";
                        for (var key in $.Oda.Router.current.args) {
                            if (($.Oda.Router.current.args[key] !== "getUser") && ($.Oda.Router.current.args[key] !== "getPass")) {
                                if (urlArg === "") {
                                    urlArg += "?";
                                } else {
                                    urlArg += "&";
                                }
                                urlArg += key + "=" + $.Oda.Router.current.args[key];
                            }
                        }
                        $.Oda.Context.window.location.hash = urlRoute + urlArg;

                        var decoded = $.Oda.Tooling.decodeHtml($.Oda.I8n.getByString(p_params.routeDef.title));

                        $.Oda.Context.window.document.title = $.Oda.Context.projectLabel + " - " + decoded;
                    }

                    // DEPENDENCIES
                    var listDepends = [];
                    for (var indice in p_params.routeDef.dependencies) {
                        listDepends = listDepends.concat($.Oda.Router.routeDependencies[p_params.routeDef.dependencies[indice]]);
                    }

                    $.Oda.Loader.load({ depends : listDepends, functionFeedback : function(data){
                        //exec middleware
                        if (data.params.routeDef.middleWares.length > 0) {
                            for (var indice in data.params.routeDef.middleWares) {
                                $.Oda.Router.MiddleWares[data.params.routeDef.middleWares[indice]]();
                            }
                        }

                        if (($.Oda.Router.routerExit) && (!data.params.routeDef.system)) {
                            return true;
                        }

                        //load menus
                        if (($.Oda.Context.ModeExecution.scene) && ($.Oda.Session.code_user !== "")) {
                            $.Oda.Display.MenuSlide.show();
                            $.Oda.Display.Menu.show();
                        }

                        //show message
                        if (($.Oda.Context.ModeExecution.message) && ($.Oda.Session.code_user !== "")) {
                            $.Oda.Display.Message.show();
                        }

                        //reset gardians
                        $.Oda.Scope.Gardian.removeAll();

                        //call content
                        $.Oda.Router.loadPartial({"routeDef" : data.params.routeDef});
                    }, functionFeedbackParams : {params : p_params}});

                    return true;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Router.routerGo : " + er.message);
                    return null;
                }
            }
        },

        Google: {
            gapiStatuts : {
                "zero" : 0,
                "init" : 1,
                "loaded" : 2,
                "finish" : 3,
                "fail" : 4
            },
            gapiStatut : 0,
            gapi : null,
            clientId : "249758124548-fgt33dblm1r8jm0nh9snn53pkghpjtsu.apps.googleusercontent.com",
            apiKey : "PgCsKeWAsVGdOj3KjPn-JPS3",
            scopes : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            trySessionAuth : 0,
            methodeSessionAuthKo : null,
            methodeSessionAuthOk : null,
            sessionInfo : null,
            gaips : [],
            urlTokenInfo : "https://www.googleapis.com/oauth2/v1/tokeninfo",
            /**
             * @name $.Oda.Google.init
             */
            init: function() {
                try {
                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.init;
                            $.getScript("https://apis.google.com/js/client.js?onload=handleClientLoad",function(){
                                $.Oda.Google.handleClientLoad();
                            });
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Log.debug("$.Oda.Google.init : already load.");
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.init : client load fail.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.init :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.handleClientLoad
             */
            handleClientLoad: function() {
                try {
                    if(gapi.hasOwnProperty("client")) {
                        $.Oda.Google.gapi = gapi;
                        $.Oda.Google.gapiStatut = $.Oda.Google.gapiStatuts.loaded;
                        $.Oda.Event.send({name : "oda-gapi-loaded"});
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad : finish.");
                    }else{
                        $.Oda.Log.debug("$.Oda.Google.handleClientLoad : waiting (gapi.client not loaded)");
                        $.Oda.Tooling.timeout($.Oda.Google.handleClientLoad,100);
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleClientLoad :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.startSessionAuth
             */
            startSessionAuth: function(methodOk, methodKo){
                try {
                    if(!$.Oda.Tooling.isUndefined(methodOk)){
                        $.Oda.Google.methodeSessionAuthOk = methodOk;
                    }
                    if(!$.Oda.Tooling.isUndefined(methodKo)){
                        $.Oda.Google.methodeSessionAuthKo = methodKo;
                    }

                    switch($.Oda.Google.gapiStatut) {
                        case $.Oda.Google.gapiStatuts.zero :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : waiting (gapi not start)");
                            $.Oda.Google.init();
                            $.Oda.Event.addListener({name : "oda-gapi-loaded", callback : function(e){
                                $.Oda.Google.startSessionAuth();
                            }});
                            break;
                        case $.Oda.Google.gapiStatuts.loaded :
                            $.Oda.Google.loadGapis([{
                                "api": "oauth2",
                                "version": "v2"
                            }], $.Oda.Google.callbackAuthSession);
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : finish.");
                            break;
                        case $.Oda.Google.gapiStatuts.init :
                            $.Oda.Log.debug("$.Oda.Google.startSessionAuth : waiting (gapi not loaded)");
                            $.Oda.Tooling.timeout($.Oda.Google.startSessionAuth,100);
                            break;
                        default:
                            $.Oda.Log.error("$.Oda.Google.startSessionAuth : $.Oda.Google.gapi problem.");
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.startSessionAuth : " + er.message);
                }
            },
            /**
             * @name $.Oda.Google.loadGapis
             */
            loadGapis : function(tabApi, callbackFunction) {
                try {
                    if (tabApi.length > 0) {
                        for (var indice in $.Oda.Google.gaips) {
                            if (($.Oda.Google.gaips[indice].api === tabApi[0].api) && ($.Oda.Google.gaips[indice].version === tabApi[0].version)) {
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Already ok pour ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                                return true;
                            }
                        }

                        $.Oda.Google.gapi.client.load(tabApi[0].api, tabApi[0].version, function(resp) {
                            if (typeof resp === "undefined") {
                                $.Oda.Google.gaips.push({"api": tabApi[0].api, "version": tabApi[0].version});
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Chargement ok pour ' + tabApi[0].api + " en " + tabApi[0].version);
                                tabApi.splice(0, 1);
                                $.Oda.Google.loadGapis(tabApi, callbackFunction);
                            } else {
                                $.Oda.Log.debug('$.Oda.Google.loadGapis : Chargement ko pour ' + tabApi[0].api + " en " + tabApi[0].version + "(" + resp.error.message + ")");
                            }
                        });
                    } else {
                        $.Oda.Log.debug("$.Oda.Google.loadGapis : finish.");
                        callbackFunction();
                    }
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.loadGapis :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.callbackAuthSession
             */
            callbackAuthSession : function(){
                try {
                    $.Oda.Google.gapi.client.setApiKey($.Oda.Google.apiKey);
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": true}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callbackAuthSession finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callbackAuthSession :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.handleAuthResult
             */
            handleAuthResult : function(authResult) {
                try {
                    if ((authResult) && (!authResult.error) && (authResult.access_token !== undefined)) {
                        $.Oda.Google.sessionInfo = authResult;
                        $.Oda.Google.methodeSessionAuthOk();
                    } else {
                        $.Oda.Google.methodeSessionAuthKo();
                    }
                    $.Oda.Log.debug("$.Oda.Google.handleAuthResult finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.handleAuthResult :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.callServiceGoogleAuth
             */
            callServiceGoogleAuth : function(callMethodeOk) {
                try {
                    $.Oda.Google.methodeSessionAuthOk = callMethodeOk;
                    $.Oda.Google.gapi.auth.authorize({"client_id": $.Oda.Google.clientId, "scope": $.Oda.Google.scopes, "immediate": false}, $.Oda.Google.handleAuthResult);
                    $.Oda.Log.debug("$.Oda.Google.callServiceGoogleAuth finish.");
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.callServiceGoogleAuth :" + er.message);
                }
            },
            /**
             * @name $.Oda.Google.sessionState
             * @param {Object} p_params
             * @param p_params.callback
             * @example $.Oda.Google.sessionState({'callback':function(response){console.log(response);}});
             * @returns {$.Oda.Google.session}
             */
            sessionState : function(p_params) {
                try {
                    var tabInput = {
                        "access_token" : $.Oda.Google.sessionInfo.access_token
                    };
                    var call = $.Oda.Interface.callRest($.Oda.Google.urlTokenInfo, {"callback": function(response){
                        p_params.callback(response);
                    }}, tabInput);
                    return this;
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Google.sessionState : " + er.message);
                    return null;
                }
            },
        },

        Log: {
            /**
             * @name $.Oda.Log.info
             * @param p_msg
             * @returns {*}
             */
            info: function(p_msg) {
                try {
                    $.Oda.Context.console.info(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.info : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Log.trace
             * @param p_msg
             * @returns {*}
             */
            trace: function(p_msg) {
                try {
                    $.Oda.Context.console.log(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.trace : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Log.debug
             * @param p_msg
             * @returns {*}
             */
            debug: function(p_msg) {
                try {
                    if($.Oda.Context.dev || $.Oda.Context.debug){
                        $.Oda.Context.console.debug(p_msg);
                    }
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.debug : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Log.error
             * @param p_msg
             * @returns {*}
             */
            error: function(p_msg) {
                try {
                    $.Oda.Context.console.error(p_msg);
                    if(!$.Oda.Context.dev && !$.Oda.Context.debug){
                        $.Oda.Interface.traceLog({"msg":p_msg});
                    }
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.error : " + er.message);
                    return null;
                }
            },
            /**
             * @name $.Oda.Log.warning
             * @param p_msg
             * @returns {*}
             */
            warning: function(p_msg) {
                try {
                    $.Oda.Context.console.warn(p_msg);
                    return this;
                } catch (er) {
                    console.log("$.Oda.Log.warning : " + er.message);
                    return null;
                }
            }
        },

        Websocket:{
            tagJson: "odaTagJson:",
            connection: function(wsConn){
                that = this;
                that.wsConn = wsConn;
                that.wsConn.onopen = function(e) { 
                    $.Oda.Log.debug("$.Oda.Websocket.connect: Connection success.");
                    that.onConnect();
                }
                that.wsConn.onmessage = function(e) { 
                    $.Oda.Log.debug("$.Oda.Websocket.connect: Message receive from " + e.origin);
                    var data = e.data;
                    if(e.data.startsWith($.Oda.Websocket.tagJson)){
                        var tmpStr = $.Oda.Tooling.replaceAll({
                            str: e.data,
                            find: $.Oda.Websocket.tagJson,
                            by: ''
                        });
                        data = JSON.parse(tmpStr);
                    }
                    that.onMessage({
                        origin: e.origin,
                        data: data
                    });
                };
                that.send = function(msg){
                    var strMsg = msg;
                    if(!(typeof msg === "string")){
                        strMsg = $.Oda.Websocket.tagJson + JSON.stringify(msg);
                    }
                    that.wsConn.send(strMsg);
                };
                that.onConnect = function(){};
                that.onMessage = function(e){};
            },
            /**
             * @name $.Oda.Log.info
             * @param {object} p
             * @param {string} p.host
             * @param {string} p.port
             * @param {string} p.instance
             * @returns {object} conn
             */
            connect: function(p) {
                try {
                    var protocol = 'ws://'; 
                    if ((window.location.protocol === 'https:') || (window.location.protocol === 'file:')) {
                        protocol = 'wss://';
                    }
                    var connStr = protocol + p.host + ((p.port!=="" && p.port!==null)?':'+p.port:'') +'/'+p.instance;
                    $.Oda.Log.debug('$.Oda.Websocket.connect to '+connStr);
                    return new $.Oda.Websocket.connection(new WebSocket(connStr));
                } catch (er) {
                    $.Oda.Log.error("$.Oda.Websocket.connect: " + er.message);
                    return null;
                }
            },
        }
    };

    $.Oda.Session = $.Oda.SessionDefault;
    $.Oda.I8n.watchLanguage();

    $.Oda.Context.startDate = new Date();

    $.Oda.Tooling.detectBrower();

    //Apply the mode execution
    var params = $.Oda.Tooling.getParamsLibrary({library: "Oda"});
    if (params.hasOwnProperty("modeExecution")){
        switch(params.modeExecution) {
            case "full":
                $.Oda.Context.ModeExecution.app = true;
                $.Oda.Context.ModeExecution.scene = true;
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                $.Oda.Context.ModeExecution.footer = true;
                $.Oda.Context.ModeExecution.widget = true;
                break;
            case "app":
                $.Oda.Context.ModeExecution.app = true;
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                $.Oda.Context.ModeExecution.footer = true;
                $.Oda.Context.ModeExecution.widget = true;
                break;
            case "mini":
                $.Oda.Context.ModeExecution.init = true;
                $.Oda.Context.ModeExecution.notification = true;
                $.Oda.Context.ModeExecution.message = true;
                $.Oda.Context.ModeExecution.footer = true;
                break;
            default:
                break;
        }
    }
    if(params.hasOwnProperty("vendorName")){
        $.Oda.Context.vendorName = params.vendorName;
    }
    if(params.hasOwnProperty("debug")){
        $.Oda.Context.debug = params.debug;
    }
    if(params.hasOwnProperty("dev")){
        $.Oda.Context.dev = params.dev;
    }
    if(params.hasOwnProperty("appLibName")){
        $.Oda.Context.appLibName = params.appLibName;
    }

    // Initialize
    if($.Oda.Context.ModeExecution.init){
        if($.Oda.Tooling.isOdaConpatible()){
            $.Oda.init();
        }else{
            $("body").append('<p style="text-align:center;font-weight: bold;">Brower not compatible for Oda. Please check the console for more details.</p>');
        }
    }
})($ || ($ = {
 fn: {}
}));