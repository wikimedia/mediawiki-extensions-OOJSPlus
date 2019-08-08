( function( mw, $, undefined ) {

	function _makeContructorFromString( className, constructorFunction ) {

	}

	var definitionSpecialFields = [ 'extend', 'requires', 'constructor', 'static', 'mixins' ];
	function _define( className, definition ) {
		throw new Error( 'NOT WORKING' );

		//TODO: evaluate 'requires', load by dedicated RL module and make actual definition async

		var _constructor = _makeContructorFromString( className, definition.contructor || function() {} );

		if( definition.extend ) {
			var _baseConstructor = _makeContructorFromString( definition.extend );
			OO.inheritClass( _constructor, _baseConstructor );
		}
		else {
			OO.initClass( _constructor );
		}

		if( definition.mixins ) {
			for( var i = 0; i < definition.mixins.length; i++ ) {
				var _mixinConstructor = _makeContructorFromString( definition.mixins[i] );
				OO.mixinClass( _constructor, _mixinConstructor );
			}
		}

		if( definition.static ) {
			for( var fieldName in definition.static ) {
				_constructor.static[fieldName] = definition.static[fieldName];
			}
		}

		for( var fieldName in definition ) {
			if( $.inArray( fieldName, definitionSpecialFields ) ) {
				continue;
			}
			_constructor.prototype[fieldName] = definition[fieldName];
		}
	}

	function _require( className, callback ) {
		throw new Error( 'NOT WORKING' );
		//TBD
	}

	OOJSPlus = {
		define: _define,
		require: _require,
		ui: {
			data: {
				column: {},
				paginator: {},
				tree: {}
			},
			widget: {},
			mixin: {}
		}

	}

} )( mediaWiki, jQuery );