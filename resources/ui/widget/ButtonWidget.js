( function () {
	OOJSPlus.ui.widget.ButtonWidget = function ( cfg ) {
		cfg = cfg || {};

		OOJSPlus.ui.widget.ButtonWidget.parent.call( this, cfg );

		const role = cfg.role || 'button';
		this.$button.attr( 'role', role );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ButtonWidget, OO.ui.ButtonWidget );
}() );
