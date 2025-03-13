/**
 * @param {Object} cfg {
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
	this.$cell = null;
};

OO.inheritClass( OOJSPlus.ui.data.column.SecondaryActions, OOJSPlus.ui.data.column.Action );

OOJSPlus.ui.data.column.SecondaryActions.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.SecondaryActions.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'secondary-actions-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.SecondaryActions.prototype.getViewControls = function ( value, row ) {
	let actions = this.actions.map( ( action ) => {
		if ( typeof action.shouldShow === 'function' && !action.shouldShow( row ) ) {
			return null;
		}
		let item;
		if ( action instanceof OO.ui.MenuOptionWidget ) {
			item = action;
		} else {
			item = new OO.ui.MenuOptionWidget( action );
		}

		if ( typeof action.disabled === 'function' ) {
			item.setDisabled( action.disabled( row ) );
		}
		return item;
	} );
	actions = actions.filter( ( action ) => action instanceof OO.ui.MenuOptionWidget );

	const button = new OO.ui.ButtonMenuSelectWidget( {
		icon: this.icon || 'ellipsis',
		label: this.headerText || '',
		invisibleLabel: this.invisibleHeader,
		framed: false,
		title: this.title || '',
		$overlay: this.$overlay,
		classes: [ 'secondary-actions-button' ],
		menu: {
			items: actions,
			classes: [ 'secondary-actions-menu' ]
		}
	} );
	this.wireFocusVisibility( button );
	button.menu.connect( this, {
		select: function ( item ) {
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
