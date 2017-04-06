QUnit.module( "I8n" );

$.Oda.I8n.datas = [{
    "groupName": "test",
    "fr": {
        "test": "un test",
        "testVar": "un test {{var1}} {{var2}}"
    },
    "en": {
        "test": "a test",
        "testVar": "a test {{var1}} {{var2}}"
    }
}];

$.Oda.Session.userInfo.locale = "fr";

QUnit.test( "$.Oda.I8n.get", function(assert) {
    assert.equal($.Oda.I8n.get("test", "test"), "un test", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "jp";
    assert.equal($.Oda.I8n.get("test", "test", {defaultLang: "en"}), "a test", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "en";
    assert.equal($.Oda.I8n.get("test", "testVar", {variables: {var1 : "coucou", var2: "hello"}}), "a test coucou hello", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "jp";
    assert.equal($.Oda.I8n.get("test", "testVar", {defaultLang: "en", variables: {var1 : "coucou", var2: "hello"}}), "a test coucou hello", "Test OK : Passed!" );

    $.Oda.Session.userInfo.locale = "fr";
    assert.equal($.Oda.I8n.get("test", "test", {forced: "en"}), "a test", "Test forced" );
});