OOJSPlus.ui.widget.ButtonOptionWidget = function ( cfg ) {
	cfg = cfg || {};
	cfg.framed = false;
	OOJSPlus.ui.widget.ButtonOptionWidget.parent.call( this, cfg );
	this.description = cfg.description || '';

	this.$element.addClass( 'oojsplus-ui-widget-buttonoptionwidget' );

	this.$element.append( new OO.ui.IconWidget( {
		icon: 'check',
		classes: [ 'oojsplus-ui-widget-buttonoptionwidget-check' ]
	} ).$element );
	if ( cfg.description ) {
		this.$element.find( 'a' ).append( new OO.ui.LabelWidget( {
			label: cfg.description,
			classes: [ 'oojsplus-ui-widget-buttonoptionwidget-desc' ]
		} ).$element );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.ButtonOptionWidget, OO.ui.ButtonOptionWidget );
