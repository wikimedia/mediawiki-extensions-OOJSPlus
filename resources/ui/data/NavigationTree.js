( function ( mw, $ ) {
	const ItemAction = OOJSPlus.ui.data.NavigationTree && OOJSPlus.ui.data.NavigationTree.ItemAction ?
		OOJSPlus.ui.data.NavigationTree.ItemAction : null;

	OOJSPlus.ui.data.NavigationTree = function ( cfg ) {
		cfg = cfg || {};
		cfg.classes = [ 'oojsplus-data-navigation-tree' ];
		cfg.allowDeletions = false;
		cfg.allowAdditions = false;
		cfg.data = this.prepareData( cfg.data );
		cfg.fixed = true;
		this.localStorageKey = cfg.localStorageKey || 'navigation-tree';
		this.stateful = cfg.stateful || false;
		this.maxLevel = cfg.hasOwnProperty( 'maxLevel' ) ? cfg.maxLevel : 9;
		this.itemActions = cfg.itemActions || [];

		OOJSPlus.ui.data.NavigationTree.super.call( this, cfg );

		this.store = cfg.store;
	};

	OO.inheritClass( OOJSPlus.ui.data.NavigationTree, OOJSPlus.ui.data.Tree );
	if ( ItemAction ) {
		OOJSPlus.ui.data.NavigationTree.ItemAction = ItemAction;
	}

	OOJSPlus.ui.data.NavigationTree.prototype.build = function ( data, lvl ) {
		const nodes = {};
		lvl = lvl || 0;
		for ( let i = 0; i < data.length; i++ ) {
			const item = data[ i ];
			let isLeaf = true;
			let expanded = false;

			if ( ( item.hasOwnProperty( 'leaf' ) && item.leaf === false ) &&
				lvl < this.maxLevel
			) {
				isLeaf = false;
			}
			if ( item.hasOwnProperty( 'children' ) && item.children.length > 0 ) {
				expanded = true;
			}

			const widget = this.createItemWidget( item, lvl, isLeaf,
				this.idGenerator.generate(), expanded );
			widget.connect( this, {
				selected: function ( element ) {
					this.setSelected( element );
				}
			} );

			// eslint-disable-next-line es-x/no-array-prototype-flat
			this.flat[ widget.getName() ] = widget;
			nodes[ widget.getName() ] = {
				widget: widget,
				children: !isLeaf ? this.build( item.children || [], lvl + 1 ) : {}
			};
		}

		return nodes;
	};

	OOJSPlus.ui.data.NavigationTree.prototype.createItemWidget = function (
		item, lvl, isLeaf, labelledby, expanded ) {
		return new OOJSPlus.ui.data.tree.NavigationTreeItem( Object.assign( {}, item, {
			level: lvl,
			leaf: isLeaf,
			tree: this,
			labelledby: labelledby,
			expanded: expanded,
			style: this.style
		} ) );
	};

	OOJSPlus.ui.data.NavigationTree.prototype.expandNode = function ( name ) {
		const node = this.getItem( name );
		if ( !node ) {
			return;
		}

		const $element = node.$element.find( '> ul.tree-node-list' );
		if ( $( $element[ 0 ] ).children().length === 0 ) {
			const skeleton = new OOJSPlus.ui.widget.SkeletonWidget( {
				variant: 'list',
				rows: 3,
				visible: true
			} );
			node.$element.append( skeleton.$element );
			node.$element.attr( 'aria-busy', true );

			this.store.getSubElements( node.elementId ).done( ( result ) => {
				const $ul = $( '<ul>' ).addClass( 'tree-node-list' );
				const data = this.prepareData( result );
				const nodes = this.build( data, node.level + 1 );

				for ( const nodeElement in nodes ) {

					if ( !nodes.hasOwnProperty( nodeElement ) ) {
						continue;
					}
					const $li = nodes[ nodeElement ].widget.$element;
					const $labelEl = $( $li ).find( '> div > .oojsplus-data-tree-label' );
					const itemId = $labelEl.attr( 'id' );
					$li.append( this.doDraw( nodes[ nodeElement ].children || {},
						nodes[ nodeElement ].widget, itemId, this.expanded ) );
					$( $ul ).append( $li );
					this.reEvaluateParent( nodeElement );
					node.$element.append( $ul );
				}
				skeleton.hide();
				node.$element.removeAttr( 'aria-busy' );
			} );
		} else {
			$( $element ).show();
		}
	};

	OOJSPlus.ui.data.NavigationTree.prototype.getItemActions = function () {
		return this.itemActions;
	};

	OOJSPlus.ui.data.NavigationTree.prototype.setItemActions = function ( actions ) {
		this.itemActions = Array.isArray( actions ) ? actions : [];
		this.refreshItemActions();
	};

	OOJSPlus.ui.data.NavigationTree.prototype.addItemAction = function ( action ) {
		if ( !action ) {
			return;
		}
		this.itemActions.push( action );
		this.refreshItemActions();
	};

	OOJSPlus.ui.data.NavigationTree.prototype.removeItemAction = function ( actionName ) {
		this.itemActions = this.itemActions.filter( ( action ) => {
			if ( !action ) {
				return false;
			}
			if ( action === actionName ) {
				return false;
			}
			if ( typeof action.getName === 'function' ) {
				return action.getName() !== actionName;
			}
			return true;
		} );
		this.refreshItemActions();
	};

	OOJSPlus.ui.data.NavigationTree.prototype.refreshItemActions = function () {
		for ( const name in this.flat ) { // eslint-disable-line es-x/no-array-prototype-flat
			if ( !this.flat.hasOwnProperty( name ) ) { // eslint-disable-line es-x/no-array-prototype-flat
				continue;
			}
			this.flat[ name ].renderItemActions(); // eslint-disable-line es-x/no-array-prototype-flat
		}
	};

	OOJSPlus.ui.data.NavigationTree.prototype.prepareData = function ( pages ) {
		const data = [];
		let visitedPage = mw.config.get( 'wgPageName' );
		if ( mw.config.get( 'wgCanonicalNamespace' ) === '' ) {
			visitedPage = ':' + visitedPage;
		}
		for ( const i in pages ) {
			const title = pages[ i ].title.split( '/' );
			let label = title[ title.length - 1 ];
			const classes = [];
			if ( pages[ i ].id === visitedPage ) {
				classes.push( 'active' );
			}

			if ( pages[ i ].leaf ) {
				classes.push( 'leaf' );
			}

			if ( pages[ i ].display_title ) {
				label = pages[ i ].display_title;
			}

			if ( pages[ i ].label ) {
				label = pages[ i ].label;
			}

			const entry = { // eslint-disable-line mediawiki/class-doc
				id: pages[ i ].id,
				title: pages[ i ].prefixed,
				name: pages[ i ].id,
				href: pages[ i ].url,
				leaf: pages[ i ].leaf,
				label: label,
				exists: pages[ i ].exists,
				classes: classes
			};
			if ( pages[ i ].children.length > 0 ) {
				entry.children = this.prepareData( pages[ i ].children );
				entry.expanded = true;
			}
			data.push( entry );
		}
		return data;
	};

}( mediaWiki, jQuery ) );
