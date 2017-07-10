QUnit.module( "Storage" );

$.Oda.Storage.reset();

QUnit.test( "$.Oda.Storage.set", function(assert) {
    var recieve = $.Oda.Storage.set('testSet_keyTtl_1',{'key':'value'},1);
    assert.ok( recieve, "Test 1" );
    $.Oda.Storage.remove('testSet_keyTtl_1');

    var recieve = $.Oda.Storage.set('testSet_keyTtl_4242',{'key':'value'},4242);
    assert.ok( recieve, "Test 2" );
    $.Oda.Storage.remove('testSet_keyTtl_4242');

    var recieve = $.Oda.Storage.set('testSet_key',{'key':'value'});
    assert.ok( recieve, "Test 3" );
    $.Oda.Storage.remove('testSet_key');

});

QUnit.test( "$.Oda.Storage.get", function(assert) {
    $.Oda.Storage.set('testGet_keyTtl_1',{'key':'value'},1);
    $.Oda.Storage.set('testGet_keyTtl_4242',{'key':'value'},4242);
    $.Oda.Storage.set('testGet_key',{'key':'value'});

    var done = assert.async();
    setTimeout(function() {
        var recieve = $.Oda.Storage.get('testGet_keyTtl_1');
        assert.equal( recieve, null, "Test 1" );
        $.Oda.Storage.remove('testGet_keyTtl_1');
        done();
    }, 1500 );

    var recieve = $.Oda.Storage.get('testGet_keyTtl_4242');
    assert.deepEqual( recieve, {'key':'value'}, "Test 2" );

    var recieve = $.Oda.Storage.get('testGet_key');
    assert.deepEqual( recieve, {'key':'value'}, "Test 3" );

    var recieve = $.Oda.Storage.get('testGet_keyDefault',{'key':'value'});
    assert.deepEqual( recieve, {'key':'value'}, "Test 4" );

    $.Oda.Storage.remove('testGet_keyTtl_4242');
    $.Oda.Storage.remove('testGet_key');
});

QUnit.test( "$.Oda.Storage.getTtl", function(assert) {
    $.Oda.Storage.set('testGetTtl_key',{'key':'value'});

    $.Oda.Storage.set('testGetTtl_keyTtl_4242',{'key':'value'},4242);
    var recieve = $.Oda.Storage.getTtl('testGetTtl_keyTtl_4242');
    assert.ok( recieve > 0, "Test 1" );

    $.Oda.Storage.set('testGetTtl_keyTtl_15',{'key':'value'},1);
    var done = assert.async();
    setTimeout(function() {
        var recieve = $.Oda.Storage.getTtl('testGetTtl_keyTtl_15');
        assert.ok( recieve < 0, "Test 2" );
        $.Oda.Storage.remove('testGetTtl_keyTtl_15');
        done();
    }, 1500 );
    var recieve = $.Oda.Storage.getTtl('testGetTtl_key');
    assert.ok( recieve < 0, "Test 3" );

    $.Oda.Storage.remove('testGetTtl_keyTtl_4242');
    $.Oda.Storage.remove('testGetTtl_key');
});

QUnit.test( "$.Oda.Storage.setTtl", function(assert) {
    $.Oda.Storage.set('testSetTtl_keyTtl_12',{'key':'value'},1);
    var done = assert.async();
    setTimeout(function() {
        $.Oda.Storage.setTtl('testSetTtl_keyTtl_12',42);
        var recieve = $.Oda.Storage.getTtl('testSetTtl_keyTtl_12');
        assert.ok( recieve > 0, "Test 1" );
        $.Oda.Storage.remove('testSetTtl_keyTtl_12');
        done();
    }, 1500 );
});

QUnit.test( "$.Oda.Storage.remove", function(assert) {
    $.Oda.Storage.set('testRemove_keyTtl_51',{'key':'value'});
    $.Oda.Storage.remove('testRemove_keyTtl_51');
    assert.deepEqual( localStorage.getItem($.Oda.Storage.storageKey+"testRemove_keyTtl_51"), null, "Test 1" );
});

QUnit.test( "$.Oda.Storage.reset", function(assert) {
    $.Oda.Storage.set('testReset_keyTtl_61',{'key':'value'});
    $.Oda.Storage.reset();
    assert.deepEqual( localStorage.length, 0, "Test 1" );
});

QUnit.test( "$.Oda.Storage.getIndex", function(assert) {
    $.Oda.Storage.set('testGetIndex_keyTtl_71',{'key':'value'});
    $.Oda.Storage.set('testGetIndex_keyTtl_72',{'key':'value'});
    var listName = $.Oda.Storage.getIndex('testGetIndex_keyTtl');
    assert.deepEqual( listName.length, 2, "Test 1" );
});