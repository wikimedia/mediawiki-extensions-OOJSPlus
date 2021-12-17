( function( mw, $ ) {
	OOJSPlus.ui.data.column.Date = function ( cfg ) {
		cfg.editable = false;

		OOJSPlus.ui.data.column.Date.parent.call( this, cfg );

		this.$element.addClass( 'date-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Date, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Date.prototype.sort = function( a, b ) {
		if ( a < b ) {
			return -1;
		}
		if ( a > b ) {
			return 1;
		}
		return 0;
	};

} )( mediaWiki, jQuery );
