QUnit.module( "Display" );

QUnit.test( "$.Oda.Display.jsonToStringSingleQuote", function() {
    QUnit.assert.equal($.Oda.Display.jsonToStringSingleQuote({json: {"attri": "hello"}}), "{'attri':'hello'}", "Test 1" );
});