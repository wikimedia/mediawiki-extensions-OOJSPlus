OOJSPlus.ui.data.store.Store = function ( cfg ) {
	OO.EventEmitter.call( this );
	this.autoLoad = typeof cfg.autoLoad === 'undefined' ? true : !!cfg.autoLoad;
	this.originalData = cfg.data || [];
	this.data = {};
	this.queryString = cfg.query || '';
	this.filters = {};
	var filters = cfg.filter || {};
	for ( var filterField in filters ) {
		if ( !filters.hasOwnProperty( filterField ) ) {
			continue;
		}
		if ( filters[filterField] instanceof OOJSPlus.ui.data.filter.Filter ) {
			this.filters[filterField] = filters[filterField];
		} else if ( !$.isEmptyObject( filters[filterField] ) ) {
			var filterFactory = new OOJSPlus.ui.data.FilterFactory();
			this.filters[filterField] = filterFactory.makeFilter( filters[filterField] );
		}
	}
	this.sorters = {};
	var sorters = cfg.sorter || {};
	for ( var sortField in sorters ) {
		if ( !sorters.hasOwnProperty( sortField ) ) {
			continue;
		}
		if ( sorters[sortField] instanceof OOJSPlus.ui.data.sorter.Sorter ) {
			this.sorters[sortField] = sorters[sortField];
		} else if ( !$.isEmptyObject( sorters[sortField] ) ) {
			this.sorters[sortField] = new OOJSPlus.ui.data.sorter.Sorter( sorters[sortField] );
		}
	}
	this.remoteFilter = typeof cfg.remoteFilter === 'undefined' ? true : !!cfg.remoteFilter;
	this.remoteSort = typeof cfg.remoteSort === 'undefined' ? true : !!cfg.remoteSort;

	this.offset = 0;
	this.limit = cfg.pageSize || 25;
};

OO.initClass( OOJSPlus.ui.data.store.Store );
OO.mixinClass( OOJSPlus.ui.data.store.Store, OO.EventEmitter );

OOJSPlus.ui.data.store.Store.prototype.load = function() {
	var dfd = $.Deferred();
	this.emit( 'loading' );
	this.doLoadData().done( function( data ) {
		this.data = $.extend( {}, this.data, data );
		this.emit( 'loaded', this.data );
		dfd.resolve( this.data );
	}.bind( this ) ).fail( function( e ) {
		this.emit( 'loadFailed', e );
		dfd.reject( e );
	}.bind( this ) );

	return dfd.promise();
};

OOJSPlus.ui.data.store.Store.prototype.reload = function() {
	this.data = {};
	this.offset = 0;
	var loadPromise = this.load();
	loadPromise.done( function( data ) {
		this.emit( 'reload', data );
	}.bind( this ) );

	return loadPromise;
};

OOJSPlus.ui.data.store.Store.prototype.doLoadData = function() {
	var data = this.filterIfLocal( this.originalData.concat( [] ) );
	data = this.sortIfLocal( data );
	return $.Deferred().resolve( this.indexData( data ) ).promise();
};

OOJSPlus.ui.data.store.Store.prototype.setData = function( data ) {
	this.data = {};
	this.originalData = data;
	this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.getData = function() {
	return this.data;
};

OOJSPlus.ui.data.store.Store.prototype.filterIfLocal = function( data ) {
	if ( !this.remoteFilter && !$.isEmptyObject( this.filters ) ) {
		return this.localFilter( data );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.sortIfLocal = function( data ) {
	if ( !this.remoteSort && !$.isEmptyObject( this.sorters ) ) {
		return this.localSort( data );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.indexData = function( data ) {
	var indexed = {},
		initIndex = $.isEmptyObject( this.data ) ? -1 : Math.max( ...Object.keys( this.data ) );
	for ( var i = 0; i < data.length; i++ ) {
		indexed[i + initIndex + 1 ] = data[i];
	}

	return indexed;
};

OOJSPlus.ui.data.store.Store.prototype.getTotal = function() {
	return Object.values( this.data ).length;
};

OOJSPlus.ui.data.store.Store.prototype.getData = function() {
	return this.data;
};

OOJSPlus.ui.data.store.Store.prototype.getPageSize = function() {
	return this.limit;
};

OOJSPlus.ui.data.store.Store.prototype.setOffset = function( offset ) {
	this.offset = offset;
};

OOJSPlus.ui.data.store.Store.prototype.getFilters = function() {
	return this.filters;
};

OOJSPlus.ui.data.store.Store.prototype.localFilter = function( data ) {
	var newData = [], matches = true;
	for ( var i = 0; i < data.length; i++ ) {
		matches = true;
		for ( var field in this.filters ) {
			if ( matches === false ) {
				continue;
			}
			if ( !this.filters.hasOwnProperty( field ) ) {
				continue;
			}
			if ( !this.filters[field].matches( data[i][field] ) )  {
				matches = false;
			}
		}
		if ( matches ) {
			newData.push( data[i] );
		}
	}

	return newData;
};

OOJSPlus.ui.data.store.Store.prototype.localSort = function( data ) {
	for ( var field in this.sorters ) {
		if ( !this.sorters.hasOwnProperty( field ) ) {
			continue;
		}
		data = this.sorters[field].sort( data, field );
	}
	return data;
};

OOJSPlus.ui.data.store.Store.prototype.filter = function( filter, field ) {
	if ( !filter.getValue() ) {
		if ( this.filters.hasOwnProperty( field ) ) {
			delete( this.filters[field] );
		}
	} else {
		this.filters[field] = filter;
	}
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.query = function( query ) {
	this.queryString = query;
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.getQuery = function() {
	return this.queryString;
};

OOJSPlus.ui.data.store.Store.prototype.clearQuery = function() {
	this.queryString = '';
	return this.reload();
};

OOJSPlus.ui.data.store.Store.prototype.clearFilters = function() {
	this.filters = {};
	return this.reload();
};


OOJSPlus.ui.data.store.Store.prototype.sort = function( sorter, field ) {
	if ( !sorter ) {
		if ( this.sorters.hasOwnProperty( field ) ) {
			delete( this.sorters[field] );
		}
	} else {
		this.sorters[field] = sorter;
	}
	return this.reload();
};
