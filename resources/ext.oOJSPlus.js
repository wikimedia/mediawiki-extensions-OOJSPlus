( function ( $ ) {

	function _makeConstructorFromString( className, constructor ) {
		let baseObject = window;
		const parts = className.split( '.' );
		let part = parts.shift();
		baseObject[ part ] = baseObject[ part ] || {};
		baseObject = baseObject[ part ];
		while ( parts.length > 1 ) {
			part = parts.shift();
			baseObject[ part ] = baseObject[ part ] || {};
			baseObject = baseObject[ part ];
		}
		const lastPart = parts.shift();
		if ( baseObject[ lastPart ] instanceof Function === false ) {
			baseObject[ lastPart ] = constructor;
		}
		return baseObject[ lastPart ];
	}

	const definitionSpecialFields = [ 'extend', 'requires', 'constructor', 'static', 'mixins' ];

	function _define( className, definition ) {
		let i = 0;
		// TODO: evaluate 'requires', load by dedicated RL module and make actual definition async

		const _constructor = _makeConstructorFromString( className, definition.constructor || ( () => {} ) );

		if ( definition.extend ) {
			const _baseConstructor = _makeConstructorFromString( definition.extend );
			OO.inheritClass( _constructor, _baseConstructor );

			// For some reason the "static" member is not inherited
			_constructor.static = _baseConstructor.static;
		} else {
			OO.initClass( _constructor );
		}

		if ( definition.mixins ) {
			for ( i = 0; i < definition.mixins.length; i++ ) {
				const _mixinConstructor = _makeConstructorFromString( definition.mixins[ i ] );
				OO.mixinClass( _constructor, _mixinConstructor );
			}
		}

		if ( definition.static ) {
			_constructor.static = _constructor.static || {};
			for ( const staticFieldName in definition.static ) {
				if ( staticFieldName.indexOf( '+' ) === 0 ) {
					const unprefixedStaticFieldName = staticFieldName.slice( 1 );
					for ( i = 0; i < definition.static[ staticFieldName ].length; i++ ) {
						_constructor.static[ unprefixedStaticFieldName ].push( definition.static[ staticFieldName ][ i ] );
					}
				} else {
					_constructor.static[ staticFieldName ] = definition.static[ staticFieldName ];
				}
			}
		}

		for ( const fieldName in definition ) {
			if ( $.inArray( fieldName, definitionSpecialFields ) !== -1 ) { // eslint-disable-line no-jquery/no-in-array
				continue;
			}
			_constructor.prototype[ fieldName ] = definition[ fieldName ];
		}
	}

	OOJSPlus = {
		define: _define,
		formelement: {},
		ui: {
			panel: {},
			toolbar: { tool: {} },
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

}( jQuery ) );
