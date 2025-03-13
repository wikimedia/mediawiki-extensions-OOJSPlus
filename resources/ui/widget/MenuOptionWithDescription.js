( function ( mw, $ ) {
	OOJSPlus.ui.widget.MenuOptionWithDescription = function ( cfg ) {
		cfg = cfg || {};
		OOJSPlus.ui.widget.MenuOptionWithDescription.parent.call( this, cfg );
		this.$element.addClass( 'oojs-plus-menu-option-with-description' );
		if ( cfg.description ) {
			this.$element.append( $( '<span>' )
				.addClass( 'oojs-plus-menu-option-with-description-description' )
				.text( cfg.description ) );
		}
	};

	OO.inheritClass( OOJSPlus.ui.widget.MenuOptionWithDescription, OO.ui.MenuOptionWidget );

}( mediaWiki, jQuery ) );
