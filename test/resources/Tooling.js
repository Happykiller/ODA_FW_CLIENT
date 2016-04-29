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