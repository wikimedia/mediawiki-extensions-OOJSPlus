OOJSPlus.ui.widget.BatchOptionWidget = function ( cfg ) {
	cfg = cfg || {};
	cfg.classes = [ 'oojsplus-widget-batch-option-widget' ];
	OOJSPlus.ui.widget.BatchOptionWidget.super.call( this, cfg );

	if ( cfg.batch ) {
		this.$badge = $( '<span>' ).text( cfg.batch || '' );
		this.$badge.attr( 'aria-label', cfg.batchText || '' );
		this.$badge.addClass( 'oojsplus-widget-batch-option-badge' );
		this.$element.append( this.$badge );
	}

};

OO.inheritClass( OOJSPlus.ui.widget.BatchOptionWidget, OO.ui.MenuOptionWidget );
