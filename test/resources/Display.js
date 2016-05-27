module( "Display" );

test( "$.Oda.Display.jsonToStringSingleQuote", function() {
    equal($.Oda.Display.jsonToStringSingleQuote({json: {"attri": "hello"}}), "{'attri':'hello'}", "Test 1" );
});