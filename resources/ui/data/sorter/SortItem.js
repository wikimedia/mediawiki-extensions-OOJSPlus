OOJSPlus.ui.data.sorter.SortItem = function ( key, label, direction ) {
	this.key = key;
	this.label = label;
	this.direction = direction;

	this.sortButton = new OO.ui.ButtonWidget( {
		label: label,
		icon: 'sort',
		indicator: direction === 'ASC' ? 'up' : 'down',
		title: mw.msg( 'oojsplus-data-grid-sort-direction-' + direction.toLowerCase(), label )
	} );
	this.sortButton.connect( this, {
		click: 'onSortClick'
	} );
	this.removeBtn = new OO.ui.ButtonWidget( {
		icon: 'close',
		title: mw.message( 'oojsplus-data-sorter-remove' ).text(),
	} );
	this.removeBtn.connect( this, {
		click: 'onRemoveClick'
	} );

	OOJSPlus.ui.data.sorter.SortItem.parent.call( this, { items: [ this.sortButton, this.removeBtn ] } );

	this.$element.addClass( 'oojsplus-data-sorter-item' );
	this.$element.append( this.removeBtn.$element );
};

OO.inheritClass( OOJSPlus.ui.data.sorter.SortItem, OO.ui.ButtonGroupWidget );

OOJSPlus.ui.data.sorter.SortItem.prototype.onSortClick = function () {
	this.setDirection( this.direction === 'ASC' ? 'DESC' : 'ASC');
	this.emit( 'sort', this.key, this.direction );
};

OOJSPlus.ui.data.sorter.SortItem.prototype.setDirection = function ( direction ) {
	this.direction = ( direction || 'ASC' ).toUpperCase();
	this.sortButton.setIndicator( this.direction === 'ASC' ? 'up' : 'down' );
	// oojsplus-data-grid-sort-direction-asc
	// oojsplus-data-grid-sort-direction-desc
	this.sortButton.setTitle( mw.msg( 'oojsplus-data-grid-sort-direction-' + this.direction.toLowerCase(), this.label ) );
};

OOJSPlus.ui.data.sorter.SortItem.prototype.onRemoveClick = function () {
	this.emit( 'clear', this.key );
};
