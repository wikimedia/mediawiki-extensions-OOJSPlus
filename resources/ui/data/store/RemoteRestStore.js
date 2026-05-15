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
 * path: 'string', // REST API path (to be appended to {wiki/rest.php )
 * }
 *
 * @type {OOJSPlus.ui.data.store.Store}
 */
OOJSPlus.ui.data.store.RemoteRestStore = function ( cfg ) {
	this.path = cfg.path;
	this.request = null;
	this.buckets = {};

	OOJSPlus.ui.data.store.RemoteRestStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.RemoteRestStore, OOJSPlus.ui.data.store.RemoteStore );

OOJSPlus.ui.data.store.RemoteRestStore.prototype.doLoadData = function () {
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
		if ( response.hasOwnProperty( 'results' ) ) {
			this.total = response.total;
			this.buckets = response.buckets || {};
			dfd.resolve( this.indexData( response.results ) );
			return;
		}
		dfd.reject();
	} ).fail( ( jgXHR, type, status ) => {
		this.request = null;
		dfd.reject( { xhr: jgXHR, type: type, status: status } );
	} );

	return dfd.promise();
};

OOJSPlus.ui.data.store.RemoteRestStore.prototype.getRequestData = function () {
	return {
		start: this.offset,
		limit: this.limit,
		filter: this.getFiltersForRemote(),
		query: this.getQuery(),
		sort: this.getSortForRemote()
	};
};

OOJSPlus.ui.data.store.RemoteRestStore.prototype.getBuckets = function () {
	return this.buckets;
};
