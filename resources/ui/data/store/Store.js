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
 * }
 *
 * @type {OOJSPlus.ui.data.store.Store}
 */
OOJSPlus.ui.data.store.Store = function ( cfg ) {
	OO.EventEmitter.call( this );
	this.autoLoad = typeof cfg.autoLoad === 'undefined' ? true : !!cfg.autoLoad;
	this.originalData = cfg.data || [];
	this.data = {};
	this.queryString = cfg.query || '';
	this.groupField = cfg.groupField || null;
	this.filters = this.filtersFromData( cfg.filter || {} );
	this.sorters = {};
	const sorters = cfg.sorter || {};
	for ( const sortField in sorters ) {
		if ( !sorters.hasOwnProperty( sortField ) ) {
			continue;
		}
		if ( sorters[ sortField ] instanceof OOJSPlus.ui.data.sorter.Sorter ) {
			this.sorters[ sortField ] = sorters[ sortField ];
		} else if ( !$.isEmptyObject( sorters[ sortField ] ) ) {
			this.sorters[ sortField ] = new OOJSPlus.ui.data.sorter.Sorter( sorters[ sortField ] );
		}
	}
	this.remoteFilter = typeof cfg.remoteFilter === 'undefined' ? true : !!cfg.remoteFilter;
	this.remoteSort = typeof cfg.remoteSort === 'undefined' ? true : !!cfg.remoteSort;

	this.offset = 0;
	this.limit = cfg.pageSize || 25;
};

OO.initClass( OOJSPlus.ui.data.store.Store );
OO.mixinClass( OOJSPlus.ui.data.store.Store, OO.EventEmitter );

OOJSPlus.ui.data.store.Store.prototype.load = function () {
	const dfd = $.Deferred();
	this.emit( 'loading' );
	this.doLoadData().done( ( data ) => {
		this.data = Object.assign( {}, this.data, data );
		this.emit( 'loaded', this.data );
		dfd.resolve( this.data );
	} ).fail( ( e ) => {
		this.emit( 'loadFailed', e );
		dfd.reject( e );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.Store.prototype.reload = function () {
	this.data = {};
	this.offset = 0;
	const loadPromise = this.load();
	loadPromise.done( ( data ) => {
		this.emit( 'reload', data );
	} );

	return loadPromise;
};

OOJSPlus.ui.data.store.Store.prototype.doLoadData = function () {
	let data = this.filterIfLocal( this.originalData.concat( [] ) );
	data = this.sortIfLocal( data );
	return $.Deferred().resolve( this.indexData( data ) ).promise();
};

OOJSPlus.ui.data.store.Store.prototype.setData = function ( data ) {
	this.data = {};
	this.originalData = data;
	this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.getData = function () {
	return this.data;
};

OOJSPlus.ui.data.store.Store.prototype.filterIfLocal = function ( data ) {
	if ( !this.remoteFilter && !$.isEmptyObject( this.filters ) ) {
		return this.localFilter( data );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.sortIfLocal = function ( data ) {
	if ( !this.remoteSort && !$.isEmptyObject( this.sorters ) ) {
		return this.localSort( data );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.indexData = function ( data ) {
	const indexed = {},
		initIndex = $.isEmptyObject( this.data ) ? -1 : Math.max( ...Object.keys( this.data ) );
	for ( let i = 0; i < data.length; i++ ) {
		indexed[ i + initIndex + 1 ] = data[ i ];
	}

	return indexed;
};

OOJSPlus.ui.data.store.Store.prototype.getTotal = function () {
	return Object.values( this.data ).length;
};

OOJSPlus.ui.data.store.Store.prototype.getData = function () {
	return this.data;
};

OOJSPlus.ui.data.store.Store.prototype.getPageSize = function () {
	return this.limit;
};

OOJSPlus.ui.data.store.Store.prototype.setPageSize = function ( limit ) {
	this.limit = limit;
};

OOJSPlus.ui.data.store.Store.prototype.setOffset = function ( offset ) {
	this.offset = offset;
};

OOJSPlus.ui.data.store.Store.prototype.getFilters = function () {
	return this.filters;
};

OOJSPlus.ui.data.store.Store.prototype.localFilter = function ( data ) {
	const newData = [];
	let matches = true;
	for ( let i = 0; i < data.length; i++ ) {
		matches = true;
		for ( const field in this.filters ) {
			if ( matches === false ) {
				continue;
			}
			if ( !this.filters.hasOwnProperty( field ) ) {
				continue;
			}
			if ( !this.filters[ field ].matches( data[ i ][ field ] ) ) {
				matches = false;
			}
		}
		if ( matches ) {
			newData.push( data[ i ] );
		}
	}

	return newData;
};

OOJSPlus.ui.data.store.Store.prototype.localSort = function ( data ) {
	for ( const field in this.sorters ) {
		if ( !this.sorters.hasOwnProperty( field ) ) {
			continue;
		}
		data = this.sorters[ field ].sort( data, field );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.multiFilter = function ( data ) {
	const filters = this.filtersFromData( data );
	for ( const field in filters ) {
		if ( !filters.hasOwnProperty( field ) ) {
			continue;
		}
		if ( !filters[ field ].getValue() ) {
			if ( this.filters.hasOwnProperty( field ) ) {
				delete ( this.filters[ field ] );
			}
		} else {
			this.filters[ field ] = filters[ field ];
		}
	}

	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.filter = function ( filter, field ) {
	if ( !filter || !filter.getValue() ) {
		if ( this.filters.hasOwnProperty( field ) ) {
			delete ( this.filters[ field ] );
		}
	} else {
		this.filters[ field ] = filter;
	}
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.query = function ( query ) {
	this.queryString = query;
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.getQuery = function () {
	return this.queryString;
};

OOJSPlus.ui.data.store.Store.prototype.clearQuery = function () {
	this.queryString = '';
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.clearFilters = function () {
	this.filters = {};
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.filtersFromData = function ( data ) {
	const result = {};
	for ( const filterField in data ) {
		if ( !data.hasOwnProperty( filterField ) ) {
			continue;
		}
		if ( data[ filterField ] instanceof OOJSPlus.ui.data.filter.Filter ) {
			result[ filterField ] = data[ filterField ];
		} else if ( !$.isEmptyObject( data[ filterField ] ) ) {
			const filterFactory = new OOJSPlus.ui.data.FilterFactory();
			result[ filterField ] = filterFactory.makeFilter( data[ filterField ] );
		}
	}

	return result;
};

OOJSPlus.ui.data.store.Store.prototype.sort = function ( sorter, field ) {
	if ( !sorter ) {
		if ( this.sorters.hasOwnProperty( field ) ) {
			delete ( this.sorters[ field ] );
		}
	} else {
		this.sorters[ field ] = sorter;
	}
	return this.reload();
};
