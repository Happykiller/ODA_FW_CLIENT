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