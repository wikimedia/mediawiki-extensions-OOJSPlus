OOJSPlus.ui.data.column.Selection = function ( cfg ) {
	cfg.editable = false;
	cfg.width = cfg.width || 30;
	OOJSPlus.ui.data.column.Selection.parent.call( this, cfg );
	this.icon = cfg.icon || '';
	this.title = cfg.title || '';
	this.id = cfg.actionId;
	this.label = cfg.label || '';
	this.selected = cfg.selected || false;

	this.$element.addClass( 'selection-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Selection, OOJSPlus.ui.data.column.Action );

OOJSPlus.ui.data.column.Selection.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.Selection.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'selection-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Selection.prototype.getViewControls = function ( value, row ) {
	this.checkbox = new OOJSPlus.ui.widget.CheckboxInputWidget( {
		title: this.title,
		selected: this.selected,
		accessKey: 't'
	} );
	this.checkbox.connect( this, {
		change: function ( selected ) {
			row.check = selected;
			const element = {
				data: {
					item: row
				}
			};
			this.emit( 'selected', element );
			this.grid.emit( 'selected', element );
		}
	} );

	return this.checkbox;
};

OOJSPlus.ui.data.column.Selection.prototype.getHeader = function () {
	return $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
};

OOJSPlus.ui.data.column.Selection.prototype.canChangeVisibility = function () {
	return false;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'selection', OOJSPlus.ui.data.column.Selection );
