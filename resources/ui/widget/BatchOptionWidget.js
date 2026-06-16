OOJSPlus.ui.widget.BatchOptionWidget = function ( cfg ) {
	cfg = cfg || {};
	cfg.classes = [ ...( cfg.classes || [] ), 'oojsplus-widget-batch-option-widget' ];
	OOJSPlus.ui.widget.BatchOptionWidget.super.call( this, cfg );
	this.attr = cfg.attr || [];

	if ( cfg.batch ) {
		this.$badge = $( '<span>' ).text( cfg.batch || '' );
		this.$badge.attr( 'aria-label', cfg.batchText || '' );
		this.$badge.addClass( 'oojsplus-widget-batch-option-badge' );
		this.$element.append( this.$badge );
	}
	mw.hook( 'oojsplus.ui.widget.batchoptionwidget.preinit' ).fire( this, this.$element );
};

OO.inheritClass( OOJSPlus.ui.widget.BatchOptionWidget, OO.ui.MenuOptionWidget );
