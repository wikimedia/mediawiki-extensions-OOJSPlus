/**
 *
 * @param cfg {
 * actions: array of OO.ui.MenuOptionWidget, or cfg for OO.ui.MenuOptionWidget,
 * $overlay: ...,
 * other column iptions...
 * }
 * @constructor
 */
OOJSPlus.ui.data.column.SecondaryActions = function ( cfg ) {
	OOJSPlus.ui.data.column.SecondaryActions.parent.call( this, cfg );
	this.actions = cfg.actions || [];
	this.$overlay = cfg.$overlay || true;
	this.$element.addClass( 'secondary-actions-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.SecondaryActions, OOJSPlus.ui.data.column.Action );

OOJSPlus.ui.data.column.SecondaryActions.prototype.bindToGrid = function( grid ) {
	this.grid = grid;
};

OOJSPlus.ui.data.column.SecondaryActions.prototype.renderCell = function( value, row ) {
	$cell = OOJSPlus.ui.data.column.SecondaryActions.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'secondary-actions-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.SecondaryActions.prototype.getViewControls = function( value, row ) {
	var actions = this.actions.map( function( action ) {
		if ( action instanceof OO.ui.MenuOptionWidget ) {
			return action;
		}
		return new OO.ui.MenuOptionWidget( action );
	} );

	var button = new OO.ui.ButtonMenuSelectWidget( {
		icon: this.icon || 'ellipsis',
		label: this.headerText || '',
		invisibleLabel: this.invisibleHeader,
		framed: false,
		title: this.title || '',
		$overlay: this.$overlay,
		menu: {
			items: actions
		}
	} );

	button.menu.connect( this, {
		select: function( item ) {
			if ( !item ) {
				return;
			}
			this.emit( 'action', item.getData(), row );
			this.grid.emit( 'action', item.getData(), row );
		}
	} );

	return button;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'secondaryActions', OOJSPlus.ui.data.column.SecondaryActions );
