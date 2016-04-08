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
})

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
})