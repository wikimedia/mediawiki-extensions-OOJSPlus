OOJSPlus.ui.data.store.RemoteRestStore = function ( cfg ) {
	this.path = cfg.path;
	this.request = null;

	OOJSPlus.ui.data.store.RemoteRestStore.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.store.RemoteRestStore, OOJSPlus.ui.data.store.RemoteStore );

OOJSPlus.ui.data.store.RemoteRestStore.prototype.doLoadData = function() {
	var dfd = $.Deferred(),
		data = {
			start: this.offset,
			limit: this.limit,
			filter: this.getFiltersForRemote(),
			query: this.getQuery(),
			sort: this.getSortForRemote()
		};

	this.request = $.ajax( {
		method: 'GET',
		url: mw.util.wikiScript( 'rest' ) + '/' + this.path,
		data: data,
		contentType: "application/json",
		dataType: 'json',
		beforeSend: function() {
			if ( this.request ) {
				this.request.abort();
			}
		}.bind( this )
	} ).done( function( response ) {
		this.request = null;
		if ( response.hasOwnProperty( 'results' ) ) {
			this.total = response.total;
			dfd.resolve( this.indexData( response.results ) );
			return;
		}
		dfd.reject();
	}.bind( this ) ).fail( function( jgXHR, type, status ) {
		this.request = null;
		dfd.reject( { type: type, status: status } );
	}.bind( this ) );

	return dfd.promise();
};
