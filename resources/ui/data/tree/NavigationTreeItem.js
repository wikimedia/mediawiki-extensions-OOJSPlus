( function ( mw, $ ) {
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

	OOJSPlus.ui.data.tree.NavigationTreeItem.prototype.onExpanderClick = function () {
		if ( this.expanded ) {
			this.tree.collapseNode( this.getName() );
			this.expander.$element.removeClass( 'expanded' );
			this.expander.$element.addClass( 'collapsed' );
			this.expander.$button.attr( 'aria-expanded', 'false' );
			this.expanded = false;
		} else {
			this.tree.expandNode( this.getName() );
			this.expander.$element.removeClass( 'collapsed' );
			this.expander.$element.addClass( 'expanded' );
			this.expander.$button.attr( 'aria-expanded', 'true' );
			this.expanded = true;
		}
	};
}( mediaWiki, jQuery ) );
