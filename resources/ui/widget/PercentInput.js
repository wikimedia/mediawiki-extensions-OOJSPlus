OOJSPlus.ui.widget.PercentInputWidget = function ( cfg ) {
	cfg = cfg || {};
	cfg.min = cfg.min || 0;
	cfg.max = cfg.max || 100;

	OOJSPlus.ui.widget.PercentInputWidget.parent.call( this, cfg );
	this.$element.addClass( 'oojsplus-ui-widget-percent' );
	this.$element.find( '.oo-ui-numberInputWidget-field' )
		.append( $( '<span>' ).text( '%' ).css( 'padding-left', '10px') );
};

OO.inheritClass( OOJSPlus.ui.widget.PercentInputWidget, OO.ui.NumberInputWidget );

OOJSPlus.ui.widget.PercentInputWidget.prototype.setValue = function ( value ) {
	if ( typeof value === 'string' && value.endsWith( '%' ) ) {
		value = value.slice( 0, -1 );
	}
	return OOJSPlus.ui.widget.PercentInputWidget.parent.prototype.setValue.call( this, value );
};
