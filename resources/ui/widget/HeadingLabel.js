OOJSPlus.ui.widget.HeadingLabel = function ( cfg ) {
	cfg = cfg || {};

	OOJSPlus.ui.widget.HeadingLabel.parent.call( this, cfg );
	this.$element.append( $( '<h2>' ).text( cfg.label || '' ) );
	if ( cfg.subtitle ) {
		this.$element.append( new OO.ui.LabelWidget( {
			label: cfg.subtitle,
			classes: [ 'oojsplus-ui-widget-heading-label-subtitle' ]
		} ).$element );
	}

	this.$element.addClass( 'oojsplus-ui-widget-heading-label' );
};

OO.inheritClass( OOJSPlus.ui.widget.HeadingLabel, OO.ui.Widget );
