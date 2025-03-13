( function () {
	OOJSPlus.ui.widget.ExpandablePanel = function ( config ) {
		config = config || {};
		this.$cnt = config.$content || '';
		delete ( config.$content );
		// Parent constructor
		OOJSPlus.ui.widget.ExpandablePanel.parent.call( this, Object.assign( {}, config, {} ) );
		this.collapsed = config.collapsed || false;
		this.button = new OO.ui.ButtonWidget( {
			label: config.label || '',
			icon: config.icon || '',
			framed: false,
			indicator: this.collapsed ? 'down' : 'up',
			classes: [ 'expander-button' ]
		} );
		this.button.connect( this, {
			click: function () {
				this.collapsed = !this.collapsed;
				this.$area.toggle();
				this.button.setIndicator( this.collapsed ? 'down' : 'up' );
				this.emit( 'stateChange', this.collapsed );
			}
		} );
		this.$area = $( '<div>' ).html( this.$cnt );
		if ( this.collapsed ) {
			this.$area.hide();
		}

		this.$element.append( this.button.$element, this.$area );

		this.$element.addClass( 'oojsplus-ui-expandable-panel' );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ExpandablePanel, OO.ui.PanelLayout );
}() );
