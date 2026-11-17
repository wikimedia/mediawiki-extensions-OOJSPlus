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
 * path: 'string', // REST API path (to be appended to {baseUrl} )
 * baseUrl: 'string' // Foreign REST API base URL (e.g. https://wiki.example.org/rest.php )
 * }
 *
 * @type {OOJSPlus.ui.data.store.Store}
 */
OOJSPlus.ui.data.store.ForeignRestRemoteStore = function ( cfg ) {
	this.baseUrl = cfg.baseUrl || mw.util.wikiScript( 'rest' );

	OOJSPlus.ui.data.store.ForeignRestRemoteStore.parent.call( this, cfg );
};

OO.inheritClass(
	OOJSPlus.ui.data.store.ForeignRestRemoteStore,
	OOJSPlus.ui.data.store.RemoteRestStore
);

OOJSPlus.ui.data.store.ForeignRestRemoteStore.prototype.getRequestUrl = function () {
	const baseUrl = this.baseUrl.replace( /\/+$/, '' );
	const path = String( this.path || '' ).replace( /^\/+/, '' );
	return `${ baseUrl }/${ path }`;
};
