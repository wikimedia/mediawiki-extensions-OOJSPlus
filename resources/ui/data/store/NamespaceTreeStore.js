OOJSPlus.ui.data.store.NamespaceTreeStore = function ( cfg ) {
	cfg = cfg || {};
	cfg.request = null;
	this.sessionCacheKey = cfg.sessionCacheKey || null;
	OOJSPlus.ui.data.store.NamespaceTreeStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.NamespaceTreeStore, OOJSPlus.ui.data.store.NavigationTreeStore );

OOJSPlus.ui.data.store.NamespaceTreeStore.prototype.getSubElements = function ( pageName ) {
	if ( this.sessionCacheKey ) {
		const session = require( 'mediawiki.storage' ).session;
		const cache = this.getNodeCache( session );
		if ( cache[ pageName ] !== undefined ) {
			return $.Deferred().resolve( cache[ pageName ] ).promise();
		}
		this.node = pageName;
		this.filters = [];
		this.limit = -1;
		this.offset = 0;
		this.expandPaths = [];
		const dfd = $.Deferred();
		this.reload().done( ( data ) => {
			// indexData() returns a numerically indexed object — normalize to array.
			const normalized = Object.values( data );
			this.setNodeCache( session, pageName, normalized );
			dfd.resolve( normalized );
		} ).fail( dfd.reject.bind( dfd ) );
		return dfd.promise();
	}

	return OOJSPlus.ui.data.store.NamespaceTreeStore.parent.prototype.getSubElements.call( this, pageName );
};

OOJSPlus.ui.data.store.NamespaceTreeStore.prototype.getNodeCache = function ( session ) {
	return session.getObject( this.sessionCacheKey + '-nodes' ) || {};
};

OOJSPlus.ui.data.store.NamespaceTreeStore.prototype.setNodeCache = function ( session, pageId, children ) {
	const cache = this.getNodeCache( session );
	cache[ pageId ] = children;
	session.setObject( this.sessionCacheKey + '-nodes', cache );
};

OOJSPlus.ui.data.store.NamespaceTreeStore.prototype.getRequestData = function () {
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

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.loadNS = function ( nsId, expandPaths ) {
	this.filters = [ {
		operator: 'eq',
		value: nsId,
		property: 'namespace',
		type: 'numeric'
	} ];
	this.limit = -1;
	this.offset = 0;
	this.expandPaths = expandPaths;

	return this.reload();
};

OOJSPlus.ui.data.store.NavigationTreeStore.prototype.queryPagesInNS = function ( nsId, search ) {
	this.filters = [
		{
			operator: 'eq',
			value: nsId,
			property: 'namespace',
			type: 'numeric'
		}
	];
	this.node = '';
	return this.query( search );
};
