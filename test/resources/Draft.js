module( "Draft" );

test( "$.Oda.Test", function() {
    equal(true, true, "Should be true" );
});

test( "$.Oda.Tooling.findBetweenWords", function() {
    var attemps = 'here';
    var receive = $.Oda.Tooling.findBetweenWords({
        src: 'Hello here you',
        first: 'Hello',
        last: 'you'
    })

    equal(receive, attemps, "Test 1" );
});