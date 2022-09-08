( function( mw, $ ) {
	OOJSPlus.ui.widget.ButtonWidget = function( cfg ) {
		cfg = cfg || {};

		OOJSPlus.ui.widget.ButtonWidget.parent.call( this, cfg );

		var role = cfg.role || 'none';
		this.$button.attr( 'role', role );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ButtonWidget, OO.ui.ButtonWidget );
} ) ( mediaWiki, jQuery );