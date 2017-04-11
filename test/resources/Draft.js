QUnit.module( "Draft" );

QUnit.test( "$.Oda.Tooling.stringToOdaCrypt", function(assert) {
    assert.equal($.Oda.Tooling.stringToOdaCrypt('{"userCode":"ILRO","valideDate":1491902766000}'), "7b2275736572436f6465223a22494c524f222c2276616c69646544617465223a313439313930323736363030307d", "Test OK : Passed!" );
});

QUnit.test( "$.Oda.Tooling.odaCryptToString", function(assert) {
    assert.equal($.Oda.Tooling.odaCryptToString("7b2275736572436f6465223a22494c524f222c2276616c69646544617465223a313439313930323736363030307d"), '{"userCode":"ILRO","valideDate":1491902766000}', "Test OK : Passed!" );
});