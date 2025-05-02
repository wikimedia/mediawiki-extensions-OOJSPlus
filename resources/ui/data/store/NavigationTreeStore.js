OOJSPlus.ui.data.store.NavigationTreeStore = function ( cfg ) {
	cfg =  cfg || {};
	cfg.request = null;
	OOJSPlus.ui.data.store.NavigationTreeStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.NavigationTreeStore, OOJSPlus.ui.data.store.RemoteRestStore );

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.doLoadData = function () {
	const dfd = $.Deferred(),
		data = this.getRequestData();

	this.request = $.ajax( {
		method: 'GET',
		url: mw.util.wikiScript( 'rest' ) + '/' + this.path,
		data: data,
		contentType: 'application/json',
		dataType: 'json',
		beforeSend: function () {
			if ( this.request ) {
				this.request.abort();
			}
		}.bind( this )
	} ).done( ( response ) => {
		this.request = null;
		// eslint-disable-next-line no-prototype-builtins
		if ( response.hasOwnProperty( 'results' ) ) {
			this.total = response.total;
			dfd.resolve( this.indexData( response.results ) );
			return;
		}
		dfd.reject();
	} ).fail( ( jgXHR, type, status ) => {
		this.request = null;
		dfd.reject( { type: type, status: status } );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getRequestData = function () {
	return {
		start: this.offset,
		limit: this.limit,
		filter: this.getFiltersForRemote(),
		query: this.getQuery(),
		sort: this.getSortForRemote(),
		node: this.node,
		'expand-paths': this.getExpandPathsForRemote()
	};
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getFiltersForRemote = function () {
	if ( this.filters.length > 0 ) {
		return JSON.stringify( this.filters );
	}
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getSortForRemote = function () {
	return JSON.stringify( [ { property: 'name', direction: 'ASC' } ] );
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getExpandPathsForRemote = function () {
	return JSON.stringify( this.expandPaths );
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getExpandedPath = function ( pageName, expandPaths ) {
	this.node = pageName;
	this.filters = [];
	this.limit = 999;
	this.offset = 0;
	this.expandPaths = expandPaths;

	return this.reload();
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.getSubElements = function ( pageName ) {
	this.node = pageName;
	this.filters = [];
	this.limit = 999;
	this.offset = 0;
	this.expandPaths = [];

	return this.reload();
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.reload = function () {
	this.data = {};
	const loadPromise = this.load();
	loadPromise.done( ( data ) => {
		this.emit( 'reload', data );
	} );

	return loadPromise;
};
