( function( mw, $ ) {
	var $el = $( '#oojsplus-data-demos-range' );

	var range = new OOJSPlus.ui.widget.RangeWidget( {
		min: 0,
		max: 100,
		value: 30,
		step: 5,
		valueMask: '%v %', // %v will be replaced with actual value
		nullValue: 'auto' // What to show when value is 0
	} );
	$el.append( range.$element );


} )( mediaWiki, jQuery );
