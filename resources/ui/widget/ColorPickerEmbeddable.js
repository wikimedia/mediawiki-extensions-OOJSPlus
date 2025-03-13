( function ( mw, $ ) {
	OOJSPlus.ui.widget.ColorPickerEmbeddable = function ( cfg ) {
		cfg = cfg || {};

		this.colors = cfg.colors || OOJSPlus.ui.widget.ColorPickerEmbeddable.static.defaultColors;
		this.value = cfg.value || null;
		OOJSPlus.ui.widget.ColorPickerEmbeddable.parent.call( this, cfg );

		this.verifyColors();
		this.returnType = cfg.returnType || 'all';
		this.enableCustomPicker = cfg.hasOwnProperty( 'enableCustomPicker' ) ? cfg.enableCustomPicker : true;

		this.makeContent();
	};

	OO.inheritClass( OOJSPlus.ui.widget.ColorPickerEmbeddable, OO.ui.Widget );

	OOJSPlus.ui.widget.ColorPickerEmbeddable.static.tagName = 'div';

	OOJSPlus.ui.widget.ColorPickerEmbeddable.static.defaultColors = [
		{
			code: '#0000FF',
			name: mw.message( 'oojsplus-color-picker-color-blue' ).text()
		},
		{
			code: '#FF0000',
			name: mw.message( 'oojsplus-color-picker-color-red' ).text()
		},
		{
			code: '#00FFFF',
			name: mw.message( 'oojsplus-color-picker-color-aqua' ).text()
		},
		{
			code: '#FF4500',
			name: mw.message( 'oojsplus-color-picker-color-orangered' ).text()
		},
		{
			code: '#808000',
			name: mw.message( 'oojsplus-color-picker-color-olive' ).text()
		},
		{
			code: '#008000',
			name: mw.message( 'oojsplus-color-picker-color-green' ).text()
		},
		{
			code: '#FFFF00',
			name: mw.message( 'oojsplus-color-picker-color-yellow' ).text()
		},
		{
			code: '#FFC0CB',
			name: mw.message( 'oojsplus-color-picker-color-pink' ).text()
		}
	];

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.makeContent = function () {
		const mainColors = this.getColorButtons();
		const $controls = this.getControls();
		if ( this.value && this.customColorPicker ) {
			this.customColorPicker.setValue( this.value );
		}
		this.$element.children().remove();
		this.$element.append(
			$( '<div>' )
				.addClass( 'oojsplus-color-picker-main-grid' )
				.css( 'width', 150 + 'px' )
				.append( mainColors ),
			$controls
		);
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.getColorButtons = function () {
		const colors = [];
		for ( let i = 0; i < this.colors.length; i++ ) {
			const colorDef = this.colors[ i ];

			const $color = $( '<div>' )
				.addClass( 'oojsplus-color-picker-palette-color' )
				.addClass( 'oo-ui-widget' )
				.addClass( 'oo-ui-widget-enabled' )
				.css( 'pointer-events', 'auto' )
				.attr( 'title', colorDef.name || '' );
			if ( this.isCurrentValue( colorDef ) ) {
				$color.addClass( 'selected' );
			}
			if ( colorDef.hasOwnProperty( 'class' ) ) {
				$color.addClass( colorDef.class ); // eslint-disable-line mediawiki/class-doc
			} else if ( colorDef.hasOwnProperty( 'code' ) ) {
				$color.css( 'color', colorDef.code );
			}
			$color.on( 'click', this.getReturnValue( colorDef ), ( e ) => {
				this.emit( 'colorSelected', e.data );
			} );
			colors.push( $color );
		}
		return colors;
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.isCurrentValue = function ( def ) {
		if ( !this.value ) {
			return false;
		}
		if ( typeof this.value === 'object' ) {
			if ( this.value.hasOwnProperty( 'class' ) && def.hasOwnProperty( 'class' ) && this.value.class === def.class ) {
				return true;
			}
			if ( this.value.hasOwnProperty( 'code' ) && def.hasOwnProperty( 'code' ) && this.value.code === def.code ) {
				return true;
			}
		}
		if ( typeof this.value === 'string' ) {
			if ( def.hasOwnProperty( 'class' ) && this.value === def.class ) {
				return true;
			}
			if ( def.hasOwnProperty( 'code' ) && this.value === def.code ) {
				return true;
			}
		}
		return false;
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.getControls = function () {
		const $controls = $( '<div>' )
			.addClass( 'oojsplus-color-picker-controls' );
		const clear = new OO.ui.ButtonWidget( {
			title: mw.message( 'oojsplus-color-picker-clear-label' ).text(),
			icon: 'cancel',
			flags: [
				'destructive'
			],
			classes: [ 'oojsplus-color-picker-tool-button' ],
			framed: false
		} );
		clear.on( 'click', () => {
			this.emit( 'clear' );
		} );
		$controls.append( clear.$element );

		if ( this.showCustomColorPicker() ) {
			this.customColorPicker = new OOJSPlus.ui.widget.ColorPickerPopupCustomColor();
			this.customColorPicker.on( 'colorSelected', ( color ) => {
				this.emit( 'colorSelected', { code: color } );
			} );
			$controls.append( this.customColorPicker.$element );
		} else {
			clear.$element.css( 'width', '100%' );
		}

		return $controls;
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.getReturnValue = function ( def ) {
		switch ( this.returnType ) {
			case 'code':
				return def.code || '';
			default:
				return def;
		}
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.showCustomColorPicker = function () {
		if ( !this.enableCustomPicker ) {
			return false;
		}
		const $tester = $( '<input type="color" value="!" />' ); // eslint-disable-line no-jquery/no-parse-html-literal
		return $tester.attr( 'type' ) === 'color' && $tester.val() !== '!';
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.getValue = function () {
		return this.value;
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.setValue = function ( value ) {
		this.value = value;
		this.makeContent();
	};

	OOJSPlus.ui.widget.ColorPickerEmbeddable.prototype.verifyColors = function () {
		const verified = [];
		if ( Array.isArray( this.colors ) === false ) {
			return this.colors = OOJSPlus.ui.widget.ColorPickerPopup.static.defaultColors; // eslint-disable-line no-return-assign
		}
		for ( let i = 0; i < this.colors.length; i++ ) {
			const color = this.colors[ i ];
			if ( !color.hasOwnProperty( 'code' ) && !color.hasOwnProperty( 'class' ) ) {
				continue;
			}
			if ( !color.hasOwnProperty( 'name' ) ) {
				// For consistency
				color.name = '';
			}
			verified.push( color );
		}
		this.colors = verified;
	};

	OOJSPlus.ui.widget.ColorPickerPopupCustomColor = function ( cfg ) {
		cfg = Object.assign( {
			icon: 'edit',
			framed: false,
			classes: [ 'oojsplus-color-picker-tool-button' ]
		}, cfg );
		OOJSPlus.ui.widget.ColorPickerPopupCustomColor.parent.call( this, cfg );
		OO.EventEmitter.call( this );

		this.$input = $( '<input>' )
			.attr( 'type', 'color' );
		this.$input.on( 'change', ( e ) => {
			if ( this.validate( $( e.target ).val() ) ) {
				this.emit( 'colorSelected', $( e.target ).val() );
			}
		} );

		// Open the custom picker dialog
		this.connect( this, {
			click: function () {
				this.$input.trigger( 'click' );
			}
		} );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ColorPickerPopupCustomColor, OO.ui.ButtonWidget );
	OO.mixinClass( OOJSPlus.ui.widget.ColorPickerPopupCustomColor, OO.EventEmitter );

	OOJSPlus.ui.widget.ColorPickerPopupCustomColor.prototype.validate = function ( color ) {
		const tester = /^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
		if ( !tester.test( color ) ) {
			// Maybe a error message? Not really necessary, because this will
			// never happen unless user tries to hack an invalid value in
			return false;
		}
		return true;
	};

	OOJSPlus.ui.widget.ColorPickerPopupCustomColor.prototype.setValue = function ( color ) {
		let code;
		if ( typeof color === 'object' && color.hasOwnProperty( 'code' ) ) {
			code = color.code;
		}
		if ( typeof color === 'string' ) {
			code = color;
		}

		if ( this.validate( code ) ) {
			this.$input.val( code );
			$( '<div>' )
				.addClass( 'color-sample' )
				.css( 'background-color', code )
				.insertBefore( this.$icon );
		}
	};
}( mediaWiki, jQuery ) );
