OOJSPlus.ui.data.FilterFactory = function ( cfg, data ) { // eslint-disable-line no-unused-vars
	this.registry = OOJSPlus.ui.data.registry.filterRegistry;
};

OO.initClass( OOJSPlus.ui.data.FilterFactory );

OOJSPlus.ui.data.FilterFactory.prototype.makeFilter = function ( data ) {
	const type = data.type || 'string';
	let filterClass = this.registry.lookup( type );

	if ( !filterClass ) {
		filterClass = this.registry.lookup( 'string' );
	}

	return new filterClass( data ); // eslint-disable-line new-cap
};
