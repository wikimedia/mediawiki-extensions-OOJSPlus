( function( mw, $ ) {
	OOJSPlus.ui.widget.ButtonWidget = function( cfg ) {
		cfg = cfg || {};
		var role = cfg.role || 'none';

		OOJSPlus.ui.widget.ButtonWidget.parent.call( this, cfg );

		this.$button.attr( 'role', role );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ButtonWidget, OO.ui.ButtonWidget );
} ) ( mediaWiki, jQuery );