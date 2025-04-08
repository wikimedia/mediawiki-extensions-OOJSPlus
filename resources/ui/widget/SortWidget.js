OOJSPlus.ui.widget.SortWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.SortWidget.parent.call( this, cfg );

	const sortOptions = cfg.sortOptions || [];
	this.dropdown = new OO.ui.DropdownWidget( {
		menu: {
			items: sortOptions.map( function ( option ) {
				return new OO.ui.MenuOptionWidget( {
					data: option.data,
					label: option.label
				} );
			} )
		}
	} );

	this.dropdown.menu.selectItemByData( cfg.value || sortOptions[0].value );
	this.dropdown.menu.connect( this, { select: 'onChange' } );
	this.directionBtn = new OO.ui.ButtonWidget( {
		classes: [ 'oojsplus-sort-direction' ]
	} );
	this.directionBtn.connect( this, { click: 'toggleDirection' } );
	this.$element.addClass( 'oojsplus-SortWidget' );
	this.$element.append( this.dropdown.$element, this.directionBtn.$element );

	this.direction = cfg.direction || 'asc';
	this.setDirection( this.direction );
};

OO.inheritClass( OOJSPlus.ui.widget.SortWidget, OO.ui.Widget );

OOJSPlus.ui.widget.SortWidget.static.tagName = 'div';

OOJSPlus.ui.widget.SortWidget.prototype.toggleDirection = function () {
	this.direction = this.direction === 'asc' ? 'desc' : 'asc';
	this.setDirection( this.direction );
	this.onChange();
};

OOJSPlus.ui.widget.SortWidget.prototype.setDirection = function ( direction ) {
	this.directionBtn.setTitle( mw.msg( 'oojsplus-sort-direction-' + direction ) );
	this.directionBtn.setIcon( direction === 'asc' ? 'upTriangle' : 'downTriangle' );
};

OOJSPlus.ui.widget.SortWidget.prototype.onChange = function () {
	const selected = this.dropdown.menu.findSelectedItem();
	if ( !selected ) {
		return;
	}
	this.emit( 'change', selected.getData(), this.direction );
};
