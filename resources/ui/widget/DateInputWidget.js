OOJSPlus.ui.widget.DateInputWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.DateInputWidget.parent.call( this, cfg );
	this.$element.addClass( 'oojsplus-date-widget' );
	this.$input.attr( 'type', 'date' );
};

OO.inheritClass( OOJSPlus.ui.widget.DateInputWidget, OO.ui.TextInputWidget );
