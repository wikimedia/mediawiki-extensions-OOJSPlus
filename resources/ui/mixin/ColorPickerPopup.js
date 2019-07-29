( function( mw, $ ) {
	OOJSPlus.ui.mixin.ColorPickerPopup = function ( cfg ) {
		cfg = cfg || {};

		this.embeddable = new OOJSPlus.ui.widget.ColorPickerEmbeddable( cfg );

		this.embeddable.connect( this, {
			colorSelected: 'onColorSelected',
			clear: 'onClear'
		} );

		var popupCfg = $.extend( {
			width: '152px', // 150 for content and 2 for borders
			padded: cfg.padded || false,
			autoClose: false,
			$autoCloseIgnore: this.embeddable.$element
		}, cfg.popup || {} );

		OOJSPlus.ui.mixin.ColorPickerPopup.parent.call( this, {
			popup: popupCfg
		} );

		this.popup.$body.append( this.embeddable.$element );

		this.colorPickerPopup = this.popup;
	};

	OO.inheritClass( OOJSPlus.ui.mixin.ColorPickerPopup, OO.ui.mixin.PopupElement );

	OOJSPlus.ui.mixin.ColorPickerPopup.prototype.setValue = function( value ) {
		this.embeddable.setValue( value );
		this.emit( 'valueSet', value );
	};

	OOJSPlus.ui.mixin.ColorPickerPopup.prototype.getValue = function() {
		return this.embeddable.getValue();
	};

	OOJSPlus.ui.mixin.ColorPickerPopup.prototype.onColorSelected = function( data ) {
		this.setValue( data );
		this.emit( 'colorSelected', [ data ] );
		this.popup.toggle( false );
	};

	OOJSPlus.ui.mixin.ColorPickerPopup.prototype.onClear = function() {
		this.setValue( {} );
		this.emit( 'clear' );
		this.popup.toggle( false );
	};

} ) ( mediaWiki, jQuery );