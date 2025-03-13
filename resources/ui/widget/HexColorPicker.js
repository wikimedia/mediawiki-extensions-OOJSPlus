( function ( mw, $ ) {
	OOJSPlus.ui.widget.HexColorPickerWidget = function ooJSPlusHexColorPickerWidget( cfg ) {
		cfg = cfg || {};

		cfg.validate = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		OOJSPlus.ui.widget.HexColorPickerWidget.parent.call( this, cfg );
		OOJSPlus.ui.mixin.ColorPickerPopup.call( this, cfg );
		OO.EventEmitter.call( this );

		this.$colorPreview = $( '<div>' ).addClass( 'oojsplus-hex-color-current' );
		this.$colorPreview.on( 'click', this.togglePicker.bind( this ) );

		this.connect( this, {
			colorSelected: 'colorSelected',
			clear: 'colorSelected'
		} );

		if ( cfg.value ) {
			this.setValue( cfg.value );
		}

		this.$element.addClass( 'oojsplus-hex-color-picker-widget' );
		this.$colorPreview.append( this.colorPickerPopup.$element );
		this.$element.prepend( this.$colorPreview );
	};

	OO.inheritClass( OOJSPlus.ui.widget.HexColorPickerWidget, OO.ui.TextInputWidget );
	OO.mixinClass( OOJSPlus.ui.widget.HexColorPickerWidget, OOJSPlus.ui.mixin.ColorPickerPopup );
	OO.mixinClass( OOJSPlus.ui.widget.HexColorPickerWidget, OO.EventEmitter );

	OOJSPlus.ui.widget.HexColorPickerWidget.prototype.togglePicker = function ( val ) {
		if ( typeof val !== 'undefined' ) {
			this.popup.toggle( val );
		} else {
			this.popup.toggle();
		}

		this.emit( 'togglePicker', this.popup.isVisible() );
	};

	OOJSPlus.ui.widget.HexColorPickerWidget.prototype.onFocus = function () {
		this.togglePicker( false );
	};

	OOJSPlus.ui.widget.HexColorPickerWidget.prototype.setValue = function ( value, stopPropagation ) {
		if ( typeof value === 'undefined' ) {
			return;
		}
		stopPropagation = stopPropagation || false;

		if ( typeof value !== 'string' ) {
			if ( value.length !== 2 ) {
				return;
			}
			if ( value[ 0 ] === '' ) {
				value = value[ 1 ];
			}
		}
		value = value.trim();
		OOJSPlus.ui.widget.HexColorPickerWidget.parent.prototype.setValue.call( this, value );
		if ( !stopPropagation ) {
			if ( !value ) {
				this.setPickerValue( {} );
				this.colorSelected( {} );
				return;
			}
			this.getValidity().done( () => {
				this.setPickerValue( { code: value } );
				this.colorSelected( { code: value } );
			} );
		}
	};

	OOJSPlus.ui.widget.HexColorPickerWidget.prototype.colorSelected = function ( value ) {
		this.togglePicker( false );
		if ( typeof value === 'undefined' || !value.hasOwnProperty( 'code' ) ) {
			this.$colorPreview.css( 'background-color', 'transparent' );
			this.setValue( '', true );
		}
		this.$colorPreview.css( 'background-color', value.code );
		this.setValue( value.code, true );
	};

}( mediaWiki, jQuery ) );
