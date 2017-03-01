QUnit.module( "Date" );

QUnit.test( "$.Oda.Date.dateFormat", function() {
    QUnit.assert.equal($.Oda.Date.dateFormat(new Date('2017-01-12'), 'YYYY-MM-DD'), "2017-01-12", "Test 1" );
    QUnit.assert.equal($.Oda.Date.dateFormat('2017-01-12', 'YYYY-MM-DD'), "2017-01-12", "Test 1" );
});