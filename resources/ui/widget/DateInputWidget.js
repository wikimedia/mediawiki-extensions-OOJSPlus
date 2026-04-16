OOJSPlus.ui.widget.DateInputWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.DateInputWidget.parent.call( this, cfg );
	this.$element.addClass( 'oojsplus-date-widget' );
};

OO.inheritClass( OOJSPlus.ui.widget.DateInputWidget, mw.widgets.DateInputWidget );
