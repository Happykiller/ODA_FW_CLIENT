QUnit.module( "Draft" );

QUnit.test( "$.Oda.Tooling.getParameterGet", function(assert) {
    assert.deepEqual($.Oda.Tooling.getParameterGet({url:"http://localhost/how/#page?attr=1"}), {attr:"1"}, "Test OK : Passed!" );
});