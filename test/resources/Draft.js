QUnit.module( "Draft" );

QUnit.test( "$.Oda.Test", function() {
    var done = QUnit.assert.async();
    setTimeout(function() {
        QUnit.assert.ok( 1 < 2, "Test" );
        done();
    }, 1500 );
});