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
 * cacheResults: bool // If true, primary results will be cached. Default: false
 * }
 *
 * @type {OOJSPlus.ui.data.store.Store}
 */
OOJSPlus.ui.data.store.RemoteStore = function ( cfg ) {
	this.action = cfg.action || {};
	this.total = 0;
	this.api = new mw.Api();
	this.totalApproximated = false;
	this.continue = null;
	this.nextContinue = null;
	this.cacheResults = cfg.cacheResults || false;
	this.queryId = cfg.queryId || null;

	OOJSPlus.ui.data.store.RemoteStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.RemoteStore, OOJSPlus.ui.data.store.Store );

OOJSPlus.ui.data.store.RemoteStore.prototype.doLoadData = function () {
	const dfd = $.Deferred();
	this.api.abort();

	this.api.get( this.getRequestData() ).done( ( response ) => {
		if ( response.hasOwnProperty( 'results' ) ) {
			dfd.resolve( this.processResponse( response ) );
		}
	} ).fail( ( e ) => {
		dfd.reject( e );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.getRequestData = function () {
	const data = {
		action: this.action,
		start: this.offset,
		limit: this.limit,
		filter: this.getFiltersForRemote(),
		query: this.getQuery(),
		sort: this.getSortForRemote()
	};
	if ( this.continue ) {
		data.continue = JSON.stringify( this.continue );
	}
	if ( this.groupField ) {
		data.group = JSON.stringify( { property: this.groupField, direction: 'ASC' } );
	}
	if ( !this.cacheResults ) {
		data[ 'no-cache' ] = 1;
	}
	if ( this.cacheResults && this.queryId ) {
		data[ 'query-id' ] = this.queryId;
	}
	return data;
};

OOJSPlus.ui.data.store.RemoteStore.prototype.processResponse = function ( response ) {
	this.total = response.total;
	this.totalApproximated = !!response.total_approximate;
	this.nextContinue = response.continue || null;
	this.queryId = response.query_id || null;
	if ( !this.suppressEvents ) {
		this.emit( 'metadataChange', {
			total: this.total,
			continue: response.continue || null,
			totalApproximated: this.totalApproximated,
			pageSize: this.limit,
			queryId: this.queryId
		} );
	}
	return this.indexData( response.results );
};

OOJSPlus.ui.data.store.RemoteStore.prototype.setData = function () {
	throw new Error( 'Cannot set data of a remote store' );
};

OOJSPlus.ui.data.store.Store.prototype.reloadNoCache = function () {
	// Will purge previous cache if any
	const origCache = this.cacheResults;
	this.cacheResults = false;
	const loadPromise = this.reload();
	this.cacheResults = origCache;
	return loadPromise;
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

OOJSPlus.ui.data.store.RemoteStore.prototype.loadAll = function ( chunk ) {
	chunk = chunk || 50;

	const oldLimit = this.limit;
	const oldOffset = this.offset;
	const oldContinue = this.continue || null;

	this.suppressEvents = true;
	this.limit = chunk;
	this.offset = 0;
	this.continue = [];

	const dfd = $.Deferred();
	// Load recursively until all data is loaded
	this.loadRecursively( dfd ).done( ( data ) => {
		this.limit = oldLimit;
		this.offset = oldOffset;
		this.continue = oldContinue;
		this.suppressEvents = false;
		dfd.resolve( data );
	} ).fail( () => {
		this.suppressEvents = false;
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.loadRecursively = function ( dfd, prevLength ) {
	this.load().done( ( data ) => {
		const resCount = Object.keys( data ).length;
		if ( resCount < this.limit || ( prevLength && resCount === prevLength ) ) {
			dfd.resolve( data );
		} else {
			this.offset += this.limit;
			this.continue = this.nextContinue;
			this.loadRecursively( dfd, resCount );
		}
	} ).fail( ( e ) => {
		dfd.reject( e );
	} );
	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteStore.prototype.setLimit = function ( limit ) {
	this.continue = null;
	OOJSPlus.ui.data.store.RemoteStore.parent.prototype.setLimit.call( this, limit );
};
