QUnit.module( "Storage" );

QUnit.test( "$.Oda.Storage.set", function() {
    var recieve = $.Oda.Storage.set('keyTtl_1',{'key':'value'},1);
    QUnit.assert.ok( recieve, "Test 1" );

    var recieve = $.Oda.Storage.set('keyTtl_4242',{'key':'value'},4242);
    QUnit.assert.ok( recieve, "Test 2" );

    var recieve = $.Oda.Storage.set('key',{'key':'value'});
    QUnit.assert.ok( recieve, "Test 3" );
});

QUnit.test( "$.Oda.Storage.get", function( assert ) {
    var done = assert.async();
    setTimeout(function() {
        var recieve = $.Oda.Storage.get('keyTtl_1');
        assert.equal( recieve, null, "Test 1" );
        done();
    }, 1500 );

    var recieve = $.Oda.Storage.get('keyTtl_4242');
    QUnit.assert.deepEqual( recieve, {'key':'value'}, "Test 2" );

    var recieve = $.Oda.Storage.get('key');
    QUnit.assert.deepEqual( recieve, {'key':'value'}, "Test 3" );

    var recieve = $.Oda.Storage.get('keyDefault',{'key':'value'});
    QUnit.assert.deepEqual( recieve, {'key':'value'}, "Test 4" );
});

QUnit.test( "$.Oda.Storage.getTtl", function( assert ) {
    var recieve = $.Oda.Storage.getTtl('keyTtl_4242');
    QUnit.assert.ok( recieve > 0, "Test 1" );

    $.Oda.Storage.set('keyTtl_15',{'key':'value'},1);
    var done = QUnit.assert.async();
    setTimeout(function() {
        var recieve = $.Oda.Storage.getTtl('keyTtl_15');
        QUnit.assert.ok( recieve < 0, "Test 2" );
        done();
    }, 1500 );

    var recieve = $.Oda.Storage.getTtl('key');
    QUnit.assert.ok( recieve < 0, "Test 3" );
});

QUnit.test( "$.Oda.Storage.setTtl", function( assert ) {
    $.Oda.Storage.set('keyTtl_12',{'key':'value'},1);
    var done = QUnit.assert.async();
    setTimeout(function() {
        $.Oda.Storage.setTtl('keyTtl_12',42);
        var recieve = $.Oda.Storage.getTtl('keyTtl_12');
        QUnit.assert.ok( recieve > 0, "Test 1" );
        done();
    }, 1500 );
});

QUnit.test( "$.Oda.Storage.remove", function( assert ) {
    $.Oda.Storage.set('keyTtl_51',{'key':'value'});
    $.Oda.Storage.remove('keyTtl_51');
    QUnit.assert.deepEqual( localStorage.getItem($.Oda.Storage.storageKey+"keyTtl_51"), null, "Test 1" );
});

QUnit.test( "$.Oda.Storage.reset", function( assert ) {
    $.Oda.Storage.set('keyTtl_61',{'key':'value'});
    $.Oda.Storage.reset();
    QUnit.assert.deepEqual( localStorage.length, 0, "Test 1" );
});

QUnit.test( "$.Oda.Storage.reset", function( assert ) {
    $.Oda.Storage.set('keyTtl_71',{'key':'value'});
    $.Oda.Storage.set('keyTtl_72',{'key':'value'});
    var listName = $.Oda.Storage.getIndex('keyTtl');
    QUnit.assert.deepEqual( listName.length, 2, "Test 1" );
});