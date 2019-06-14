( function( mw, $ ) {
	OOJSPlus.mixin.ColorPickerPopup = function ( cfg ) {
		cfg = cfg || {};

		this.embeddable = new OOJSPlus.widget.ColorPickerEmbeddable( cfg );

		this.embeddable.connect( this, {
			colorSelected: 'onColorSelected',
			clear: 'onClear'
		} );

		var popupCfg = $.extend( {
			width: '152px', // 150 for content and 2 for borders
			padded: cfg.padded || false
		}, cfg.popup || {} );

		OOJSPlus.mixin.ColorPickerPopup.parent.call( this, {
			popup: popupCfg
		} );

		this.popup.$body.append( this.embeddable.$element );

		this.colorPickerPopup = this.popup;
	};

	OO.inheritClass( OOJSPlus.mixin.ColorPickerPopup, OO.ui.mixin.PopupElement );

	OOJSPlus.mixin.ColorPickerPopup.prototype.setValue = function( value ) {
		this.emit( 'valueSet', value );
		return this.embeddable.setValue( value );
	};

	OOJSPlus.mixin.ColorPickerPopup.prototype.onColorSelected = function( data ) {
		this.emit( 'colorSelected', [ data ] );
		this.popup.toggle( false );
	};

	OOJSPlus.mixin.ColorPickerPopup.prototype.onClear = function() {
		this.emit( 'clear' );
		this.popup.toggle( false );
	};

} ) ( mediaWiki, jQuery );