OOJSPlus.ui.widget.ButtonSelectWidget = function ( cfg ) {
	cfg = cfg || {};

	OOJSPlus.ui.widget.ButtonSelectWidget.parent.call( this, cfg );

	this.$element.addClass( 'oojsplus-ui-widget-buttonselectwidget' );
	if ( cfg.size || 'normal' === 'big' ) {
		this.$element.addClass( 'button-selectwidget-big' );
	}
	if ( !cfg.hasOwnProperty( 'inline' ) && !cfg.inline ) {
		this.$element.addClass( 'button-selectwidget-list' );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.ButtonSelectWidget, OO.ui.ButtonSelectWidget );
