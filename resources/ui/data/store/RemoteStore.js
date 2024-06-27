/**
 * {
 *     autoload: true, // Whether to autoload the store, or require explicit .load() call
 *     data: [], // Array of objects to load (not with RemoteStore)
 *     query: 'string', // Query to send to the server or locally filter specified {data}
 *     remoteFilter: true | false, // Whether to filter remotely or locally
 *     remoteSort: true | false, // Whether to sort remotely or locally
 *     pageSize: 25, // Number of items per page
 *     filter: { array_of_filters },
 *     sorter: { array_of_sorters },
 *     groupField: 'string' // Field to group by. If specified, store is responsible for properly sorting by groupField
 *     action: 'string', // Action API action name
 * }
 * @type {OOJSPlus.ui.data.store.Store}
 */
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
	var data = {
		action: this.action,
		start: this.offset,
		limit: this.limit,
		filter: this.getFiltersForRemote(),
		query: this.getQuery(),
		sort: this.getSortForRemote()
	};
	if ( this.groupField ) {
		data.group = JSON.stringify( { property: this.groupField, direction: 'ASC' } );
	}
	this.api.get( data ).done( function( response ) {
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
		sorters.unshift(
			$.extend( {}, this.sorters[field].getValue(), { property: field } )
		);
	}

	return JSON.stringify( sorters );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getTotal = function() {
	return this.total;
};
