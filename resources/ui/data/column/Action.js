OOJSPlus.ui.data.column.Action = function ( cfg ) {
	cfg.editable = false;

	OOJSPlus.ui.data.column.Action.parent.call( this, cfg );
	this.icon = cfg.icon || '';
	this.title = cfg.title || '';
	this.id = cfg.actionId;
	this.label = cfg.label || '';

	this.$element.addClass( 'action-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Action, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Action.prototype.bindToGrid = function( grid ) {
	this.grid = grid;
};

OOJSPlus.ui.data.column.Action.prototype.renderCell = function( value, row ) {
	$cell = OOJSPlus.ui.data.column.Action.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'action-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Action.prototype.getViewControls = function( value, row ) {
	var button =  new OO.ui.ButtonWidget( {
		label: this.label,
		icon: this.icon,
		title: this.title,
		framed: false
	} );
	button.connect( this, {
		click: function() {
			this.emit( 'action', this.id, row );
			this.grid.emit( 'action', this.id, row );
		}
	} );
	return button;
};

OOJSPlus.ui.data.column.Action.prototype.getHeader = function() {
	return $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'action', OOJSPlus.ui.data.column.Action );
