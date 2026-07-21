( function ( mw ) {
	OOJSPlus.ui.data.tree.NavigationTreeItem = function ( cfg ) {
		cfg.style.IconExpand = 'next';
		cfg.style.IconCollapse = 'expand';
		cfg.classes = cfg.classes || [];
		if ( !cfg.exists ) {
			cfg.classes.push( 'new' );
		}
		this.exists = cfg.exists;
		OOJSPlus.ui.data.tree.NavigationTreeItem.parent.call( this, cfg );
		this.expanded = cfg.expanded;
		this.children = cfg.children || [];
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.NavigationTreeItem, OOJSPlus.ui.data.tree.Item );

	OOJSPlus.ui.data.tree.NavigationTreeItem.prototype.init = function () {
		this.$element.children().remove();
		this.$wrapper = $( '<div>' );
		this.addLabel();
		this.possiblyAddOptions();
		this.$element.addClass( 'oojs-ui-data-tree-item' );
		this.$element.attr( 'data-name', this.getName() );
		this.$element.append( this.$wrapper );
	};

	OOJSPlus.ui.data.tree.NavigationTreeItem.prototype.possiblyAddExpander = function () {
		if ( !this.leaf && !this.expander ) {
			this.expander = new OOJSPlus.ui.widget.ButtonWidget( {
				label: mw.message( 'oojsplus-data-navigation-tree-expander-label' ).text(),
				invisibleLabel: true,
				framed: false,
				icon: this.expanded ? this.style.IconCollapse : this.style.IconExpand,
				classes: [ 'oojsplus-data-tree-expander', this.expanded ? 'expanded' : 'collapsed' ]
			} );
			this.expander.$button.attr( 'aria-expanded', this.expanded );
			this.expander.connect( this, {
				click: 'onExpanderClick'
			} );
			this.$wrapper.prepend( this.expander.$element );
		} else if ( this.expander ) {
			this.expander.$element.remove();
			this.expander = null;
		}
	};

	OOJSPlus.ui.data.tree.NavigationTreeItem.prototype.renderItemActions = function () {
		const actions = this.tree.getItemActions();
		if ( this.$actionContainer ) {
			this.$actionContainer.remove();
			this.$actionContainer = null;
		}

		if ( actions.length === 0 ) {
			return;
		}

		this.$actionContainer = $( '<div>' ).addClass( 'oojsplus-data-tree-item-actions' );
		for ( let i = 0; i < actions.length; i++ ) {
			const action = actions[ i ];
			const button = action.createButton( this );

			if ( !button ) {
				continue;
			}
			this.$actionContainer.append( button.$element );
		}

		if ( this.$actionContainer.children().length > 0 ) {
			this.$wrapper.append( this.$actionContainer );
		} else {
			this.$actionContainer.remove();
			this.$actionContainer = null;
		}
	};

	OOJSPlus.ui.data.tree.NavigationTreeItem.prototype.onExpanderClick = function () {
		const expandedItems = localStorage.getItem( 'expanded-navigation-tree' );
		const key = this.tree.localStorageKey;
		const name = this.getName();
		let expandedItemsList = {};
		if ( expandedItems !== null ) {
			expandedItemsList = JSON.parse( expandedItems );
		}
		if ( this.expanded ) {
			this.tree.collapseNode( name );
			this.expander.$element.removeClass( 'expanded' );
			this.expander.$element.addClass( 'collapsed' );
			this.expander.$button.attr( 'aria-expanded', 'false' );
			this.expanded = false;
			// remove from localstorage
			if ( this.tree.stateful ) {
				if ( expandedItemsList.hasOwnProperty( key ) ) {
					const index = expandedItemsList[ key ].indexOf( name );
					if ( index > -1 ) {
						expandedItemsList[ key ].splice( index, 1 );
						for ( let item = expandedItemsList[ key ] - 1; item >= 0; item-- ) {
							if ( expandedItemsList[ key ][ item ].startsWith( name ) ) {
								const itemIndex = expandedItemsList[ key ].indexOf( expandedItemsList[ key ][ item ] );
								if ( itemIndex > -1 ) {
									expandedItemsList[ key ].splice( itemIndex, 1 );
								}
							}
						}
					}
					if ( expandedItemsList[ key ].length === 0 ) {
						delete ( expandedItems[ key ] );
					}
				}
			}
		} else {
			this.tree.expandNode( name );
			this.expander.$element.removeClass( 'collapsed' );
			this.expander.$element.addClass( 'expanded' );
			this.expander.$button.attr( 'aria-expanded', 'true' );
			this.expanded = true;
			// save to localstorage
			if ( this.tree.stateful ) {
				if ( expandedItemsList.hasOwnProperty( key ) ) {
					expandedItemsList[ key ].push( name );
				} else {
					expandedItemsList[ key ] = [];
					expandedItemsList[ key ].push( name );
				}
			}
		}
		if ( this.tree.stateful ) {
			if ( Object.keys( expandedItemsList ).length === 0 ) {
				localStorage.removeItem( 'expanded-navigation-tree' );
			} else {
				localStorage.setItem( 'expanded-navigation-tree', JSON.stringify( expandedItemsList ) );
			}
		}
	};
}( mediaWiki ) );
