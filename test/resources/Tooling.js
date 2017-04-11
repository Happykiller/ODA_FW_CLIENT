QUnit.module( "Tooling" );

QUnit.test( "$.Oda.Tooling.arrondir", function(assert) {
    assert.equal($.Oda.Tooling.arrondir(10.42, 1), 10.4, "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.clearSlashes", function(assert) {
    assert.equal($.Oda.Tooling.clearSlashes("Hello/"), "Hello", "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.clone", function(assert) {
    var obj = {attr1 : "value1", attr2 : "value2"};
    var obj2 = $.Oda.Tooling.clone(obj);
    assert.deepEqual(obj2, {attr1 : "value1", attr2 : "value2"}, "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.deepEqual", function(assert) {
    assert.ok($.Oda.Tooling.deepEqual([1,2],[1,2]), "Test OK : Passed!" );

    assert.ok($.Oda.Tooling.deepEqual({attr1 : "value1", attr2 : "value2"},{attr1 : "value1", attr2 : "value2"}), "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.pad2", function(assert){
    assert.equal( $.Oda.Tooling.pad2("03"), "03", "Test OK : Passed!" );
    assert.equal( $.Oda.Tooling.pad2(3), "03", "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.replaceAll", function(assert){
    assert.throws(
        $.Oda.Tooling.replaceAll({str: "str",find: "",by: "by"}),
        'Parameter "find" for by:"by" is missing in params of $.Oda.Tooling.replaceAll'
    );

    var strOri = 'ceci est un test pour un test pour faire un test';
    var strWait = 'ceci est deux test pour deux test pour faire deux test';
    assert.equal( $.Oda.Tooling.replaceAll({
        str: strOri,
        find: "un",
        by: "deux"
    }), strWait, "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.TemplateHtml", function(assert){

    var script = document.createElement("script");
    script.type = "text/template";
    script.id = "test";
    script.text = '<b>{{hello}}</b>';
    document.body.appendChild(script);

    var recieve = $.Oda.Display.TemplateHtml.create({
        template: "test",
        scope: {
            hello: 'bonjour'
        }
    });

    var attempt = '<b>bonjour</b>';

    assert.equal( attempt, recieve, "Test OK : Passed!" );

    //-------------------------------------------------------

    var script = document.createElement("script");
    script.type = "text/template";
    script.id = "test1";
    script.text = '<b>hello</b>';
    document.body.appendChild(script);

    var recieve = $.Oda.Display.TemplateHtml.create({
        template: "test1"
    });

    var attempt = '<b>hello</b>';

    assert.equal( attempt, recieve, "Test OK : Passed!" );

    //-------------------------------------------------------

    var script = document.createElement("script");
    script.type = "text/template";
    script.id = "test2";
    script.text = '<b>hello</b>';
    document.body.appendChild(script);

    var recieve = $.Oda.Display.TemplateHtml.create({
        template: "test2",
        scope: {}
    });

    var attempt = '<b>hello</b>';

    assert.equal( attempt, recieve, "Test OK : Passed!" );

    //-------------------------------------------------------

    var script = document.createElement("script");
    script.type = "text/template";
    script.id = "test3";
    script.text = '<b>{{hello}}</b>';
    document.body.appendChild(script);

    var recieve = $.Oda.Display.TemplateHtml.create({
        template: "test3"
    });

    var attempt = '<b>{{hello}}</b>';

    assert.equal( attempt, recieve, "Test OK : Passed!" );

    //-------------------------------------------------------

    var script = document.createElement("script");
    script.type = "text/template";
    script.id = "test4";
    script.text = '<b>{{hello}}</b>';
    document.body.appendChild(script);

    var recieve = $.Oda.Display.TemplateHtml.create({
        template: "test4",
        scope: {}
    });

    var attempt = '<b>null</b>';

    assert.equal( attempt, recieve, "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.filter", function(assert ) {
    var inputs = [1, 2, 3];

    assert.deepEqual($.Oda.Tooling.filter({src: inputs, condition: function(elt){return elt > 1;}}), [2, 3], "$.Oda.Tooling.filter with array of value" );

    var inputs = [{age: 11}, {age: 12}, {age: 13}];

    assert.deepEqual($.Oda.Tooling.filter({src: inputs, condition: function(elt){return elt.age > 11;}}), [{age: 12}, {age: 13}], "$.Oda.Tooling.filter with array of object" );

    assert.equal($.Oda.Tooling.filter({src: "truc", condition: function(elt){return true;}}), null, "$.Oda.Tooling.filter with no array" );

    var inputs = [{age: 11, filter: true}, {age: 12, filter: false}, {age: 13, filter: false}];
    assert.equal($.Oda.Tooling.filter({src: inputs, condition: "truc"}), null, "$.Oda.Tooling.filter with attribute in condition but not an object" );

    assert.deepEqual($.Oda.Tooling.filter({src: inputs, condition: {filter: true}}), [{age: 11, filter: true}], "$.Oda.Tooling.filter with attribute in condition" );
});

QUnit.test( "$.Oda.Tooling.order", function(assert ) {
    var inputs = [1, 2, 3];

    assert.deepEqual(
        $.Oda.Tooling.order({
            collection: inputs, compare: function(elt1, elt2){
                if(elt1 < elt2){
                    return 1;
                }else if(elt1 > elt2){
                    return -1;
                }else{
                    return 0;
                }
            }
        }),
        [3,2,1],
        "$.Oda.Tooling.order with value"
    );

    var inputs = ["aa", "ba", "ca"];

    assert.deepEqual(
        $.Oda.Tooling.order({
            collection: inputs, compare: function(elt1, elt2){
                if(elt1 < elt2){
                    return 1;
                }else if(elt1 > elt2){
                    return -1;
                }else{
                    return 0;
                }
            }
        }),
        ["ca","ba","aa"],
        "$.Oda.Tooling.order with string"
    );

    var inputs = [{label:"a"},{label:"b"},{label:"b"},{label:"c"}];

    assert.deepEqual(
        $.Oda.Tooling.order({
            collection: inputs, compare: function(elt1, elt2){
                if(elt1.label < elt2.label){
                    return 1;
                }else if(elt1.label > elt2.label){
                    return -1;
                }else{
                    return 0;
                }
            }
        }),
        [{label:"c"},{label:"b"},{label:"b"},{label:"a"}],
        "$.Oda.Tooling.order with object"
    );
});

QUnit.test( "$.Oda.Tooling.merge", function(assert) {
    assert.equal(
        $.Oda.Tooling.merge({default: "4", source: "5"}),
        "5",
        "$.Oda.Tooling.merge 1"
    );

    assert.equal(
        $.Oda.Tooling.merge({default: 4, source: null}),
        4,
        "$.Oda.Tooling.merge 2"
    );

    var objDefault = [];

    var objInput = [];

    var expected = [];

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 3"
    );

    var objDefault = [];

    var objInput = [1,2];

    var expected = [1,2];

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 4"
    );

    var objDefault = [0];

    var objInput = [1,2];

    var expected = [1,2];

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 5"
    );

    var objDefault = {
        a: 2,
        b: 3
    };

    var objInput = {
        a: 1
    };

    var expected = {
        a: 1,
        b: 3
    }

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 6"
    );

    var objDefault = {
        a : 1,
        b : 2,
        c : {
            ca : 1,
            cb : null,
            cc : {
                cca : 100,
                ccb : 200
            }
        },
        d : null
    };

    var objInput = {
        a : 10,
        c : {
            ca : 10,
            cc : {
                cca : 101,
                ccb : 202
            }
        },
        d : 42,
        e : "e"
    };

    var expected = {
        a : 10,
        b : 2,
        c : {
            ca : 10,
            cb : null,
            cc : {
                cca : 101,
                ccb : 202
            }
        },
        d : 42,
        e : "e"
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 7"
    );

    var objDefault = {
        a : [
            {
                a : "",
                b : ""
            }
        ],
        b : [],
        c : [
            {
                a : "",
                b : [
                    {
                        a : "",
                        b : "",
                    }
                ]
            }
        ]
    };

    var objInput = {
        a : [
            {
                a : "",
                b : ""
            },
            {
                a : "fba"
            }
        ],
        c : [
            {
                a : "",
                b : [
                    {
                        b : "hbb"
                    }
                ]
            }
        ]
    };

    var expected = {
        a : [
            {
                a : "",
                b : ""
            },
            {
                a : "fba",
                b : ""
            }
        ],
        b : [],
        c : [
            {
                a : "",
                b : [
                    {
                        a : "",
                        b : "hbb"
                    }
                ]
            }
        ]
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 8"
    );

    var objDefault = {
        a : [],
    };

    var objInput = {
        a : [
            {
                a : "aa",
                b : "ab"
            }
        ]
    };

    var expected = {
        a : [
            {
                a : "aa",
                b : "ab"
            }
        ]
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 9"
    );

    var objDefault = {
        a : [
            {
                a : "",
                b : ""
            }
        ],
    };

    var objInput = {
        a : [
            {
                a : "a0a",
                c : "a0c"
            }
        ]
    };

    var expected = {
        a : [
            {
                a : "a0a",
                b : "",
                c : "a0c"
            }
        ]
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 10"
    );

    var objDefault = {
        a : [
            {
                a : "",
                b : ""
            }
        ],
    };

    var objDefault = {
        "pocContract": {
            "inputString": "",
            "listObject": [
                {
                    "input2": ""
                }
            ],
            "inputInt": []
        }
    };

    var objInput =  {
        "pocContract": {
            "inputString": "dsfdf",
            "listObject": [
                {
                    "input1": false,
                    "input2": "dfdf"
                }, {
                    "input1": true
                }
            ], "inputInt": []
        }
    };

    var expected =  {
        "pocContract": {
            "inputString": "dsfdf",
            "listObject": [
                {
                    "input1": false,
                    "input2": "dfdf"
                }, {
                    "input1": true,
                    "input2": ""
                }
            ],
            "inputInt": []
        }
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 11"
    );

    var objDefault = {
        "listObject": [
            {
                "input2": ""
            }
        ]
    };

    var objInput =  {
        "listObject": [
            {
                "input1": false,
                "input2": "dfdf"
            },
            {
                "input1": true
            }
        ]
    };

    var expected =  {
        "listObject": [
            {
                "input1": false,
                "input2": "dfdf"
            }, {
                "input1": true,
                "input2": ""
            }
        ]
    };

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 12"
    );

    var objDefault = [
        {
            "input2": ""
        }
    ];

    var objInput =  [
        {
            "input1": false,
            "input2": "dfdf"
        },
        {
            "input1": true
        }
    ];

    var expected =  [
        {
            "input1": false,
            "input2": "dfdf"
        }, {
            "input1": true,
            "input2": ""
        }
    ];

    assert.deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 13"
    );

    assert.deepEqual(
        $.Oda.Tooling.merge({default: {truc:1}, source: undefined}),
        {truc:1},
        "$.Oda.Tooling.merge 14"
    );
});

QUnit.test( "$.Oda.Tooling.checkParams", function(assert) {
    var inputs = {attr1 : null, attr2 : "truc"};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = {attr1 : null, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    assert.deepEqual(receive, attemps, "Test 1" );

    var inputs = {attr1 : null};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = {attr1 : null, attr2 : "defaultValue"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    assert.deepEqual(receive, attemps, "Test 2" );

    var inputs = {attr2 : "truc"};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = null;
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    assert.deepEqual(receive, attemps, "Test 3" );

    var inputs = {attr1 : 1, attr2 : "truc"};
    var def = {attr1 : 1, attr2 : "defaultValue"};
    var attemps = {attr1 : 1, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    assert.deepEqual(receive, attemps, "Test 4" );

    var inputs = {attr1 : 1, attr2 : "truc"};
    var def = {attr1 : 1};
    var attemps = {attr1 : 1, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    assert.deepEqual(receive, attemps, "Test 5" );
});

QUnit.test( "$.Oda.Tooling.decodeHtml", function(assert) {
    var attemps = 'Hello';
    var receive = $.Oda.Tooling.decodeHtml('<b>Hello</b>')

    assert.equal(receive, attemps, "Test 1" );
});

QUnit.test( "$.Oda.Tooling.findBetweenWords", function(assert) {
    var attemps = [' here '];
    var receive = $.Oda.Tooling.findBetweenWords({
        str: 'Hello here you',
        first: 'Hello',
        last: 'you'
    })

    assert.deepEqual(receive, attemps, "Test 1" );

    var attemps = [];
    var receive = $.Oda.Tooling.findBetweenWords({
        str: 'Hello here you',
        first: 'Truc',
        last: 'you'
    })

    assert.deepEqual(receive, attemps, "Test 2" );
});

QUnit.test( "$.Oda.Tooling.getListValeurPourAttribut", function(assert) {
    var attemps = ['here', 'ici'];
    var inputs = [
        {
            attr1: 'Hello',
            attr2: 'here',
            attr3: 'you'
        },
        {
            attr1: 'bonjour',
            attr2: 'ici',
            attr3: 'vous'
        }
    ];
    var receive = $.Oda.Tooling.getListValeurPourAttribut(inputs,"attr2");

    assert.deepEqual(receive, attemps, "Test 1" );
});

QUnit.test( "$.Oda.Tooling.getTypeOfVar", function(assert) {
    assert.equal($.Oda.Tooling.getTypeOfVar("String"), "String", "Test String");
    assert.equal($.Oda.Tooling.getTypeOfVar(1), "Number", "Test Number");
    assert.equal($.Oda.Tooling.getTypeOfVar(true), "Boolean", "Test Boolean");
    assert.equal($.Oda.Tooling.getTypeOfVar([]), "Array", "Test Array");
    assert.equal($.Oda.Tooling.getTypeOfVar({}), "Object", "Test Object");
});

QUnit.test( "$.Oda.Tooling.isInArray", function(assert) {
    assert.equal($.Oda.Tooling.isInArray(1,[1,2]), true, "Test 1 " );

    assert.equal($.Oda.Tooling.isInArray(3,[1,2]), false, "Test 2 " );

    assert.equal($.Oda.Tooling.isInArray("1",[1,2]), false, "Test 3 " );

    assert.equal($.Oda.Tooling.isInArray("1",["1",2]), true, "Test 4 " );

    assert.equal($.Oda.Tooling.isInArray({attr:"hello"},[{attr:"hello"},2]), true, "Test 5 " );
});

QUnit.test( "$.Oda.Tooling.isUndefined", function(assert) {
    var notExist;
    assert.equal($.Oda.Tooling.isUndefined(notExist), true, "Test 1 " );

    var notExist = true;
    assert.equal($.Oda.Tooling.isUndefined(notExist), false, "Test 2 " );
});

QUnit.test( "$.Oda.Tooling.objectSize", function(assert) {
    assert.equal($.Oda.Tooling.objectSize({attr1:1, attr2:2}), 2, "Test 1 " );
});

QUnit.test( "$.Oda.Tooling.objDataTableFromJsonArray", function(assert) {
    var inputs = [
        {
            attr1: "attr1",
            attr2: 'attr2'
        },
        {
            attr1: "attr1",
            attr2: 'attr2'
        }
    ];
    var receive = $.Oda.Tooling.objDataTableFromJsonArray(inputs);
    var attemps = {
        statut: "ok",
        entete: {
            attr1: 0,
            attr2: 1
        },
        data: [
            [
                "attr1",
                "attr2"
            ],
            [
                "attr1",
                "attr2"
            ]
        ]
    };
    assert.deepEqual(receive, attemps, "Test 1" );
});

QUnit.test( "$.Oda.Tooling.objDataTableFromJsonArray", function(assert) {
    var inputs = [
        {
            attr1: "attr1",
            attr2: 'attr2'
        },
        {
            attr1: "attr1",
            attr2: 'attr2'
        }
    ];
    var receive = $.Oda.Tooling.objDataTableFromJsonArray(inputs);
    var attemps = {
        statut: "ok",
        entete: {
            attr1: 0,
            attr2: 1
        },
        data: [
            [
                "attr1",
                "attr2"
            ],
            [
                "attr1",
                "attr2"
            ]
        ]
    };
    assert.deepEqual(receive, attemps, "Test 1" );
});

QUnit.test( "$.Oda.Tooling.jsonToStringHtml", function(assert) {
    assert.equal($.Oda.Tooling.jsonToStringHtml({json:[{"coucou":"value"}]}), "[{'coucou':'value'}]", "Test 1 " );
    assert.equal($.Oda.Tooling.jsonToStringHtml({json:[{"coucou":"ner'zhul"}]}), "[{'coucou':'ner\'zhul'}]", "Test 1 " );
});

QUnit.test( "$.Oda.Tooling.stringToOdaCrypt", function(assert) {
    assert.equal($.Oda.Tooling.stringToOdaCrypt('{"hello":"coucou","time":1491902766000}'), "7b2268656c6c6f223a22636f75636f75222c2274696d65223a313439313930323736363030307d", "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.odaCryptToString", function(assert) {
    assert.equal($.Oda.Tooling.odaCryptToString("7b2268656c6c6f223a22636f75636f75222c2274696d65223a313439313930323736363030307d"), '{"hello":"coucou","time":1491902766000}', "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.getParameterGet", function(assert) {
    assert.deepEqual($.Oda.Tooling.getParameterGet({url:"http://localhost/how/#page?attr=1"}), {attr:"1"}, "Test OK : Passed!" );
});