QUnit.module( "Draft" );

QUnit.test( "$.Oda.Test", function(assert) {
    var done = assert.async();
    setTimeout(function() {
        assert.ok( 1 < 2, "Test" );
        done();
    }, 1500 );
});