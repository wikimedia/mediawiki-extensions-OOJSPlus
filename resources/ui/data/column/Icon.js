( function( mw, $ ) {
	OOJSPlus.ui.data.column.Icon = function ( cfg ) {
		OOJSPlus.ui.data.column.Icon.parent.call( this, cfg );

		this.$element.addClass( 'icon-column' );
	};

	OO.inheritClass (OOJSPlus.ui.data.column.Icon, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Icon.prototype.renderCell = function( value ) {
		var $cell = OOJSPlus.ui.data.column.Icon.parent.prototype.renderCell.apply( this, [ value ] );
		$cell.addClass( 'icon-cell' );
		$cell.find( '.oo-ui-iconWidget' ).css( 'display', 'block' );
		return $cell;
	};

	OOJSPlus.ui.data.column.Icon.prototype.getViewControls = function( value ) {
		return new OO.ui.IconWidget( {
			icon: value
		} );
	};

} )( mediaWiki, jQuery);