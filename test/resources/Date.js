QUnit.module( "Date" );

QUnit.test( "$.Oda.Date.dateFormat", function(assert) {
    assert.equal($.Oda.Date.dateFormat(new Date('2017-01-12'), 'YYYY-MM-DD'), "2017-01-12", "Test 1" );
    assert.equal($.Oda.Date.dateFormat('2017-01-12', 'YYYY-MM-DD'), "2017-01-12", "Test 1" );
});