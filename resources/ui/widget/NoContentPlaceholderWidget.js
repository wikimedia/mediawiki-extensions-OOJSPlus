OOJSPlus.ui.widget.NoContentPlaceholderWidget = function ( config ) {
	config = config || {};
	config.type = 'info';
	config.inline = true;
	// Parent constructor
	OOJSPlus.ui.widget.NoContentPlaceholderWidget.parent.call( this, Object.assign( {}, config, {} ) );

	this.$element.addClass( 'oojsplus-widget-no-content-placeholder' );
};

OO.inheritClass( OOJSPlus.ui.widget.NoContentPlaceholderWidget, OO.ui.MessageWidget );
