( function () {
	OOJSPlus.ui.widget.ColorPickerStandaloneWidget = function ( cfg ) {
		cfg = cfg || {};

		OOJSPlus.ui.widget.ColorPickerStandaloneWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojs-plus-color-picker-standalone' );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ColorPickerStandaloneWidget, OOJSPlus.ui.widget.ColorPickerEmbeddable );

	OOJSPlus.ui.widget.ColorPickerStandaloneWidget.static.tagName = 'div';

}() );
