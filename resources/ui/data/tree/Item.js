( function( mw, $ ) {
	OOJSPlus.ui.data.tree.Item = function ( cfg ) {
		OOJSPlus.ui.data.tree.Item.parent.call( this, cfg );

		this.name = cfg.name;
		this.label = cfg.label;
		this.tree = cfg.tree;
		this.icon = cfg.icon || '';
		this.level = cfg.level;
		this.type = cfg.type;
		this.childrenCount = cfg.childrenCount;
		this.isLeaf = cfg.isLeaf || false;
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : this.tree.allowAdditions;
		this.labelAdd = typeof cfg.labelAdd !== 'undefined' ? cfg.labelAdd : this.tree.labelAdd;
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : this.tree.allowDeletions;
		this.labelDelete = typeof cfg.labelDelete !== 'undefined' ? cfg.labelDelete : this.tree.labelDelete;

		this.init();
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.Item, OO.ui.Widget );

	OOJSPlus.ui.data.tree.Item.static.tagName = 'div';

	OOJSPlus.ui.data.tree.Item.prototype.init = function() {
		this.$element.children().remove();
		this.possiblyAddExpander();
		this.addIcon();
		this.addLabel();
		this.possiblyAddOptions();

		this.$element.addClass( 'tree-item' );
		this.$element.addClass( 'tree-lvl-' + this.level );
		// Awesome
		this.$element.css( {
			'padding-left': this.isLeaf ? this.level * 25 + 30 : this.level * 25
		} );
	};

	OOJSPlus.ui.data.tree.Item.prototype.setLevel = function( level ) {
		this.level = level;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getLevel = function() {
		return this.level;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getName = function() {
		return this.name;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getIcon = function() {
		return this.icon;
	};

	OOJSPlus.ui.data.tree.Item.prototype.getChildNodes = function() {
		return this.tree.getChildNodes( this.name );
	};

	OOJSPlus.ui.data.tree.Item.prototype.possiblyAddExpander = function() {
		if ( this.isLeaf ) {
			if ( this.expander ) {
				this.expander.$element.remove();
				this.expander = null;
			}
			return;
		}
		if ( this.expander ) {
			return;
		}
		this.expanded = this.childrenCount > 0 ? true : false;
		this.expander = new OO.ui.ButtonWidget( {
			framed: false,
			icon: this.childrenCount > 0 ? 'collapse' : 'expand',
			classes: [ 'oojsplus-data-tree-expander' ]
		} );
		this.expander.connect( this, {
			click: 'onExpanderClick'
		} );
		this.$element.prepend( this.expander.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.addIcon = function() {
		if ( !this.getIcon() ) {
			return;
		}
		var iconWidget = new OO.ui.IconWidget( { icon: this.getIcon() } );
		this.$element.append( iconWidget.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.addLabel = function() {
		this.labelWidget = new OO.ui.ButtonWidget( {
			framed: false,
			label: this.label
		} );
		this.labelWidget.connect( this, {
			click: function() {
				this.select();
				this.emit( 'selected', this );
			}
		} );
		this.$element.append( this.labelWidget.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.deselect = function() {
		this.$element.removeClass( 'item-selected' );
		if ( this.optionsPopup ) {
			this.optionsPopup.$element.hide();
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.select = function() {
		this.$element.addClass( 'item-selected' );
		if ( this.optionsPopup ) {
			this.optionsPopup.$element.show();
		}
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
		/*this.optionsPopup.$element.hide();

		var leaveTimer;
		this.$element.on( 'mouseenter mouseleave', function( e ) {
			if ( !this.optionsPopup ) {
				return;
			}
			if ( e.type === 'mouseenter' ) {
				this.optionsPopup.$element.show();
				this.optionsPopup.popup.toggle( false );
			} else if ( e.type === 'mouseleave' ) {
				clearTimeout( leaveTimer );
				leaveTimer = setTimeout( function() {
					this.optionsPopup.$element.hide();
				}, 100 );
			}
		}.bind( this ) );*/

		this.optionsPopup.$element.hide();
		this.$element.append( this.optionsPopup.$element );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onExpanderClick = function() {
		if ( this.expanded ) {
			this.tree.collapseNode( this.name );
			this.expander.setIcon( 'expand' );
			this.expanded = false;
		} else {
			this.tree.assertNodeLoaded( this.name ).done( function() {
				this.tree.expandNode( this.name );
				this.expander.setIcon( 'collapse' );
				this.expanded = true;
			}.bind( this ) );
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.setIsLeaf = function( isLeaf ) {
		this.isLeaf = isLeaf;
		this.possiblyAddExpander();
	};

	OOJSPlus.ui.data.tree.Item.prototype.show = function() {
		this.changeVisibility( true );
	};

	OOJSPlus.ui.data.tree.Item.prototype.hide = function() {
		this.changeVisibility( false );
	};

	OOJSPlus.ui.data.tree.Item.prototype.remove = function() {
		this.$element.remove();
	};

	OOJSPlus.ui.data.tree.Item.prototype.changeVisibility = function( visible ) {
		if ( this.optionsPopup ) {
			this.optionsPopup.toggle( false );
		}
		if ( visible ) {
			this.$element.show();
			this.optionsPopup.toggle( true );
		} else {
			this.$element.hide();
		}
	};

	OOJSPlus.ui.data.tree.Item.prototype.onRemoveClick = function() {
		this.optionsPopup.popup.toggle( false );
		this.tree.removeNode( this.name );
	};

	OOJSPlus.ui.data.tree.Item.prototype.onAddSubnodeClick = function() {
		this.optionsPopup.popup.toggle( false );
		this.tree.addSubnode( this.name );
	};

	OOJSPlus.ui.data.tree.Item.prototype.updateUI = function() {
		this.removeLevelClass();
		this.possiblyAddExpander();

		this.$element.addClass( 'tree-lvl-' + this.level );
		// Awesome
		this.$element.css( {
			'padding-left': this.isLeaf ? this.level * 25 + 30 : this.level * 25
		} );
	};

	OOJSPlus.ui.data.tree.Item.prototype.removeLevelClass = function() {
		classList = $( this.$element ).attr( "class" );
		classes = classList.split( /\s+/ );

		for ( var i = 0; i < classes.length; i++ ) {
			if ( /tree-lvl-.*/.test( classes[i] ) ) {
				this.$element.removeClass( classes[i] );
			}
		}
	};

} )( mediaWiki, jQuery );
