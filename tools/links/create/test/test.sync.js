'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var parseJSON = require( '@stdlib/utils/parse-json' );
var create = require( './../lib/sync.js' );


// FIXTURES //

var EXPECTED = require( './fixtures/expected.json' );
var EXPECTED2 = require( './fixtures/expected2.json' );


// TESTS //

tape( 'main export is a function', function test( t ) {
	t.ok( true, __filename );
	t.equal( typeof create, 'function', 'main export is a function' );
	t.end();
});

tape( 'the function throws an error if the first argument is not an options object', function test( t ) {
	var values;
	var i;
	values = [
		5,
		'abc',
		NaN,
		null,
		void 0,
		true,
		[],
		function noop() {}
	];

	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided '+values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			create( value );
		};
	}
});

tape( 'if the function encounters an error when attempting to read a database, the function returns the error', function test( t ) {
	var opts = {
		'uri': 'https://stdlib.io/',
		'id': 'stdlib',
		'description': 'A standard library for JavaScript and Node.js.',
		'database': './nonexisting.json'
	};
	var out = create( opts );
	t.strictEqual( out instanceof Error, true, 'returns an error' );
	t.end();
});

tape( 'the function inserts a link to a link database', function test( t ) {
	var database;
	var create;
	var opts;
	var out;
	var uri;

	create = proxyquire( './../lib/sync.js', {
		'fs': {
			'writeFileSync': mock
		}
	});
	uri = 'https://stdlib.io/';
	database = './test/fixtures/database.json';
	opts = {
		'uri': uri,
		'id': 'stdlib',
		'description': 'A standard library for JavaScript and Node.js.',
		'database': database,
		'keywords': [
			'standard',
			'library',
			'lib'
		]
	};
	out = create( opts );
	t.strictEqual( out, null, 'returns null' );
	t.end();

	function mock( database, out ) {
		var db = parseJSON( out );
		t.deepEqual( db, EXPECTED, 'link has been successfully inserted' );
	}
});

tape( 'the created entry will have a period at the end of description even if forgotten', function test( t ) {
	var description;
	var database;
	var opts;
	var out;
	var uri;

	create = proxyquire( './../lib/sync.js', {
		'fs': {
			'writeFileSync': mock
		}
	});
	uri = 'http://usejsdoc.org/';
	database = './test/fixtures/database.json';
	description = 'The official website of JSDoc';
	opts = {
		'uri': uri,
		'id': 'jsdoc',
		'description': description,
		'database': database
	};
	out = create( opts );
	t.strictEqual( out, null, 'returns null' );
	t.end();

	function mock( database, out ) {
		var db = parseJSON( out );
		t.deepEqual( db, EXPECTED2, 'description ends with a period' );
	}
});

tape( 'the function returns an error when the link database already contains an entry for the provided URI', function test( t ) {
	var database;
	var opts;
	var out;
	var uri;

	uri = 'https://www.r-project.org/';
	database = './test/fixtures/database.json';
	opts = {
		'uri': uri,
		'id': 'r',
		'description': 'A free software environment for statistical computing and graphics.',
		'database': database
	};
	out = create( opts );
	t.strictEqual( out instanceof Error, true, 'returns an error' );
	t.end();
});

tape( 'the function returns an error when the link database already contains an entry for the provided id', function test( t ) {
	var database;
	var opts;
	var out;
	var uri;

	uri = 'https://en.wikipedia.org/wiki/R_Project';
	database = './test/fixtures/database.json';
	opts = {
		'uri': uri,
		'id': 'r',
		'description': 'Wikipedia entry for statistical programming language R.',
		'database': database
	};
	out = create( opts );
	t.strictEqual( out instanceof Error, true, 'returns an error' );
	t.end();
});

