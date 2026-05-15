/**
 * {
 * autoload: true, // Whether to autoload the store, or require explicit .load() call
 * data: [], // Array of objects to load (not with RemoteStore)
 * query: 'string', // Query to send to the server or locally filter specified {data}
 * remoteFilter: true | false, // Whether to filter remotely or locally
 * remoteSort: true | false, // Whether to sort remotely or locally
 * pageSize: 25, // Number of items per page
 * filter: { array_of_filters },
 * sorter: { array_of_sorters },
 * groupField: 'string' // Field to group by. If specified, store is responsible for properly sorting by groupField
 * action: 'string', // Action API action name
 * }
 *
 * @type {OOJSPlus.ui.data.store.Store}
 */
OOJSPlus.ui.data.store.RemoteStore = function ( cfg ) {
	this.action = cfg.action || {};
	this.total = 0;
	this.api = new mw.Api();

	OOJSPlus.ui.data.store.RemoteStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.RemoteStore, OOJSPlus.ui.data.store.Store );

OOJSPlus.ui.data.store.RemoteStore.prototype.doLoadData = function () {
	const dfd = $.Deferred();
	this.api.abort();
	const data = {
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
	this.api.get( data ).done( ( response ) => {
		if ( response.hasOwnProperty( 'results' ) ) {
			this.total = response.total;
			dfd.resolve( this.indexData( response.results ) );
		}
	} ).fail( ( e ) => {
		dfd.reject( e );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.setData = function ( data ) { // eslint-disable-line no-unused-vars
	throw new Error( 'Cannot set data of a remote store' );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getFiltersForRemote = function () {
	const filters = [];
	for ( const field in this.filters ) {
		if ( !this.filters.hasOwnProperty( field ) ) {
			continue;
		}
		filters.push(
			Object.assign( {}, this.filters[ field ].getValue(), { property: field } )
		);
	}

	return JSON.stringify( filters );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getSortForRemote = function () {
	const sorters = [];
	for ( const field in this.sorters ) {
		if ( !this.sorters.hasOwnProperty( field ) ) {
			continue;
		}
		sorters.unshift(
			Object.assign( {}, this.sorters[ field ].getValue(), { property: field } )
		);
	}

	return JSON.stringify( sorters );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getTotal = function () {
	return this.total;
};

OOJSPlus.ui.data.store.RemoteStore.prototype.loadAll = function( chunk ) {
	chunk = chunk || 50;

	var oldLimit = this.limit;
	var oldOffset = this.offset;
	this.limit = chunk;
	this.offset = 0;

	var dfd = $.Deferred();
	// Load recursively until all data is loaded
	this.loadRecursively( dfd ).done( function( data ) {
		this.limit = oldLimit;
		this.offset = oldOffset;
		dfd.resolve( data );
	}.bind( this ) );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.loadRecursively = function( dfd, prevLength ) {
	this.load().done( function( data ) {
		var resCount = Object.keys( data ).length;
		if ( resCount < this.limit || ( prevLength && resCount === prevLength ) ) {
			dfd.resolve( data );
		} else {
			this.offset += this.limit;
			this.loadRecursively( dfd, resCount );
		}
	}.bind( this ) ).fail( function( e ) {
		dfd.reject( e );
	} );
	return dfd.promise();
};
