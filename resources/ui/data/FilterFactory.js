OOJSPlus.ui.data.FilterFactory = function ( cfg, data ) {
	this.registry = OOJSPlus.ui.data.registry.filterRegistry;
};

OO.initClass( OOJSPlus.ui.data.FilterFactory );

OOJSPlus.ui.data.FilterFactory.prototype.makeFilter = function( data ) {
	var type = data.type || 'string',
		filterClass = this.registry.lookup( type );

	if ( !filterClass ) {
		filterClass = this.registry.lookup( 'string' );
	}

	return new filterClass( data );
};

