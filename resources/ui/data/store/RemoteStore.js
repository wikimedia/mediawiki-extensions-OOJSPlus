OOJSPlus.ui.data.store.RemoteStore = function ( cfg ) {
	this.action = cfg.action || {};
	this.total = 0;
	this.api = new mw.Api();

	OOJSPlus.ui.data.store.RemoteStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.RemoteStore, OOJSPlus.ui.data.store.Store );

OOJSPlus.ui.data.store.RemoteStore.prototype.doLoadData = function() {
	var dfd = $.Deferred();
	this.api.abort();
	this.api.get( {
		action: this.action,
		start: this.offset,
		limit: this.limit,
		filter: this.getFiltersForRemote(),
		query: this.getQuery(),
		sort: this.getSortForRemote()
	} ).done( function( response ) {
		if ( response.hasOwnProperty( 'results' ) ) {
			this.total = response.total;
			dfd.resolve( this.indexData( response.results ) );
		}
	}.bind( this ) ).fail( function( e ) {
		dfd.reject( e );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.setData = function( data ) {
	throw new Error( "Cannot set data of a remote store" );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getFiltersForRemote = function() {
	var filters = [];
	for ( var field in this.filters ) {
		if ( !this.filters.hasOwnProperty( field ) ) {
			continue;
		}
		filters.push(
			$.extend( {}, this.filters[field].getValue(), { property: field } )
		);
	}

	return JSON.stringify( filters );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getSortForRemote = function() {
	var sorters = [];
	for ( var field in this.sorters ) {
		if ( !this.sorters.hasOwnProperty( field ) ) {
			continue;
		}
		sorters.push(
			$.extend( {}, this.sorters[field].getValue(), { property: field } )
		);
	}

	return JSON.stringify( sorters );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getTotal = function() {
	return this.total;
};
