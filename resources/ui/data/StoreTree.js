( function ( mw, $ ) {
	OOJSPlus.ui.data.StoreTree = function ( cfg ) {
		cfg = cfg || {};
		cfg.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : false;
		cfg.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : false;
		cfg.fixed = typeof cfg.fixed !== 'undefined' ? cfg.fixed : true;
		cfg.data = [];

		OOJSPlus.ui.data.StoreTree.parent.call( this, cfg );

		this.loadedNodes = [];
		this.api = new mw.Api();
		this.storeAction = cfg.store.action;
		this.loaded = false;
		this.load( cfg.store.rootNode ).done( ( data ) => {
			this.data = data;
			this.loaded = true;
			this.draw( this.build( this.data ) );
			this.emit( 'loaded' );
		} ).fail( ( response ) => {
			this.emit( 'load-fail', response );
		} );
	};

	OO.inheritClass( OOJSPlus.ui.data.StoreTree, OOJSPlus.ui.data.Tree );

	/**
	 * Build structure from data
	 *
	 * @param {Object[]} data
	 * @param {number} lvl
	 * @return {Object|undefined}
	 */
	OOJSPlus.ui.data.StoreTree.prototype.build = function ( data, lvl ) {
		if ( this.loaded ) {
			return OOJSPlus.ui.data.StoreTree.parent.prototype.build.call( this, data, lvl );
		}
	};

	/**
	 * Generate HTML
	 *
	 * @param {Object[]} nodes
	 */
	OOJSPlus.ui.data.StoreTree.prototype.draw = function ( nodes ) {
		if ( this.loaded ) {
			OOJSPlus.ui.data.StoreTree.parent.prototype.draw.call( this, nodes, this.labelledby );
		}
	};

	OOJSPlus.ui.data.StoreTree.prototype.expandNode = function ( name ) {
		OOJSPlus.ui.data.StoreTree.parent.prototype.expandNode.call( this, name );
		this.emit( 'collapse-expand' );
	};

	OOJSPlus.ui.data.StoreTree.prototype.addSubnodeWithData = function () {
		// This is not supported by StoreTree at the moment
	};

	OOJSPlus.ui.data.StoreTree.prototype.collapseNode = function ( name ) {
		OOJSPlus.ui.data.StoreTree.parent.prototype.collapseNode.call( this, name );
		this.emit( 'collapse-expand' );
	};

	OOJSPlus.ui.data.StoreTree.prototype.assertNodeLoaded = function ( name ) {
		const item = this.getItem( name ),
			dfd = $.Deferred();

		if ( !item ) {
			dfd.reject();
		} else if ( item.isLeaf ) {
			dfd.resolve();
		} else {
			if ( this.loadedNodes.indexOf( name ) !== -1 ) {
				dfd.resolve();
			} else {
				this.load( name ).done( ( data ) => {
					for ( let i = 0; i < data.length; i++ ) {
						this.addSubnodeWithData( data[ i ], name );
					}
					dfd.resolve();
				} ).fail( () => {
					dfd.reject();
				} );
			}
		}

		return dfd.promise();
	};

	OOJSPlus.ui.data.StoreTree.prototype.load = function ( node ) {
		const dfd = $.Deferred();

		this.api.abort();
		this.api.get( {
			action: this.storeAction,
			node: node
		} ).done( ( rawData ) => {
			this.loadedNodes.push( node );
			dfd.resolve( this.parseData( rawData ) );
		} ).fail( ( response ) => {
			dfd.reject( response );
		} );

		return dfd.promise();
	};

	OOJSPlus.ui.data.StoreTree.prototype.parseData = function ( rawData ) {
		const data = [];
		for ( let i = 0; i < rawData.results.length; i++ ) {
			const item = rawData.results[ i ];
			data.push( this.parseResultItem( item ) );
		}
		return data;
	};

	OOJSPlus.ui.data.StoreTree.prototype.parseResultItem = function ( item ) {
		const me = this;
		if ( item.items.length > 0 ) {
			item.items.forEach( function ( part, index ) {
				this[ index ] = me.parseResultItem( part );
			}, item.items );
		}
		return {
			name: item.id,
			label: item.text,
			leaf: item.leaf,
			items: item.items
		};
	};

}( mediaWiki, jQuery ) );
