OOJSPlus.ui.widget.DropdownMenuOption = function ( key, label, cfg ) {
	cfg	= cfg || {};
	this.key = key;

	OOJSPlus.ui.widget.DropdownMenuOption.parent.call( this, Object.assign( {
		label: label, framed: false, flags: [ 'progressive' ]
	}, cfg ) );
	this.connect( this, {
		click: () => {
			this.emit( 'select', this );
		}
	} );
	this.$element.addClass( 'oojsplus-dropdown-menu-option' );
};

OO.inheritClass( OOJSPlus.ui.widget.DropdownMenuOption, OO.ui.ButtonWidget );
