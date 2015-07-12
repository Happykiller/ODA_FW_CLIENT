/* global er */
//# sourceURL=OdaApp.js
// Library of tools for the exemple
/**
 * @author FRO
 * @date 15/05/08
 */

var wowhead_tooltips = { "colorlinks": true, "iconizelinks": true, "renamelinks": true };

(function() {
    'use strict';

    var
        /* version */
        VERSION = '0.1'
    ;
    
    ////////////////////////// PRIVATE METHODS ////////////////////////
    /**
     * @name _init
     * @desc Initialize
     */
    function _init() {
        $.Oda.Event.addListener({name : "oda-fully-loaded", callback : function(e){
            $.Oda.App.startApp();
        }});
    }

    ////////////////////////// PUBLIC METHODS /////////////////////////
    $.Oda.App = {
        /* Version number */
        version: VERSION,
        
        colorCard : {
            Commune : "#848484",
            Commune_inv : "#B0B0B0",
            Rare : "#2E2EFE",
            Rare_inv : "#5A5AFF",
            Épique : "#8904B1",
            Épique_inv : "#AA61C1",
            Légendaire : "#FF8000",
            Légendaire_inv : "#FFB163"
        },
        colorClasse : {
            Death_Knight : "#C41F3B",
            Druide : "#FF7D0A",
            Chasseur : "#ABD473",
            Mage : "#69CCF0",
            Moine : "#00FF96",
            Paladin : "#F58CBA",
            Prêtre : "#FFFFFF",
            Voleur : "#FFF569",
            Chaman : "#0070DE",
            Démoniste : "#9482C9",
            Guerrier : "#C79C6E"
        },
        
        chosenClass : "",

        tab_sets : ['Tous', 'Expert' , 'La Malédiction de Naxxramas', 'Gobelins et Gnomes', 'Mont Rochenoire'],

        /**
         * @param {Object} p_params
         * @param p_params.attr
         * @returns {$.Oda.App}
         */
        startApp: function (p_params) {
            try {
                $.Oda.Context.projectLabel = "ODA HOW";

                $.Oda.Router.addDependencies("wowhead", {
                    ordered : false,
                    "list" : [
                        { "elt" : "http://wowjs.zamimg.com/widgets/power.js", "type" : "script"}
                    ]
                });

                $.Oda.Router.addRoute("home", {
                    "path" : "partials/home.html",
                    "title" : "oda-main.home-title",
                    "urls" : ["","home"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("saisir_paquet", {
                    "path" : "partials/paquet-add.html",
                    "title" : "paquet-add.title",
                    "urls" : ["saisir_paquet"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("rapports_cartes", {
                    "path" : "partials/rapports_cartes.html",
                    "title" : "rapports-cartes.title",
                    "urls" : ["rapports_cartes"],
                    "dependencies" : ["dataTables","hightcharts","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("gerer_collection", {
                    "path" : "partials/gerer_collection.html",
                    "title" : "gerer-coll.title",
                    "urls" : ["gerer_collection"],
                    "dependencies" : ["dataTables","wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("gerer_deck", {
                    "path" : "partials/gerer_deck.html",
                    "title" : "gerer-deck.title",
                    "urls" : ["gerer_deck"],
                    "dependencies" : ["dataTables", "hightcharts", "wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("saisir_matchs", {
                    "path" : "partials/rec_matchs.html",
                    "title" : "rec-matchs.title",
                    "urls" : ["saisir_matchs"],
                    "dependencies" : ["dataTables", "hightcharts", "wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("rapports_matchs", {
                    "path" : "partials/rapports_matchs.html",
                    "title" : "rapports-matchs.title",
                    "urls" : ["rapports_matchs"],
                    "dependencies" : ["dataTables", "hightcharts", "wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.addRoute("rapports_meta", {
                    "path" : "partials/rapports_meta.html",
                    "title" : "rapports-meta.title",
                    "urls" : ["rapports_meta"],
                    "dependencies" : ["dataTables", "hightcharts", "wowhead"],
                    "middleWares":["support","auth"]
                });

                $.Oda.Router.startRooter();

                return this;
            } catch (er) {
                $.Oda.Log.error("$.Oda.App.startApp : " + er.message);
                return null;
            }
        },

        Controler : {
            GererDeck : {
                /**
                 * @param {Object} p_params
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                start: function (p_params) {
                    try {
                        $.Oda.App.Controler.GererDeck.loadListDeck();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                loadListDeck: function (p_params) {
                    try {
                        $.Oda.Display.loading({elt : $("#listDeckContent")});

                        var tabSetting = { functionRetour : function(p_retour){
                            var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="display hover" id="table_listDeck" style="width: 100%"></table>';
                            $("#listDeckContent").html(strhtml);

                            var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(p_retour.data.listDeck.data);
                            var oTable = $('#table_listDeck').dataTable( {
                                "sPaginationType": "full_numbers",
                                "iDisplayLength": 20,
                                "aaData": objDataTable.data,
                                "aaSorting": [[5,'desc'],[2,'desc']],
                                "aoColumns": [
                                    { sTitle: "Nom"},
                                    { sTitle: "Classe"},
                                    { sTitle: "Quote"},
                                    { sTitle: "Type"},
                                    { sTitle: "Date", sClass: "dataTableColCenter", "sWidth": "175px"},
                                    { sTitle: "Actif", sClass: "dataTableColCenter"},
                                    { sTitle: "Action", sClass: "dataTableColCenter"}
                                ],
                                aoColumnDefs: [
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<a href="javascript:$.Oda.App.Controler.GererDeck.seeDeck({id:\''+row[objDataTable.entete["id"]]+'\'});">'+row[objDataTable.entete["nom_deck"]]+'</a>';
                                            return strHtml;
                                        },
                                        aTargets: [ 0 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[objDataTable.entete["classe"]];
                                            return strHtml;
                                        },
                                        aTargets: [ 1 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var quote = parseInt(row[objDataTable.entete["quote"]]);
                                            if ( type === 'display' ) {
                                                return quote+"%";
                                            }
                                            return quote;
                                        },
                                        aTargets: [ 2 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[objDataTable.entete["type"]];
                                            return strHtml;
                                        },
                                        aTargets: [ 3 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[objDataTable.entete["date"]];
                                            return strHtml;
                                        },
                                        aTargets: [ 4 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = row[objDataTable.entete["actif"]];
                                            return strHtml;
                                        },
                                        aTargets: [ 5 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<a href="javascript:$.Oda.App.Controler.GererDeck.seeDeck({id:\''+row[objDataTable.entete["id"]]+'\'});" class="btn btn-xs"><span class="glyphicon glyphicon-eye-open"></span></a>';
                                            strHtml += '<a href="javascript:$.Oda.App.Controler.GererDeck.editDeck({id:\''+row[objDataTable.entete["id"]]+'\', name : \''+row[objDataTable.entete["nom_deck"]]+'\'});" class="btn btn-xs"><span class="glyphicon glyphicon-pencil"></span></a>';
                                            return strHtml;
                                        },
                                        aTargets: [ 6 ]
                                    }
                                ],
                                "fnDrawCallback": function( oSettings ) {
                                    $('#table_listDeck')
                                        .removeClass( 'display' )
                                        .addClass('table table-striped table-bordered');
                                }
                            });
                        }};
                        var tabInput = { code_user : $.Oda.Session.code_user, option_actif : "", type : "" };
                        $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getListDeck.php", tabSetting, tabInput);

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.loadListDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @param p_params.name
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                editDeck: function (p_params) {
                    try {
                        var strHtmlDetails = $.Oda.Display.TemplateHtml.create({
                            template : "deck-list",
                            scope : {}
                        });

                        $.Oda.App.Controler.GererDeck.editTheDeck({id : p_params.id});

                        $.Oda.Display.Popup.open({size : "lg", label : '<span oda-label="gerer-deck.detailsDeck"></span> : '+p_params.name, details : strHtmlDetails});
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.editDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                newDeck: function (p_params) {
                    try {
                        $.Oda.Scope.refresh = function(){
                            if(($("#deckName").data("isOk")) && ($("#deckCmt").data("isOk")) && ($("#deckClass").data("isOk")) && ($("#deckType").data("isOk"))){
                                $("#bt_valider").removeClass("disabled");
                            }else{
                                $("#bt_valider").addClass("disabled");
                            }
                        };

                        var strHtmlDetails = $.Oda.Display.TemplateHtml.create({
                            template : "deck-new",
                            scope : {}
                        });

                        var strHtmlFooter = '';
                        strHtmlFooter += '<button type="button" onclick="$.Oda.App.Controler.GererDeck.recNewDeck();" class="btn btn-primary disabled" oda-submit="bt_valider"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-submit')+'</button>';
                        strHtmlFooter += '<a href="javascript:$.Oda.Display.Popup.close();" class="btn btn-default" id="bt_annuler_user"><span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-cancel')+'</a>';

                        $.Oda.Display.Popup.open({size : "lg", label : '<span oda-label="gerer-deck.newDeck"></span>', details : strHtmlDetails, footer : strHtmlFooter});

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.newDeck : " + er.message);
                        return null;
                    }
                },

                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                editTheDeck: function (p_params) {
                    try {
                        if((p_params.hasOwnProperty("id"))&&(p_params.id !== 0)){
                            var tabInput = { id_deck : p_params.id, code_user : $.Oda.Session.code_user };
                            var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getDeckDetails.php", {functionRetour : function(json_retour){
                                var nb_carte = parseInt(json_retour.data.nb_carte_in_deck);
                                if(nb_carte < 30){
                                    $.Oda.App.Controler.GererDeck.loadCards({idDeck :  p_params.id, type : json_retour.data.deck_header.type});
                                }else{
                                    $('#div_inventaire').html("Plus d'ajout possible.");
                                }

                                var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="display hover" style="width: 100%" id="table_deckList"></table>';
                                $('#div_paquet').html(strhtml);

                                var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(json_retour.data.resultat.data);
                                var oTable = $('#table_deckList').dataTable( {
                                    "sPaginationType": "full_numbers",
                                    "aaData": objDataTable.data,
                                    "aaSorting": [[2,'asc']],
                                    "bPaginate": false,
                                    "iDisplayLength": 50,
                                    "aoColumns": [
                                        { sTitle: "Nombre", sClass: "dataTableColCenter", sWidth: "30px" },
                                        { sTitle: "Nom", sClass: "left" },
                                        { sTitle: "Mana", sClass: "dataTableColCenter", sWidth: "30px" },
                                        { sTitle: "Action", sClass: "dataTableColCenter", sWidth: "30px" }
                                    ],
                                    aoColumnDefs: [
                                        {
                                            mRender: function ( data, type, row ) {
                                                var strHtml = row[objDataTable.entete["nb"]];
                                                return strHtml;
                                            },
                                            aTargets: [ 0 ]
                                        }, {
                                            mRender: function ( data, type, row ) {
                                                var dore = "";
                                                if(row[objDataTable.entete["gold"]] == "1"){
                                                    dore = "&amp;premium";
                                                }
                                                var strHtml = '<a href="http://www.wowhead.com/hearthstone/card='+row[objDataTable.entete["id_link"]]+dore+'" style="color: '+ $.Oda.App.colorCard[row[objDataTable.entete["qualite"]]]+';text-decoration: none">'+row[objDataTable.entete["nom_carte"]]+'</a>';
                                                return strHtml;
                                            },
                                            aTargets: [ 1 ]
                                        }, {
                                            mRender: function ( data, type, row ) {
                                                var strHtml = row[objDataTable.entete["cout"]];
                                                return strHtml;
                                            },
                                            aTargets: [ 2 ]
                                        }, {
                                            mRender: function ( data, type, row ) {
                                                var strHtml = '<a href="javascript:$.Oda.App.Controler.GererDeck.deckListDelete({idDeck : '+p_params.id+',nb : '+row[objDataTable.entete["nb"]]+', idCard : '+row[objDataTable.entete["max_id_collec"]]+'});" class="btn btn-xs"><span class="glyphicon glyphicon-remove"></span></a>';
                                                return strHtml;
                                            },
                                            aTargets: [ 3 ]
                                        }
                                    ],
                                    "fnDrawCallback": function( oSettings ) {
                                        $('#table_deckList')
                                            .removeClass( 'display' )
                                            .addClass('table table-striped table-bordered');
                                    }
                                });
                                $('#div_deckModifInfos').html('Nombre de carte dans le deck : '+json_retour.data.nb_carte_in_deck+'');
                                var datas = $.Oda.App.Controler.GererDeck.buildDatasForGraph(json_retour.data);

                                $('#div_graphCout').highcharts({
                                    chart: {
                                        type: 'column'
                                    },
                                    title: {
                                        text: 'La curve'
                                    },
                                    tooltip: {
                                        enabled : false
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    xAxis: {
                                        categories: datas.categories
                                    },
                                    yAxis: {
                                        gridLineColor: 'transparent',
                                        title: {
                                            enabled: false
                                        },
                                        labels: {
                                            enabled: false
                                        }
                                    },
                                    plotOptions : {
                                        column : {
                                            dataLabels : {
                                                enabled : true,
                                                formatter : function() {
                                                    if(this.x == "Total"){
                                                        return this.y*10;
                                                    }else{
                                                        return this.y;
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    series: datas.series
                                });

                                $('#div_graphRepart').highcharts({
                                    chart: {
                                        plotBackgroundColor: null,
                                        plotBorderWidth: null,
                                        plotShadow: false
                                    },
                                    title: {
                                        text: 'Type de carte'
                                    },
                                    tooltip: {
                                        pointFormat: 'Nombre : {point.y}: <br> Pourcentage : {point.percentage:.1f}%'
                                    },
                                    plotOptions: {
                                        pie: {
                                            allowPointSelect: true,
                                            cursor: 'pointer',
                                            dataLabels: {
                                                enabled: true,
                                                format: '{point.y} {point.name}(s)<br>{point.percentage:.1f}%',
                                                style: {
                                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                                }
                                            }
                                        }
                                    },
                                    series: [{
                                        type: 'pie',
                                        name: 'Type',
                                        data: datas.dataSeries
                                    }]
                                });
                            }}, tabInput);
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.editTheDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.idDeck
                 * @param p_params.type
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                loadCards: function (p_params) {
                    try {
                        var tabInput = { type : "arene", code_user : $.Oda.Session.code_user };
                        if(p_params.type === 'regular'){
                            tabInput.type = "collection";
                        }
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getCards.php", {functionRetour : function(json_retour){
                            var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="display hover" style="width: 100%" id="table_cards"></table>';
                            $('#div_inventaire').html(strhtml);

                            var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(json_retour.data.cartes.data);
                            var oTable = $('#table_cards').dataTable( {
                                "sPaginationType": "full_numbers",
                                "aaData": objDataTable.data,
                                "aaSorting": [[0,'asc']],
                                "aoColumns": [
                                    { sTitle: "Nom", sClass: "left"  },
                                    { sTitle: "Mana", sClass: "dataTableColCenter", sWidth: "30px" },
                                    { sTitle: "Action", sClass: "dataTableColCenter", sWidth: "30px" }
                                ],
                                aoColumnDefs: [
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<a href="http://www.wowhead.com/hearthstone/card='+row[objDataTable.entete["id_link"]]+'" style="color: '+$.Oda.App.colorCard[row[objDataTable.entete["qualite"]]]+';text-decoration: none">'+row[objDataTable.entete["nom"]]+'</a>';
                                            return strHtml;
                                        },
                                        aTargets: [ 0 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[9]);
                                            return strHtml;
                                        },
                                        aTargets: [ 1 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = '<a href="javascript:$.Oda.App.Controler.GererDeck.addToDeck({idDeck : '+p_params.idDeck+',idCard : '+row[objDataTable.entete["id"]]+', gold : 0});" class="btn btn-xs"><span class="glyphicon glyphicon-plus"></span></a>';
                                            return strHtml;
                                        },
                                        aTargets: [ 2 ]
                                    }
                                ],
                                "fnDrawCallback": function( oSettings ) {
                                    $('#table_cards')
                                        .removeClass( 'display' )
                                        .addClass('table table-striped table-bordered');
                                }
                            });
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.loadCards : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.idDeck
                 * @param p_params.idCard
                 * @param p_params.gold
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                addToDeck: function (p_params) {
                    try {
                        var tabInput = { id_deck : p_params.idDeck, code_user : $.Oda.Session.code_user, id_card : p_params.idCard, gold : p_params.gold};
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/deckEditionAdd.php", {functionRetour : function(data){
                            $.Oda.App.Controler.GererDeck.editTheDeck({id : p_params.idDeck});
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.addToDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.nb
                 * @param p_params.idDeck
                 * @param p_params.idCard
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                deckListDelete: function (p_params) {
                    try {
                        var tabInput = { id_deck : p_params.idDeck, id_card_in_deck : p_params.idCard, code_user : $.Oda.Session.code_user };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/deckEditionRemove.php", {functionRetour : function(data){
                            $.Oda.App.Controler.GererDeck.editTheDeck({id : p_params.idDeck});
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.deckListDelete : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                seeDeck: function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getHeaderDeck.php", {functionRetour : function(data){

                            var strHtmlDetails = $.Oda.Display.TemplateHtml.create({
                                template : "deck-details",
                                scope : {
                                    deckActif : data.data.resultat.actif,
                                    deckName : data.data.resultat.nom_deck,
                                    deckType : data.data.resultat.type,
                                    deckCmt : data.data.resultat.commentaire
                                }
                            });

                            var strHtmlFooter = '';
                            strHtmlFooter += '<button type="button" onclick="$.Oda.App.Controler.GererDeck.recHeaderDeck({deckId : '+p_params.id+', oldName : \''+data.data.resultat.nom_deck+'\'});" class="btn btn-primary disabled" oda-submit="bt_valider"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-submit')+'</button>';
                            strHtmlFooter += '<a href="javascript:$.Oda.Display.Popup.close();" class="btn btn-default" id="bt_annuler_user"><span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> '+ $.Oda.I8n.get('oda-main','bt-cancel')+'</a>';

                            $.Oda.Display.Popup.open({size : "lg", label : '<span oda-label="gerer-deck.detailsDeck"></span> : '+data.data.resultat.nom_deck, details : strHtmlDetails, footer : strHtmlFooter, callback : function(data){
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getDeckDetails.php", {functionRetour : function(data){
                                    var datas = $.Oda.App.Controler.GererDeck.buildDatasForGraph(data["data"]);

                                    $('#div_graphCout').highcharts({
                                        chart: {
                                            type: 'column'
                                        },
                                        title: {
                                            text: 'La curve'
                                        },
                                        tooltip: {
                                            enabled : false
                                        },
                                        exporting: {
                                            enabled: false
                                        },
                                        xAxis: {
                                            categories: datas.categories
                                        },
                                        yAxis: {
                                            gridLineColor: 'transparent',
                                            title: {
                                                enabled: false
                                            },
                                            labels: {
                                                enabled: false
                                            }
                                        },
                                        plotOptions : {
                                            column : {
                                                dataLabels : {
                                                    enabled : true,
                                                    formatter : function() {
                                                        if(this.x == "Total"){
                                                            return this.y*10;
                                                        }else{
                                                            return this.y;
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        series: datas.series
                                    });

                                    $('#div_graphRepart').highcharts({
                                        chart: {
                                            plotBackgroundColor: null,
                                            plotBorderWidth: null,
                                            plotShadow: false
                                        },
                                        title: {
                                            text: 'Type de carte'
                                        },
                                        tooltip: {
                                            pointFormat: 'Nombre : {point.y}: <br> Pourcentage : {point.percentage:.1f}%'
                                        },
                                        plotOptions: {
                                            pie: {
                                                allowPointSelect: true,
                                                cursor: 'pointer',
                                                dataLabels: {
                                                    enabled: true,
                                                    format: '{point.y} {point.name}(s)<br>{point.percentage:.1f}%',
                                                    style: {
                                                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                                    }
                                                }
                                            }
                                        },
                                        series: [{
                                            type: 'pie',
                                            name: 'Type',
                                            data: datas.dataSeries
                                        }]
                                    });
                                }}, {id_deck : p_params.id, code_user : $.Oda.Session.code_user});
                            }});

                            $.Oda.Scope.refresh = function(){
                                if(($("#deckName").data("isOk")) && ($("#deckCmt").data("isOk"))){
                                    $("#bt_valider").removeClass("disabled");
                                }else{
                                    $("#bt_valider").addClass("disabled");
                                }
                            };
                        }}, { id_deck : p_params.id });

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.seeDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                recNewDeck: function (p_params) {
                    try {
                        var input_actif = $('#deckActif').val();
                        var input_nom = $('#deckName').val();
                        var input_type = $('#deckType').val();

                        var tabInput = { code_user : $.Oda.Session.code_user, nomDeck : input_nom };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/checkNomDeck.php", {functionRetour : function(json_retour){
                            if(json_retour["data"]["resultat"]["exists"] !== "0"){
                                $.Oda.Display.Notification.warning( "Nom du deck déjà existant.");
                            }else{
                                var tabInput = {
                                    nom_deck : input_nom,
                                    type : input_type,
                                    classe : $('#deckClass').val(),
                                    code_user : $.Oda.Session.code_user
                                };
                                var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/validerDeck.php", {functionRetour : function(json_retour){
                                    $.Oda.App.Controler.GererDeck.loadListDeck();
                                    $.Oda.Display.Popup.close();
                                    $.Oda.Display.Notification.success( "Création réussi.");
                                }}, tabInput);
                            }
                        }}, tabInput);

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.recNewDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @param p_params.oldName
                 * @returns {$.Oda.App.Controler.GererDeck}
                 */
                recHeaderDeck: function (p_params) {
                    try {
                        var input_actif = $('#deckActif').val();
                        var input_nom = $('#deckName').val();
                        var input_type = $('#deckType').val();
                        var input_cmt = $('#deckCmt').val();

                        if(input_nom !== ""){
                            if(p_params.oldName !== input_nom){
                                var tabInput = { code_user : $.Oda.Session.code_user, nomDeck : input_nom };
                                var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/checkNomDeck.php", { context : {idDeck : p_params.deckId}, functionRetour : function(json_retour){
                                    if(json_retour["data"]["resultat"]["exists"] !== "0"){
                                        $.Oda.Display.Notification.warning( "Nom du deck déjà existant.");
                                    }else{
                                        var tabInput = {
                                            id_deck : json_retour.context.idDeck,
                                            input_actif : (input_actif === "on")?1:0,
                                            input_nom : input_nom,
                                            input_type : input_type,
                                            input_cmt : input_cmt
                                        };
                                        var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/setHeaderDeck.php", {functionRetour : function(json_retour){
                                            $.Oda.App.Controler.GererDeck.loadListDeck();
                                            $.Oda.Display.Popup.close();
                                            $.Oda.Display.Notification.success( "Mise &agrave; jour r&eacute;ussi.");
                                        }}, tabInput);
                                    }
                                }}, tabInput);
                            }else{
                                var tabInput = {
                                    id_deck : p_params.deckId,
                                    input_actif : (input_actif === "on")?1:0,
                                    input_nom : '',
                                    input_type : input_type,
                                    input_cmt : input_cmt
                                };
                                var json_retour = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/setHeaderDeck.php", {functionRetour : function(json_retour){
                                    $.Oda.App.Controler.GererDeck.loadListDeck();
                                    $.Oda.Display.Popup.close();
                                    $.Oda.Display.Notification.success( "Mise &agrave; jour r&eacute;ussi.");
                                }}, tabInput);
                            }
                        }else{
                            $.Oda.Display.Notification.warning( "Nom du deck vide.");
                        }
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.GererDeck.recHeaderDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @name buildDatasForGraph
                 * @param {type} p_datas
                 * @returns {buildDatasForGraph.obj}
                 */
                 buildDatasForGraph : function(p_datas){
                    try {
                        var obj = {categories : ["0", "1", "2", "3", "4", "5", "6", "7+", "Total"], series : [] };

                        var data = { name : "Coût", color: '#0040FF'};
                        var array = [];
                        for (var indice in p_datas["coutRepartition"]["data"]) {
                            array[array.length] = parseInt(p_datas["coutRepartition"]["data"][indice]["nb"]);
                        }
                        array[array.length] = parseInt(p_datas["coutSum"])/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var data = { name : "Vie", color: '#BA1F1F'};
                        var array = [];
                        for (var indice in p_datas.vieRepartition.data) {
                            array[array.length] = parseInt(p_datas.vieRepartition.data[indice].nb);
                        }
                        array[array.length] = parseInt(p_datas.vieSum)/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var data = { name : "Attaque", color: '#D8E524'};
                        var array = [];
                        for (var indice in p_datas.attaqueRepartition.data) {
                            array[array.length] = parseInt(p_datas.attaqueRepartition.data[indice].nb);
                        }
                        array[array.length] = parseInt(p_datas["attaqueSum"])/10;
                        data.data = array;
                        obj.series[obj.series.length] = data;

                        var array = [];
                        for (var indice in p_datas["reparType"]["data"]) {
                            var data = { name : "", y : 0};
                            data.name = p_datas["reparType"]["data"][indice]["type"];
                            data.y = parseInt(p_datas["reparType"]["data"][indice]["nb"]);
                            array[array.length] = data;
                        }
                        obj.dataSeries = array;

                        return obj;
                    } catch (er) {
                        $.Oda.Log.error("buildSimpleSeriesForSimpleColumn :" + er.message);
                    }
                }
            },
            RecMatchs : {
                oTableListMatchs : null,
                advName : null,
                deckName : null,
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                start : function (p_params) {
                    try {
                        $.Oda.App.Controler.RecMatchs.getMatch();
                        $.Oda.App.Controler.RecMatchs.histoMatchs();
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                getMatch : function (p_params) {
                    try {
                        if($.Oda.Tooling.isUndefined(p_params)){
                            p_params = {
                                id : 0
                            };
                        }
                        var tabInput = { id_match : p_params.id, code_user : $.Oda.Session.code_user };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getMatch.php", {functionRetour : function(p_retour){
                            if(typeof p_retour.data.match.id != "undefined"){
                                $.Oda.App.Controler.RecMatchs.advName = p_retour.data.match.nom_adversaire;
                                $.Oda.App.Controler.RecMatchs.deckName = p_retour.data.match.nom_deck;
                                $.Oda.App.Controler.RecMatchs.seeMatch({id : p_retour.data.match.id});
                            }else{
                                $.Oda.App.Controler.RecMatchs.newMatch();
                            }
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.getMatch : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                newMatch : function (p_params) {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "recMatchNew",
                            scope : {

                            }
                        });
                        $('#content-recMatchs').html(strHtml);
                        $.Oda.Scope.init({id:'content-recMatchs'});
                        $.Oda.Scope.refresh = function(){
                            if(($("#matchType").data("isOk")) && ($("#matchNameAdv").data("isOk")) && ($("#matchClass").data("isOk")) && ($("#input_deck").data("isOk")) ){
                                $("#bt_valider").removeClass("disabled");
                            }else{
                                $("#bt_valider").addClass("disabled");
                            }
                        };
                        $('#matchType').on('change', function (event) {
                            var optionSelected = $("option:selected", this);
                            var valueSelected = this.value;
                            $.Oda.App.Controler.RecMatchs.chargerListDeck({optionSelected : optionSelected, valueSelected : valueSelected});
                        });
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.newMatch : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.optionSelected
                 * @param p_params.valueSelected
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                chargerListDeck : function (p_params) {
                    try {
                        var type = "";
                        switch (p_params.valueSelected)
                        {
                            case "Classé":
                            case "Non classé":
                                type = "regular";
                                break;
                            case "Arène":
                                type = "arene";
                                break;
                        }

                        var tabInput = { code_user : $.Oda.Session.code_user, option_actif : 1, type :  type, typeMatch : p_params.valueSelected};
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getListDeck.php", { odaCacheOnDemande : true, functionRetour : function(json_retour){
                            var strHtml = '<div class="form-group"><label for="input_deck" class="select">Deck choisi :</label>';
                            strHtml += '<select class="form-control" oda-input-select="input_deck" required>';
                            strHtml += '<option value="" oda-label="oda-main.select-default"></option>';
                            for (var indice in json_retour.data.listDeck.data) {
                                strHtml += '<option value="'+json_retour.data.listDeck.data[indice].id+'">'+json_retour.data.listDeck.data[indice].classe+' - '+json_retour.data.listDeck.data[indice].nom_deck+' ('+json_retour.data.listDeck.data[indice].quote+'%)</option>';
                            }
                            strHtml += '</select></div>';
                            $.Oda.Display.render({id:'div_nom_deck', html : strHtml});
                            $('#input_deck').on('change', function (event) {
                                var optionSelected = $("option:selected", this);
                                var valueSelected = this.value;
                                $.Oda.App.Controler.RecMatchs.deckName = optionSelected;
                            });
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.chargerListDeck : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {Object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                recNewMatch : function (p_params) {
                    try {
                        $.Oda.App.Controler.RecMatchs.idDeck = $('#input_deck').val();
                        var type = $('#matchType').val();
                        $.Oda.App.Controler.RecMatchs.advName = $('#matchNameAdv').val();
                        var input_coin = $('#matchCoin').val();
                        var classe_adv = $('#matchClass').val();

                        var tabInput = { id_deck : $.Oda.App.Controler.RecMatchs.idDeck, type : type, nom_adv : $.Oda.App.Controler.RecMatchs.advName, classe_adv : classe_adv, code_user : $.Oda.Session.code_user, coin : input_coin };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/creerMatch.php", {functionRetour : function(json_retour){
                            $('#content-recMatchs').html("");
                            $.Oda.App.Controler.RecMatchs.getMatch({id:json_retour.data.resultatInsert});
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.recNewMatch : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                seeMatch: function (p_params) {
                    try {
                        var strHtml = $.Oda.Display.TemplateHtml.create({
                            template : "seeMatchNew",
                            scope : {
                                idMatch : p_params.id,
                                deckName : $.Oda.App.Controler.RecMatchs.deckName,
                                advName : $.Oda.App.Controler.RecMatchs.advName
                            }
                        });
                        $('#content-recMatchs').html(strHtml);
                        $.Oda.Scope.init({id:'content-recMatchs'});
                        $.Oda.Scope.refresh = function(){
                            if(($("#leftLive").data("isOk")) && ($("#advType").data("isOk")) && ($("#myRank").data("isOk")) && ($("#advRank").data("isOk")) ){
                                $("#bt_valider").removeClass("disabled");
                            }else{
                                $("#bt_valider").addClass("disabled");
                            }
                        };
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.seeMatch : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                updateNewMatch: function (p_params) {
                    try {
                        var leftLive = $('#leftLive').val();
                        var typeAdv = $('#advType').val();
                        var myRank = $('#myRank').val();
                        var advRank = $('#advRank').val();
                        var tabInput = { id_match : p_params.id, vie : leftLive, type_adversaire : typeAdv, code_user : $.Oda.Session.code_user, my_rang : myRank, adv_rang : advRank };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/finirMatch.php", {functionRetour : function(){
                            $('#content-recMatchs').html("");
                            $.Oda.App.Controler.RecMatchs.getMatch();
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.updateNewMatch.updateNewMatch : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.onDemande
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                histoMatchs: function (p_params) {
                    try {
                        if($.Oda.Tooling.isUndefined(p_params)){
                            p_params = {onDemande : false};
                        }

                        var tabInput = { code_user : $.Oda.Session.code_user };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getMatchs.php", {odaCacheOnDemande : p_params.onDemande, functionRetour : function(p_retour){
                            var strhtml = '<table cellpadding="0" cellspacing="0" border="0" class="display hover" id="table_matchs" width="100%"></table>';
                            $('#content-histoMatchs').html(strhtml);

                            var objDataTable = $.Oda.Tooling.objDataTableFromJsonArray(p_retour.data.matchs.data);
                            $.Oda.App.Controler.RecMatchs.oTableListMatchs = $('#table_matchs').dataTable( {
                                "sPaginationType": "full_numbers",
                                "aaData": objDataTable.data,
                                "aaSorting": [[0,'desc']],
                                "aoColumns": [
                                    { sTitle: "Date", sClass: "left", sWidth : 180},
                                    { sTitle: "Type match", sClass: "left"},
                                    { sTitle: "Pièce", sClass: "left"},
                                    { sTitle: "Mon deck", sClass: "left"  },
                                    { sTitle: "Ma classe", sClass: "left"  },
                                    { sTitle: "Adversaire", sClass: "left"  },
                                    { sTitle: "Classe adver", sClass: "left"},
                                    { sTitle: "Ma vie", sClass: "left"},
                                    { sTitle: "Durée", sClass: "left"}
                                ],
                                aoColumnDefs: [
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["date_start"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 0 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["type"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 1 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["coin"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 2 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["nom_deck"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 3 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["ma_classe"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 4 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["nom_adversaire"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 5 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["classe_adversaire"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 6 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["vie"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 7 ]
                                    },
                                    {
                                        mRender: function ( data, type, row ) {
                                            var strHtml = String(row[objDataTable.entete["duree"]]);
                                            return strHtml;
                                        },
                                        aTargets: [ 8 ]
                                    }
                                ],
                                "fnDrawCallback": function( oSettings ) {
                                    $('#table_matchs')
                                        .removeClass( 'display' )
                                        .addClass('table table-striped table-bordered');
                                }
                            });
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.histoMatchs : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.name
                 * @returns {$.Oda.App.Controler.RecMatchs}
                 */
                filterByAdv: function (p_params) {
                    try {
                        $.Oda.App.Controler.RecMatchs.oTableListMatchs.fnFilter( p_params.name );
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RecMatchs.filterByAdv : " + er.message);
                        return null;
                    }
                },
            },
            RapportsMatchs : {
                setting : {},
                /**
                 * @param {object} p_params
                 * @param p_params.filter
                 * @returns {$.Oda.App.Controler.RapportsMatchs}
                 */
                start: function (p_params) {
                    try {
                        if($.Oda.Tooling.isUndefined(p_params)){
                            $.Oda.App.Controler.RapportsMatchs.setting = $.Oda.Storage.get("RAPPORTS-MATCHS-"+ $.Oda.Session.code_user, {filter : "all"});
                        }else{
                            if(p_params.hasOwnProperty("filter")){
                                $.Oda.App.Controler.RapportsMatchs.setting.filter = p_params.filter;
                                $.Oda.Storage.set("RAPPORTS-MATCHS-"+ $.Oda.Session.code_user, $.Oda.App.Controler.RapportsMatchs.setting);
                            }
                        }

                        $('[id^="li-"]').each(function(index, value){
                            var elt = $(value);
                            if(elt.attr('id') === ('li-'+$.Oda.App.Controler.RapportsMatchs.setting.filter)){
                                elt.addClass("active");
                            }else{
                                elt.removeClass("active");
                            }
                        });

                        $.Oda.App.Controler.RecMatchs.histoMatchs({onDemande : true});
                        $.Oda.App.Controler.RapportsMatchs.chargerDureesMatchs();
                        $.Oda.App.Controler.RapportsMatchs.chargerEvolRatioMatchs();

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RapportsMatchs.start : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RapportsMatchs}
                 */
                chargerDureesMatchs: function (p_params) {
                    try {
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getRepartitionDureeMatchs.php", {odaCacheOnDemande : true, functionRetour : function(p_retour){
                            var categories = new Array();
                            categories = $.Oda.Tooling.getListValeurPourAttribut(p_retour.data.resultat.data,"minutes");

                            var serie = new Array();
                            serie = $.Oda.Tooling.getListValeurPourAttribut(p_retour.data.resultat.data,"nb","int");

                            var series = [{name:$.Oda.Session.code_user, data:serie}];

                            var retour = $('#div_dureesMatchs').highcharts({
                                chart: {
                                    backgroundColor:'rgba(255, 255, 255, 0.1)',
                                    type: 'column'
                                },
                                title: {
                                    text: 'Répartition de la durée des matchs (sur 6 mois)'
                                },
                                xAxis: {
                                    categories: categories
                                },
                                tooltip: {
                                    headerFormat: '<span style="font-size:10px">Nombre de match de {point.key} minute(s) </span>',
                                    pointFormat: '<span style="font-size:10px">pour {series.name} => {point.y}</span>',
                                    footerFormat: '<span style="font-size:10px">.</span>',
                                    shared: true,
                                    useHTML: true
                                },
                                series: series
                            });
                        }}, {code_user : $.Oda.Session.code_user});

                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RapportsMatchs.chargerDureesMatchs : " + er.message);
                        return null;
                    }
                },
                /**
                 * @param {object} p_params
                 * @param p_params.id
                 * @returns {$.Oda.App.Controler.RapportsMatchs}
                 */
                chargerEvolRatioMatchs: function (p_params) {
                    try {
                        var currentTime = new Date();
                        currentTime.setDate(currentTime.getDate() - 90);

                        var annee = currentTime.getFullYear();
                        var mois = $.Oda.Tooling.pad2(currentTime.getMonth()+1);
                        var jour = $.Oda.Tooling.pad2(currentTime.getDate());

                        var strDate = annee+"-"+mois+"-"+jour;

                        var tabInput = { code_user : $.Oda.Session.code_user,
                            dateDebut : strDate,
                            filtre_nonClasse : (($.Oda.App.Controler.RapportsMatchs.setting.filter === "nonClasse")||($.Oda.App.Controler.RapportsMatchs.setting.filter === "all"))?true:false,
                            filtre_classe : (($.Oda.App.Controler.RapportsMatchs.setting.filter === "classe")||($.Oda.App.Controler.RapportsMatchs.setting.filter === "all"))?true:false,
                            filtre_arene : (($.Oda.App.Controler.RapportsMatchs.setting.filter === "arene")||($.Oda.App.Controler.RapportsMatchs.setting.filter === "all"))?true:false
                        };
                        var call = $.Oda.Interface.callRest($.Oda.Context.rest+"phpsql/getEvolRatioMatchs.php", {odaCacheOnDemande : true, functionRetour : function(json_retour){
                            var dbDatas = json_retour.data.evolRatioMatchs.data;
                            var datas = new Array();
                            for (var indice in dbDatas) {
                                datas[datas.length] = {
                                    y : parseFloat(dbDatas[indice]["ratio"]),
                                    name : $.Oda.Date.getStrDateFrFromUs(dbDatas[indice]["date"]) + " : " + dbDatas[indice]["win"] + "/" + dbDatas[indice]["total"] +  " (" + $.Oda.Tooling.arrondir(parseInt(dbDatas[indice]["win"])/parseInt(dbDatas[indice]["total"])*100,2)+ "%)"
                                };
                            }

                            // Create the chart
                            $('#div_evolRatioMatchs').highcharts({
                                chart: {
                                    type: 'spline',
                                    backgroundColor:'rgba(255, 255, 255, 0.1)'
                                },
                                title: {
                                    text: 'Ratio sur le temps'
                                },
                                subtitle: {
                                    text: 'Score de victoire'
                                },
                                legend:{
                                    enabled: false
                                },
                                xAxis:{
                                    labels:
                                    {
                                        enabled: false
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: ''
                                    },
                                    min: 0,
                                    max: 800,
                                    minorGridLineWidth: 0,
                                    gridLineWidth: 0,
                                    alternateGridColor: null,
                                    plotBands: [{ // Light air
                                        from: 0,
                                        to: 150,
                                        color: 'rgba(223, 58, 1, 0.1)',
                                        label: {
                                            text: 'Mauvais',
                                            style: {
                                                color: '#606060'
                                            }
                                        }
                                    }, { // Light breeze
                                        from: 150,
                                        to: 300,
                                        color: 'rgba(0, 128, 255, 0.1)',
                                        label: {
                                            text: 'Bon',
                                            style: {
                                                color: '#606060'
                                            }
                                        }
                                    }, { // Gentle breeze
                                        from: 300,
                                        to: 800,
                                        color: 'rgba(1, 223, 1, 0.1)',
                                        label: {
                                            text: 'Excellent',
                                            style: {
                                                color: '#606060'
                                            }
                                        }
                                    }]
                                },
                                tooltip: {
                                    valueSuffix: ''
                                },
                                plotOptions: {
                                    spline: {
                                        lineWidth: 4,
                                        states: {
                                            hover: {
                                                lineWidth: 5
                                            }
                                        },
                                        marker: {
                                            enabled: false
                                        }
                                    }
                                },
                                series: [{
                                    name: 'Score',
                                    data: datas

                                }]
                            });
                        }}, tabInput);
                        return this;
                    } catch (er) {
                        $.Oda.Log.error("$.Oda.App.Controler.RapportsMatchs.chargerEvolRatioMatchs : " + er.message);
                        return null;
                    }
                },
            }
        }
    };

    // Initialize
    _init();

})();
