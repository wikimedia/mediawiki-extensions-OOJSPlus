( function( mw, $, undefined ) {

	function _makeConstructorFromString( className, constructor ) {
		var baseObject = window;
		var parts = className.split( '.' );
		var part = parts.shift();
		baseObject[part] = baseObject[part] || {};
		baseObject = baseObject[part];
		while( parts.length > 1 ) {
			part = parts.shift();
			baseObject[part] = baseObject[part] || {};
			baseObject = baseObject[part];
		}
		var lastPart = parts.shift();
		if( baseObject[lastPart] instanceof Function === false ) {
			baseObject[lastPart] = constructor;
		}
		return baseObject[lastPart];
	}

	var definitionSpecialFields = [ 'extend', 'requires', 'constructor', 'static', 'mixins' ];

	function _define( className, definition ) {
		var i = 0;
		//TODO: evaluate 'requires', load by dedicated RL module and make actual definition async

		var _constructor = _makeConstructorFromString( className, definition.constructor || function() {} );

		if( definition.extend ) {
			var _baseConstructor = _makeConstructorFromString( definition.extend );
			OO.inheritClass( _constructor, _baseConstructor );

			//For some reason the "static" member is not inherited
			_constructor.static = _baseConstructor.static;
		}
		else {
			OO.initClass( _constructor );
		}

		if( definition.mixins ) {
			for( i = 0; i < definition.mixins.length; i++ ) {
				var _mixinConstructor = _makeConstructorFromString( definition.mixins[i] );
				OO.mixinClass( _constructor, _mixinConstructor );
			}
		}

		if( definition.static ) {
			_constructor.static = _constructor.static || {};
			for( var staticFieldName in definition.static ) {
				if( staticFieldName.indexOf( '+' ) === 0 ) {
					var unprefixedStaticFieldName = staticFieldName.substring( 1 );
					for( i = 0; i < definition.static[staticFieldName].length; i++ ) {
						_constructor.static[unprefixedStaticFieldName].push( definition.static[staticFieldName][i] );
					}
				}
				else {
					_constructor.static[staticFieldName] = definition.static[staticFieldName];
				}
			}
		}

		for( var fieldName in definition ) {
			if( $.inArray( fieldName, definitionSpecialFields ) !== -1 ) {
				continue;
			}
			_constructor.prototype[fieldName] = definition[fieldName];
		}
	}

	OOJSPlus = {
		define: _define,
		formelement: {},
		ui: {
			data: {
				column: {},
				grid: {},
				tree: {},
				filter: {},
				store: {},
				sorter: {},
				registry: {
					columnRegistry: new OO.Registry(),
					filterRegistry: new OO.Registry()
				}
			},
			dialog: {},
			booklet: {},
			widget: {},
			mixin: {}
		}
	};

} )( mediaWiki, jQuery );
