( function ( mw, $ ) {
	OOJSPlus.ui.widget.ColorPickerWidget = function ooJSPlusColorPickerWidget( cfg ) {
		cfg = cfg || {};
		cfg = Object.assign( {
			title: mw.message( 'oojsplus-color-picker-label' ).text(),
			icon: 'textColor'
		}, cfg );

		this.$currentColorShow = $( '<div>' )
			.addClass( 'oojsplus-color-current' )
			.css( 'color', 'transparent' );

		OOJSPlus.ui.widget.ColorPickerWidget.parent.call( this, cfg );
		OOJSPlus.ui.mixin.ColorPickerPopup.call( this, cfg );
		OO.EventEmitter.call( this );

		this.connect( this, {
			click: 'togglePicker',
			colorSelected: 'colorChange',
			clear: 'colorChange'
		} );

		if ( cfg.value ) {
			this.setValue( cfg.value );
		}
		this.$currentColorShow.insertBefore( this.$icon );

		this.$element.addClass( 'oojsplus-color-picker-widget' );
		this.$element.append( this.colorPickerPopup.$element );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ColorPickerWidget, OO.ui.ButtonWidget );
	OO.mixinClass( OOJSPlus.ui.widget.ColorPickerWidget, OOJSPlus.ui.mixin.ColorPickerPopup );
	OO.mixinClass( OOJSPlus.ui.widget.ColorPickerWidget, OO.EventEmitter );

	OOJSPlus.ui.widget.ColorPickerWidget.prototype.togglePicker = function ( val ) {
		if ( val ) {
			this.popup.toggle( val );
		} else {
			this.popup.toggle();
		}

		this.emit( 'togglePicker', this.popup.isVisible() );
	};

	OOJSPlus.ui.widget.ColorPickerWidget.prototype.setValue = function ( value ) {
		this.setPickerValue( value );
		this.setCurrentColor();
	};

	OOJSPlus.ui.widget.ColorPickerWidget.prototype.colorChange = function ( value ) { // eslint-disable-line no-unused-vars
		this.setCurrentColor();
	};

	OOJSPlus.ui.widget.ColorPickerWidget.prototype.getValue = function () {
		return this.getPickerValue();
	};

	OOJSPlus.ui.widget.ColorPickerWidget.prototype.setCurrentColor = function () {
		if ( $.isEmptyObject( this.getValue() ) ) {
			return this.$currentColorShow.css( 'color', 'transparent' );
		}

		if ( this.getValue().hasOwnProperty( 'code' ) && this.getValue().code !== '' ) {
			return this.$currentColorShow.css( 'color', this.getValue().code );
		} else if ( this.getValue().hasOwnProperty( 'class' ) && this.getValue().class !== '' ) {
			this.$currentColorShow.css( 'color', '' );
			return this.$currentColorShow.addClass( this.getValue().class ); // eslint-disable-line mediawiki/class-doc
		}
	};

}( mediaWiki, jQuery ) );
