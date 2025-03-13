OOJSPlus.ui.widget.LabelWidget = function ( cfg ) {
	cfg = cfg || {};

	const text = cfg.label || '';
	const classes = cfg.classes || [];
	classes.push( 'oojsplus-ui-widget-labelwidget-label' );
	const attrClasses = classes.join( ' ' );

	cfg.label = $( '<span>' ).attr( 'class', attrClasses ).text( text );

	OOJSPlus.ui.widget.LabelWidget.super.call( this, cfg );

	OO.ui.mixin.IconElement.call( this, cfg );

	this.$icon.prependTo( this.$element );

	this.$element.addClass( 'oojsplus-ui-widget-labelwidget' );
};

OO.inheritClass( OOJSPlus.ui.widget.LabelWidget, OO.ui.LabelWidget );
OO.mixinClass( OOJSPlus.ui.widget.LabelWidget, OO.ui.mixin.IconElement );

OOJSPlus.ui.widget.LabelWidget.static.tagName = 'span';
