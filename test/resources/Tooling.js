module( "Tooling" );

test( "$.Oda.Tooling.arrondir", function() {
    equal($.Oda.Tooling.arrondir(10.42, 1), 10.4, "Test OK : Passed!" );
});

test( "$.Oda.Tooling.clearSlashes", function() {
    equal($.Oda.Tooling.clearSlashes("Hello/"), "Hello", "Test OK : Passed!" );
});

test( "$.Oda.Tooling.clone", function() {
    var obj = {attr1 : "value1", attr2 : "value2"};
    var obj2 = $.Oda.Tooling.clone(obj);
    deepEqual(obj2, {attr1 : "value1", attr2 : "value2"}, "Test OK : Passed!" );
});

test( "$.Oda.Tooling.deepEqual", function() {
    ok($.Oda.Tooling.deepEqual([1,2],[1,2]), "Test OK : Passed!" );

    ok($.Oda.Tooling.deepEqual({attr1 : "value1", attr2 : "value2"},{attr1 : "value1", attr2 : "value2"}), "Test OK : Passed!" );
});

test( "$.Oda.Tooling.pad2", function(){
    equal( $.Oda.Tooling.pad2("03"), "03", "Test OK : Passed!" );
    equal( $.Oda.Tooling.pad2(3), "03", "Test OK : Passed!" );
});

test( "$.Oda.Tooling.replaceAll", function(){
    var strOri = '';
    var strWait = '';
    equal( $.Oda.Tooling.replaceAll({
        str: strOri,
        find: "",
        by: ""
    }), strWait, "Test OK : Passed!" );

    var strOri = 'ceci est un test pour un test pour faire un test';
    var strWait = 'ceci est deux test pour deux test pour faire deux test';
    equal( $.Oda.Tooling.replaceAll({
        str: strOri,
        find: "un",
        by: "deux"
    }), strWait, "Test OK : Passed!" );
});

test( "$.Oda.Tooling.TemplateHtml", function(){

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

    equal( attempt, recieve, "Test OK : Passed!" );

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

    equal( attempt, recieve, "Test OK : Passed!" );

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

    equal( attempt, recieve, "Test OK : Passed!" );

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

    equal( attempt, recieve, "Test OK : Passed!" );

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

    equal( attempt, recieve, "Test OK : Passed!" );
});

test( "$.Oda.Tooling.filter", function(assert ) {
    var inputs = [1, 2, 3];

    deepEqual($.Oda.Tooling.filter({src: inputs, condition: function(elt){return elt > 1;}}), [2, 3], "$.Oda.Tooling.filter with array of value" );

    var inputs = [{age: 11}, {age: 12}, {age: 13}];

    deepEqual($.Oda.Tooling.filter({src: inputs, condition: function(elt){return elt.age > 11;}}), [{age: 12}, {age: 13}], "$.Oda.Tooling.filter with array of object" );

    equal($.Oda.Tooling.filter({src: "truc", condition: function(elt){return true;}}), null, "$.Oda.Tooling.filter with no array" );

    var inputs = [{age: 11, filter: true}, {age: 12, filter: false}, {age: 13, filter: false}];
    equal($.Oda.Tooling.filter({src: inputs, condition: "truc"}), null, "$.Oda.Tooling.filter with attribute in condition but not an object" );

    deepEqual($.Oda.Tooling.filter({src: inputs, condition: {filter: true}}), [{age: 11, filter: true}], "$.Oda.Tooling.filter with attribute in condition" );
});

test( "$.Oda.Tooling.order", function(assert ) {
    var inputs = [1, 2, 3];

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

test( "$.Oda.Tooling.merge", function() {
    deepEqual(
        $.Oda.Tooling.merge({default: "4", source: "5"}),
        "5",
        "$.Oda.Tooling.merge 1"
    );

    deepEqual(
        $.Oda.Tooling.merge({default: 4, source: null}),
        4,
        "$.Oda.Tooling.merge 2"
    );

    var objDefault = [];

    var objInput = [];

    var expected = [];

    deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 3"
    );

    var objDefault = [];

    var objInput = [1,2];

    var expected = [1,2];

    deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 4"
    );

    var objDefault = [0];

    var objInput = [1,2];

    var expected = [1,2];

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
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

    deepEqual(
        $.Oda.Tooling.merge({default: objDefault, source: objInput}),
        expected,
        "$.Oda.Tooling.merge 13"
    );
});

test( "$.Oda.Tooling.checkParams", function() {
    var inputs = {attr1 : null, attr2 : "truc"};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = {attr1 : null, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    deepEqual(receive, attemps, "Test 1" );

    var inputs = {attr1 : null};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = {attr1 : null, attr2 : "defaultValue"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    deepEqual(receive, attemps, "Test 2" );

    var inputs = {attr2 : "truc"};
    var def = {attr1 : null, attr2 : "defaultValue"};
    var attemps = null;
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    deepEqual(receive, attemps, "Test 3" );

    var inputs = {attr1 : 1, attr2 : "truc"};
    var def = {attr1 : 1, attr2 : "defaultValue"};
    var attemps = {attr1 : 1, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    deepEqual(receive, attemps, "Test 4" );

    var inputs = {attr1 : 1, attr2 : "truc"};
    var def = {attr1 : 1};
    var attemps = {attr1 : 1, attr2 : "truc"};
    var receive = $.Oda.Tooling.checkParams(inputs, def);

    deepEqual(receive, attemps, "Test 5" );
});

test( "$.Oda.Tooling.decodeHtml", function() {
    var attemps = 'Hello';
    var receive = $.Oda.Tooling.decodeHtml('<b>Hello</b>')

    equal(receive, attemps, "Test 1" );
});

test( "$.Oda.Tooling.findBetweenWords", function() {
    var attemps = [' here '];
    var receive = $.Oda.Tooling.findBetweenWords({
        str: 'Hello here you',
        first: 'Hello',
        last: 'you'
    })

    deepEqual(receive, attemps, "Test 1" );

    var attemps = [];
    var receive = $.Oda.Tooling.findBetweenWords({
        str: 'Hello here you',
        first: 'Truc',
        last: 'you'
    })

    deepEqual(receive, attemps, "Test 2" );
});

test( "$.Oda.Tooling.getListValeurPourAttribut", function() {
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

    deepEqual(receive, attemps, "Test 1" );
});

test( "$.Oda.Tooling.isInArray", function() {
    equal($.Oda.Tooling.isInArray(1,[1,2]), true, "Test 1 " );

    equal($.Oda.Tooling.isInArray(3,[1,2]), false, "Test 2 " );

    equal($.Oda.Tooling.isInArray("1",[1,2]), false, "Test 3 " );

    equal($.Oda.Tooling.isInArray("1",["1",2]), true, "Test 4 " );

    equal($.Oda.Tooling.isInArray({attr:"hello"},[{attr:"hello"},2]), true, "Test 5 " );
});

test( "$.Oda.Tooling.isUndefined", function() {
    var notExist;
    equal($.Oda.Tooling.isUndefined(notExist), true, "Test 1 " );

    var notExist = true;
    equal($.Oda.Tooling.isUndefined(notExist), false, "Test 2 " );
});

test( "$.Oda.Tooling.objectSize", function() {
    equal($.Oda.Tooling.objectSize({attr1:1, attr2:2}), 2, "Test 1 " );
});