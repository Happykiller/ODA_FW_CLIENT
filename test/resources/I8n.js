module( "I8n" );

$.Oda.I8n.datas = [{
    "groupName": "test",
    "fr": {
        "test": "test",
        "testVar": "test {{var1}} {{var2}}"
    },
    "en": {
        "test": "test",
        "testVar": "test {{var1}} {{var2}}"
    }
}];

$.Oda.Session.userInfo.locale = "fr";

test( "$.Oda.I8n.get", function() {
    equal($.Oda.I8n.get("test", "test"), "test", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "jp";
    equal($.Oda.I8n.get("test", "test", {defaultLang: "en"}), "test", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "en";
    equal($.Oda.I8n.get("test", "testVar", {variables: {var1 : "coucou", var2: "hello"}}), "test coucou hello", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "jp";
    equal($.Oda.I8n.get("test", "testVar", {defaultLang: "en", variables: {var1 : "coucou", var2: "hello"}}), "test coucou hello", "Test OK : Passed!" );
});