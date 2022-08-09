( function( mw, $ ) {
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
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : this.tree.allowAdditions;
		this.labelAdd = typeof cfg.labelAdd !== 'undefined' ? cfg.labelAdd : this.tree.labelAdd;
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : this.tree.allowDeletions;
		this.labelDelete = typeof cfg.labelDelete !== 'undefined' ? cfg.labelDelete : this.tree.labelDelete;
		this.expanded = true;
		if ( cfg.hasOwnProperty( 'expanded' ) ) {
			this.expanded = cfg.expanded
		}

		if ( this.buttonCfg.hasOwnProperty( 'classes' ) ) {
			this.buttonCfg.classes.push( 'oojsplus-data-tree-label' );
		} else {
			this.buttonCfg.classes = [ 'oojsplus-data-tree-label' ];
		}

		this.init();
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.Item, OO.ui.Widget );

	OOJSPlus.ui.data.tree.Item.static.tagName = 'li';

	OOJSPlus.ui.data.tree.Item.prototype.init = function() {
		this.$element.children().remove();
		this.addLabel();
		this.possiblyAddOptions();
		this.$element.addClass( 'oojs-ui-data-tree-item' );
		this.$element.attr( 'data-name', this.getName() );
		this.$element.attr( 'role', 'treeitem' );
		this.$element.attr( 'aria-expanded', this.expanded );
	};

	OOJSPlus.ui.data.tree.Item.prototype.setLevel = function( level ) {
		this.level = level;
		this.$element.attr( 'data-level', this.level );
	};

	OOJSPlus.ui.data.tree.Item.prototype.getLevel = function() {
		return this.level;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getName = function() {
		return this.name;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getLabel = function() {
		return this.label;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getIcon = function() {
		return this.icon;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getChildren = function() {
		var $ul = this.$element.find( '> ul.tree-node-list' ),
			$children = $ul.find( '> li.oojs-ui-data-tree-item' ),
			res = [];

		for ( var i = 0; i < $children.length; i++ ) {
			var name = $( $children[0] ).data( 'name' );
			if ( this.tree.flat.hasOwnProperty( name ) ) {
				res.push( this.tree.flat[name] );
			}
		}

		return res;
	};

	OOJSPlus.ui.data.tree.Item.prototype.possiblyAddExpander = function() {
		var childrenCount = this.getChildren().length;

		if ( childrenCount === 0 || this.leaf ) {
			if ( this.expander ) {
				this.expander.$element.remove();
				this.expander = null;
			}
			return;
		}

		if ( this.expander ) {
			return;
		}

		this.expander = new OOJSPlus.ui.widget.ButtonWidget( {
			framed: false,
			icon: this.expanded ? 'subtract' : 'add',
			classes: [ 'oojsplus-data-tree-expander' ]
		} );
		this.expander.connect( this, {
			click: 'onExpanderClick'
		} );
		this.$element.prepend( this.expander.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.addLabel = function() {
		this.labelWidget = new OOJSPlus.ui.widget.ButtonWidget(
			$.extend( {},
			{
				framed: false,
				icon: this.getIcon()
			}, this.buttonCfg )
		);

		// Do not use OOJS event handler here - blocks propagation
		this.labelWidget.$element.on( 'click', function( e ) {
			this.select();
			this.emit( 'selected', this );
		}.bind( this ) );
		this.$element.append( this.labelWidget.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.deselect = function() {
		this.$element.removeClass( 'item-selected' );
	};

	OOJSPlus.ui.data.tree.Item.prototype.select = function() {
		this.$element.addClass( 'item-selected' );
	};

	OOJSPlus.ui.data.tree.Item.prototype.possiblyAddOptions = function() {
		var options = [];
		if ( this.allowDeletions ) {
			this.removeNodeBtn = new OO.ui.ButtonWidget( {
				framed: false,
				label: this.labelDelete || mw.message( "oojsplus-data-tree-item-remove-label" ).text(),
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
				label: this.labelAdd || mw.message( "oojsplus-data-tree-item-add-label" ).text(),
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
		 	indicator: 'down',
			framed: false,
			classes: [ 'tree-item-options-btn' ],
			popup: {
		 		$content: this.optionsPanel.$element,
				width: 'auto',
				align: 'forwards',
				classes: [ 'tree-item-options-popup' ]
			}
		} );

		this.$element.append( this.optionsPopup.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onExpanderClick = function() {
		if ( this.expanded ) {
			this.tree.collapseNode( this.getName() );
			this.expander.setIcon( 'add' );
			this.expanded = false;
		} else {
			this.tree.assertNodeLoaded( this.name ).done( function() {
				this.tree.expandNode( this.getName() );
				this.expander.setIcon( 'subtract' );
				this.expanded = true;
			}.bind( this ) );
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.onRemoveClick = function() {
		this.optionsPopup.popup.toggle( false );
		this.tree.removeNode( this.getName() );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onAddSubnodeClick = function() {
		this.optionsPopup.popup.toggle( false );
		this.tree.addSubnode( this.getName() );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onChildrenChanged = function() {
		this.possiblyAddExpander();
	};

} )( mediaWiki, jQuery );
