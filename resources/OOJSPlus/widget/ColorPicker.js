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

		OOJSPlus.widget.ColorPickerWidget.parent.call( this, cfg );
		OOJSPlus.mixin.ColorPickerPopup.call( this, cfg );
		OO.EventEmitter.call( this );

		this.connect( this, {
			click: 'togglePicker',
			valueSet: 'onValueSet'
		} );

		if( cfg.value ) {
			this.setValue( cfg.value  );
		}
		this.$currentColorShow.insertBefore( this.$icon );

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
		this.setCurrentColor();
	};

	OOJSPlus.widget.ColorPickerWidget.prototype.setCurrentColor = function() {
		if ( $.isEmptyObject( this.getValue() ) ) {
			return this.$currentColorShow.css( 'color', 'transparent' );
		}
		if ( this.getValue().hasOwnProperty( 'code' ) ) {
			return this.$currentColorShow.css( 'color', this.getValue().code );
		} else if ( this.getValue().hasOwnProperty( 'class' ) ) {
			return this.$currentColorShow.addClass( this.getValue().class );
		}
	};


} ) ( mediaWiki, jQuery );