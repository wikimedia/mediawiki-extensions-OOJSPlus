OOJSPlus.ui.data.filter.FilterItem = function ( cfg ) {
	this.key = cfg.key;
	this.filter = cfg.filter;
	this.keyLabel = cfg.label;

	this.popupButton = new OO.ui.PopupButtonWidget( {
		classes: [ 'oojsplus-data-grid-filter-button' ],
		icon: cfg.filter.icon || 'funnel',
		label: cfg.label,
		title: mw.message( 'oojsplus-data-grid-filter-title', cfg.label ).text(),
		$overlay: cfg.$overlay || true,
		popup: {
			head: false,
			anchor: true,
			classes: [ 'oojsplus-data-grid-filter-button-popup' ],
			autoClose: cfg.autoClosePopup ?? false,
			$content: this.filter.$element,
			padded: true,
			autoFlip: false,
			$overlay: cfg.$overlay || true
		}
	} );
	this.popupButton.popup.connect( this, {
		toggle: function ( visible ) {
			this.emit( 'filterToggle', this, visible );
			if ( visible ) {
				setTimeout( () => {
					// Timeout is needed to make sure the focus is set after the popup is positioned
					this.filter.focus();
				}, 1 );
			} else {
				this.focus();
			}
		}
	} );
	this.popupButton.popup.$element.attr( 'aria-label',
		mw.message( 'oojsplus-data-grid-filter-title', cfg.label ).parse() );

	this.removeButton = new OO.ui.ButtonWidget( {
		icon: 'close',
		title: mw.message( 'oojsplus-data-grid-filter-clear' ).text()
	} );
	this.removeButton.connect( this, {
		click: function () {
			this.updateLabel( null );
			this.filter.clearValues();
			this.popupButton.getPopup().toggle( false );
			this.emit( 'clear', this.key );
		}
	} );
	this.filter.setOverlay( cfg.$overlay );

	OOJSPlus.ui.data.filter.FilterItem.parent.call( this, {
		items: [ this.popupButton, this.removeButton ]
	} );

	this.filter.connect( this, {
		change: function( f, shouldClose ) {
			this.emit( 'filterChange', f, this.key );
			this.updateLabel( f.getDisplayValue() );
			if ( shouldClose ) {
				this.popupButton.getPopup().toggle( false );
			}
		}
	} );

	this.$element.addClass( 'oojsplus-data-filter-item' );
};

OO.inheritClass( OOJSPlus.ui.data.filter.FilterItem, OO.ui.ButtonGroupWidget );

OOJSPlus.ui.data.filter.FilterItem.prototype.setValue = function ( value ) {
	this.filter.setValue( value );
	this.updateLabel( this.filter.getDisplayValue() );
};

OOJSPlus.ui.data.filter.FilterItem.prototype.updateLabel = function ( value ) {
	if ( value ) {
		if ( value.length > 20 ) {
			value = value.slice( 0, 20 ) + '...';
		}
		this.popupButton.setLabel( value );
	} else {
		this.popupButton.setLabel( this.keyLabel );
	}
};

OOJSPlus.ui.data.filter.FilterItem.prototype.togglePopup = function ( visible ) {
	this.popupButton.getPopup().toggle( visible );
};
