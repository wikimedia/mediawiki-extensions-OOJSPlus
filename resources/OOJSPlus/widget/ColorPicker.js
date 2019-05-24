( function( mw, $ ) {
	OOJSPlus.widget.ColorPickerWidget = function ooJSPlusColorPickerWidget( cfg ) {
		cfg = cfg || {};
		cfg = $.extend( {
			title: mw.message( 'oojsplus-color-picker-label' ).text(),
			icon: 'textStyle' // TODO: Custom icon
		}, cfg );
		OOJSPlus.widget.ColorPickerWidget.parent.call( this, cfg );
		OOJSPlus.mixin.ColorPickerPopup.call( this, cfg );
		OO.EventEmitter.call( this );

		this.connect( this, {
			click: 'togglePicker'
		} );

		this.$element.append( this.colorPickerPopup.$element );
	};

	OO.inheritClass( OOJSPlus.widget.ColorPickerWidget, OO.ui.ButtonWidget );
	OO.mixinClass( OOJSPlus.widget.ColorPickerWidget, OOJSPlus.mixin.ColorPickerPopup );
	OO.mixinClass( OOJSPlus.widget.ColorPickerWidget, OO.EventEmitter );

	OOJSPlus.widget.ColorPickerWidget.prototype.togglePicker = function() {
		this.popup.toggle();
	}
} ) ( mediaWiki, jQuery );