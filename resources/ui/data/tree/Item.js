( function ( mw, $ ) {
	OOJSPlus.ui.data.tree.Item = function ( cfg ) {
		OOJSPlus.ui.data.tree.Item.parent.call( this, cfg );

		this.name = cfg.name;
		this.label = cfg.label;
		this.tree = cfg.tree;
		this.icon = cfg.icon || '';
		this.buttonCfg = cfg;
		this.level = cfg.level;
		this.type = cfg.type;
		this.leaf = cfg.leaf || false;
		this.style = cfg.style || {};
		if ( !this.style.hasOwnProperty( 'IconExpand' ) ) {
			this.style.IconExpand = 'add';
		}
		if ( !this.style.hasOwnProperty( 'IconCollapse' ) ) {
			this.style.IconCollapse = 'subtract';
		}
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : this.tree.allowAdditions;
		this.labelAdd = typeof cfg.labelAdd !== 'undefined' ? cfg.labelAdd : this.tree.labelAdd;
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : this.tree.allowDeletions;
		this.labelDelete = typeof cfg.labelDelete !== 'undefined' ? cfg.labelDelete : this.tree.labelDelete;
		this.expanded = true;
		if ( cfg.hasOwnProperty( 'expanded' ) ) {
			this.expanded = cfg.expanded;
		}

		if ( this.buttonCfg.hasOwnProperty( 'classes' ) ) {
			this.buttonCfg.classes.push( 'oojsplus-data-tree-label' );
		} else {
			this.buttonCfg.classes = [ 'oojsplus-data-tree-label' ];
		}
		if ( this.buttonCfg.hasOwnProperty( 'labelledby' ) ) {
			this.buttonCfg.id = this.buttonCfg.labelledby;
			delete this.buttonCfg.labelledby;
		}

		this.init();
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.Item, OO.ui.Widget );

	OOJSPlus.ui.data.tree.Item.static.tagName = 'li';

	OOJSPlus.ui.data.tree.Item.prototype.init = function () {
		this.$element.children().remove();
		this.$wrapper = $( '<div>' );
		this.addLabel();
		this.possiblyAddOptions();
		this.$element.addClass( 'oojs-ui-data-tree-item' );
		this.$element.attr( 'data-name', this.getName() );
		this.$element.append( this.$wrapper );
	};

	OOJSPlus.ui.data.tree.Item.prototype.setLevel = function ( level ) {
		this.level = level;
		this.$element.attr( 'data-level', this.level );
	};

	OOJSPlus.ui.data.tree.Item.prototype.getLevel = function () {
		return this.level;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getName = function () {
		return this.name;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getLabel = function () {
		return this.label;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getIcon = function () {
		return this.icon;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getChildren = function () {
		const $ul = this.$element.find( '> ul.tree-node-list' ),
			$children = $ul.find( '> li.oojs-ui-data-tree-item' ),
			res = [];

		for ( let i = 0; i < $children.length; i++ ) {
			const name = $( $children[ 0 ] ).data( 'name' );
			if ( this.tree.flat.hasOwnProperty( name ) ) { // eslint-disable-line es-x/no-array-prototype-flat
				res.push( this.tree.flat[ name ] ); // eslint-disable-line es-x/no-array-prototype-flat
			}
		}

		return res;
	};

	OOJSPlus.ui.data.tree.Item.prototype.possiblyAddExpander = function () {
		const childrenCount = this.getChildren().length;

		if ( ( !this.leaf || childrenCount > 0 ) && !this.expander ) {
			this.expander = new OOJSPlus.ui.widget.ButtonWidget( {
				label: mw.message( 'oojsplus-data-tree-expander-label' ).text(),
				invisibleLabel: true,
				framed: false,
				icon: this.expanded ? this.style.IconCollapse : this.style.IconExpand,
				classes: [ 'oojsplus-data-tree-expander' ]
			} );

			this.expander.$button.attr( 'aria-expanded', this.expanded );
			this.expander.connect( this, {
				click: 'onExpanderClick'
			} );
			this.$wrapper.prepend( this.expander.$element );
		} else if ( this.expander && childrenCount === 0 ) {
			this.expander.$element.remove();
			this.expander = null;
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.addLabel = function () {
		this.labelWidget = new OOJSPlus.ui.widget.LinkWidget(
			Object.assign( {},
				{
					framed: false,
					icon: this.getIcon()
				}, this.buttonCfg )
		);

		// Do not use OOJS event handler here - blocks propagation
		this.labelWidget.$element.on( 'click', () => {
			this.select();
			this.emit( 'selected', this );
		} );

		this.labelWidget.$element.on( 'keyup', ( e ) => {
			if ( ( e.key === 'Enter' ) || ( e.key === ' ' ) ) {
				this.select();
				this.emit( 'selected', this );
			}
		} );

		this.$wrapper.append( this.labelWidget.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.deselect = function () {
		this.$element.removeClass( 'item-selected' );
	};

	OOJSPlus.ui.data.tree.Item.prototype.select = function () {
		this.$element.addClass( 'item-selected' );
	};

	OOJSPlus.ui.data.tree.Item.prototype.possiblyAddOptions = function () {
		const options = [];
		if ( this.allowDeletions ) {
			this.removeNodeBtn = new OO.ui.ButtonWidget( {
				framed: false,
				label: this.labelDelete || mw.message( 'oojsplus-data-tree-item-remove-label' ).text(),
				icon: 'close'
			} );
			this.removeNodeBtn.connect( this, {
				click: 'onRemoveClick'
			} );
			options.push( this.removeNodeBtn );
		}
		if ( this.allowAdditions ) {
			this.addSubnodeBtn = new OO.ui.ButtonWidget( {
				framed: false,
				label: this.labelAdd || mw.message( 'oojsplus-data-tree-item-add-label' ).text(),
				icon: 'add'
			} );
			this.addSubnodeBtn.connect( this, {
				click: 'onAddSubnodeClick'
			} );
			options.push( this.addSubnodeBtn.$element );
		}
		if ( options.length === 0 ) {
			return;
		}
		this.optionsPanel = new OO.ui.PanelLayout( {
			expanded: false,
			padded: true,
			scrollable: false,
			framed: false,
			content: options
		} );

		this.optionsPopup = new OO.ui.PopupButtonWidget( {
			icon: 'menu',
			framed: false,
			classes: [ 'tree-item-options-btn' ],
			popup: {
				$content: this.optionsPanel.$element,
				width: 'auto',
				align: 'forwards',
				classes: [ 'tree-item-options-popup' ]
			}
		} );

		this.$wrapper.append( this.optionsPopup.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onExpanderClick = function () {
		if ( this.expanded ) {
			this.tree.collapseNode( this.getName() );
			this.expander.setIcon( this.style.IconExpand );
			this.expander.$button.attr( 'aria-expanded', 'false' );
			this.expanded = false;
		} else {
			this.tree.assertNodeLoaded( this.name ).done( () => {
				this.tree.expandNode( this.getName() );
				this.expander.setIcon( this.style.IconCollapse );
				this.expander.$button.attr( 'aria-expanded', 'true' );
				this.expanded = true;
			} );
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.onRemoveClick = function () {
		const me = this;
		OO.ui.confirm(
			mw.message( 'oojsplus-data-tree-item-remove-confirm-label', me.getLabel() ).plain()
		).done( ( confirmed ) => {
			if ( !confirmed ) {
				return;
			}
			me.optionsPopup.popup.toggle( false );
			me.tree.removeNode( me.getName() );
		} );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onAddSubnodeClick = function () {
		this.optionsPopup.popup.toggle( false );
		this.tree.addSubnode( this.getName() );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onChildrenChanged = function () {
		this.possiblyAddExpander();
	};

}( mediaWiki, jQuery ) );
