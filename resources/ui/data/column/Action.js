OOJSPlus.ui.data.column.Action = function ( cfg ) {
	cfg.editable = false;

	OOJSPlus.ui.data.column.Action.parent.call( this, cfg );
	this.icon = cfg.icon || '';
	this.title = cfg.title || '';
	this.id = cfg.actionId;
	this.label = cfg.label || '';
	this.headerText = cfg.headerText || '';
	this.invisibleHeader = cfg.invisibleHeader || false;
	this.visibleOnHover = cfg.visibleOnHover || false;

	this.$element.addClass( 'action-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Action, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Action.prototype.bindToGrid = function( grid ) {
	this.grid = grid;
};

OOJSPlus.ui.data.column.Action.prototype.renderCell = function( value, row ) {
	$cell = OOJSPlus.ui.data.column.Action.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'action-cell' );
	if ( this.visibleOnHover ) {
		$cell.addClass( 'action-cell-visible-on-hover' );
	}
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
	var $cell = $( '<th>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header, oojsplus-data-gridWidget-action-column-header' );
	if ( this.headerText.length <= 0 ) {
		return $cell;
	}
	var label = new OO.ui.LabelWidget( {
		label: this.headerText,
		classes: [ 'header-label' ],
		framed: false,
		invisibleLabel: this.invisibleHeader
	} );
	return $cell.append( label.$element );
};

OOJSPlus.ui.data.column.Action.prototype.canChangeVisibility = function() {
	return false;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'action', OOJSPlus.ui.data.column.Action );
