( function ( mw, $ ) {
	OOJSPlus.ui.data.NavigationTree = function ( cfg ) {
		cfg = cfg || {};
		cfg.classes = [ 'oojsplus-data-navigation-tree' ];
		cfg.allowDeletions = false;
		cfg.allowAdditions = false;
		cfg.data = this.prepareData ( cfg.data );
		cfg.fixed = true;

		OOJSPlus.ui.data.NavigationTree.super.call( this, cfg );

		this.store = cfg.store;
	};

	OO.inheritClass( OOJSPlus.ui.data.NavigationTree, OOJSPlus.ui.data.Tree );

	OOJSPlus.ui.data.NavigationTree.prototype.build = function ( data, lvl ) {
		const nodes = {};
		lvl = lvl || 0;
		for ( let i = 0; i < data.length; i++ ) {
			const item = data[ i ];
			let isLeaf = true;
			let expanded = false;

			// eslint-disable-next-line no-prototype-builtins
			if ( ( item.hasOwnProperty( 'leaf' ) && item.leaf === false ) &&
				// eslint-disable-next-line no-prototype-builtins
				( item.hasOwnProperty( 'children' ) && item.children.length > 0 )
			) {
				isLeaf = false;
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
		return new OOJSPlus.ui.data.tree.NavigationTreeItem( Object.assign( {}, {
			level: lvl,
			leaf: isLeaf,
			tree: this,
			labelledby: labelledby,
			expanded: expanded,
			style: this.style
		}, item ) );
	};

	OOJSPlus.ui.data.NavigationTree.prototype.expandNode = function ( name ) {
		const node = this.getItem( name );
		if ( !node ) {
			return;
		}

		const $element = node.$element.find( '> ul.tree-node-list' );
		if ( $( $element[ 0 ] ).children().length === 0 ) {
			this.store.getSubElements( node.elementId ).done( ( result ) => {
				const $ul = $( '<ul>' ).addClass( 'tree-node-list' );
				const data = this.prepareData( result );
				const nodes = this.build( data, node.level + 1 );

				for ( const nodeElement in nodes ) {
					// eslint-disable-next-line no-prototype-builtins
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
					node.$element.append( $ul )
				}
			} );
		} else {
			$( $element ).show();
		}
	};

	OOJSPlus.ui.data.NavigationTree.prototype.prepareData = function ( pages ) {
		const data = [];
		for ( const i in pages ) {
			const title = pages[ i ].title.split( '/' );
			let label = title[ title.length - 1 ];
			const classes = [];

			if ( pages[ i ].title === mw.config.get( 'wgPageName' ) ) {
				classes.push( 'active' );
			}

			if ( pages[ i ].leaf ) {
				classes.push( 'leaf' );
			}

			if ( pages[ i ].label ) {
				label = pages[ i ].label
			}

			// eslint-disable-next-line mediawiki/class-doc
			const entry = {
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
