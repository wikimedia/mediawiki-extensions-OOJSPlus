( function( mw, $ ) {
	OOJSPlus.widget.ColorPickerWidget = function ooJSPlusColorPickerWidget( cfg ) {
		cfg = cfg || {};
		cfg = $.extend( {
			title: mw.message( 'oojsplus-color-picker-label' ).text(),
			icon: 'textColor'
		}, cfg );

		this.$currentColorShow = $( '<div>' )
			.addClass( 'oojsplus-color-current' )
			.css( 'color', 'transparent' );
		this.value = cfg.value || {};

		OOJSPlus.widget.ColorPickerWidget.parent.call( this, cfg );
		OOJSPlus.mixin.ColorPickerPopup.call( this, cfg );
		OO.EventEmitter.call( this );

		this.setValue( this.value );
		this.setCurrentColor();
		this.$currentColorShow.insertBefore( this.$icon );

		this.connect( this, {
			click: 'togglePicker',
			valueSet: 'onValueSet'
		} );

		this.$element.addClass( 'oojsplus-color-picker-widget' );
		this.$element.append( this.colorPickerPopup.$element );
	};

	OO.inheritClass( OOJSPlus.widget.ColorPickerWidget, OO.ui.ButtonWidget );
	OO.mixinClass( OOJSPlus.widget.ColorPickerWidget, OOJSPlus.mixin.ColorPickerPopup );
	OO.mixinClass( OOJSPlus.widget.ColorPickerWidget, OO.EventEmitter );

	OOJSPlus.widget.ColorPickerWidget.prototype.togglePicker = function( val ) {
		if ( val ) {
			this.popup.toggle( val );
		} else {
			this.popup.toggle();
		}

		this.emit( 'togglePicker', this.popup.isVisible() );
	};

	OOJSPlus.widget.ColorPickerWidget.prototype.onValueSet = function( value ) {
		this.value = value;
		this.setCurrentColor();
	};

	OOJSPlus.widget.ColorPickerWidget.prototype.setCurrentColor = function() {
		if ( $.isEmptyObject( this.value ) ) {
			return this.$currentColorShow.css( 'color', 'transparent' );
		}
		if ( this.value.hasOwnProperty( 'code' ) ) {
			return this.$currentColorShow.css( 'color', this.value.code );
		} else if ( this.value.hasOwnProperty( 'class' ) ) {
			return this.$currentColorShow.addClass( this.value.class );
		}
	};


} ) ( mediaWiki, jQuery );