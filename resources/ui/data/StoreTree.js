( function( mw, $ ) {
	OOJSPlus.ui.data.StoreTree = function( cfg ) {
		cfg = cfg || {};
		cfg.allowDeletions = false;
		cfg.allowAdditions = false;
		cfg.fixed = true;
		cfg.data = [];

		OOJSPlus.ui.data.StoreTree.parent.call( this, cfg );

		this.loadedNodes = [];
		this.api = new mw.Api();
		this.storeAction = cfg.store.action;
		this.loaded = false;
		this.load( cfg.store.rootNode ).done( function( data ) {
			this.data = data;
			this.loaded = true;
			this.draw( this.build( this.data ) );
			this.emit( 'loaded' );
		}.bind( this ) ).fail( function( response ) {
			this.emit( 'load-fail', response );
		}.bind( this ) );
	};

	OO.inheritClass( OOJSPlus.ui.data.StoreTree, OOJSPlus.ui.data.Tree );

	/** Build structure from data */
	OOJSPlus.ui.data.StoreTree.prototype.build = function( data, lvl ) {
		if ( this.loaded ) {
			return OOJSPlus.ui.data.StoreTree.parent.prototype.build.call( this, data, lvl );
		}
	};

	/** Generate HTML */
	OOJSPlus.ui.data.StoreTree.prototype.draw = function( nodes ) {
		if ( this.loaded ) {
			OOJSPlus.ui.data.StoreTree.parent.prototype.draw.call( this, nodes, this.labelledby );
		}
	};

	OOJSPlus.ui.data.StoreTree.prototype.expandNode = function( name ) {
		OOJSPlus.ui.data.StoreTree.parent.prototype.expandNode.call( this, name );
		this.emit( 'collapse-expand' );
	};

	OOJSPlus.ui.data.StoreTree.prototype.collapseNode = function( name ) {
		OOJSPlus.ui.data.StoreTree.parent.prototype.collapseNode.call( this, name );
		this.emit( 'collapse-expand' );
	};

	OOJSPlus.ui.data.StoreTree.prototype.assertNodeLoaded = function( name ) {
		var item = this.getItem( name ),
			dfd = $.Deferred();

		if ( !item ) {
			dfd.reject();
		} else if ( item.isLeaf ) {
			dfd.resolve();
		} else {
			if ( this.loadedNodes.indexOf( name ) !== -1 ) {
				dfd.resolve();
			} else {
				this.load( name ).done( function( data ) {
					for ( var i = 0; i < data.length; i++ ) {
						this.addSubnodeWithData( data[i], name );
					}
					dfd.resolve();
				}.bind( this ) ).fail( function() {
					dfd.reject();
				} );
			}
		}

		return dfd.promise();
	};

	OOJSPlus.ui.data.StoreTree.prototype.load = function( node ) {
		var dfd = $.Deferred();

		this.api.abort();
		this.api.get( {
			action: this.storeAction,
			node: node
		} ).done( function( rawData ) {
			this.loadedNodes.push( node );
			dfd.resolve( this.parseData( rawData ) );
		}.bind( this ) ).fail( function( response ) {
			dfd.reject( response );
		} );

		return dfd.promise();
	};

	OOJSPlus.ui.data.StoreTree.prototype.parseData = function( rawData ) {
		var data = [];
		for ( var i = 0; i < rawData.results.length; i++ ) {
			var item = rawData.results[i];
			data.push( {
				name: item.id,
				label: item.text,
				leaf: item.leaf
			} );
		}

		return data;
	};

} )( mediaWiki, jQuery );
