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
	this.shouldShow = cfg.shouldShow || null;
	this.disabledCallback = cfg.disabled || null;

	this.$element.addClass( 'action-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Action, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Action.prototype.bindToGrid = function( grid ) {
	this.grid = grid;
	if ( this.visibleOnHover ) {
		this.grid.setActionsVisibleOnHover( true );
	}
};

OOJSPlus.ui.data.column.Action.prototype.renderCell = function( value, row ) {
	var $cell = OOJSPlus.ui.data.column.Action.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'action-cell' );
	if ( this.visibleOnHover ) {
		$cell.addClass( 'action-cell-visible-on-hover' );
	}
	return $cell;
};

OOJSPlus.ui.data.column.Action.prototype.getViewControls = function( value, row ) {
	if ( typeof this.shouldShow === 'function' && !this.shouldShow( row ) ) {
		return new OO.ui.Widget();
	}
	const item = new OO.ui.ButtonWidget( {
		label: this.label,
		icon: this.icon,
		title: this.title,
		framed: false
	} );

	if ( typeof this.disabledCallback === 'function' ) {
		item.setDisabled( this.disabledCallback( row ) );
	}
	this.wireFocusVisibility( item );
	item.connect( this, {
		click: function() {
			this.emit( 'action', this.id, row );
			this.grid.emit( 'action', this.id, row );
		}
	} );
	return item;
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

OOJSPlus.ui.data.column.Action.prototype.wireFocusVisibility = function( item ) {
	if ( this.visibleOnHover ) {
		item.$element.find( '>a' ).on( 'focus', function() {
			item.$element.parent( '.action-cell-visible-on-hover' ).addClass( 'col-visible' );
		}.bind( this ) );
		item.$element.find( '>a' ).on( 'focusout', function() {
			item.$element.parent( '.action-cell-visible-on-hover' ).removeClass( 'col-visible' );
		}.bind( this ) );

	}
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'action', OOJSPlus.ui.data.column.Action );
