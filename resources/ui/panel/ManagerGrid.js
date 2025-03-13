/**
 * @param  {Object} cfg
 * {
 *     grid: instance of OOJSPlus.ui.data.GridWidget or { columns: {}, store: OOJSPlus.ui.data.store.Store },
 *     toolbar: instance of OOJSPlus.ui.toolbar.ManagerToolbar or { actions: [] }, or omit and override `getToolbarActions()`
 *     expanded: boolean,
 *     padded: boolean
 * }
 */
OOJSPlus.ui.panel.ManagerGrid = function ( cfg ) {
	cfg = cfg || {};
	cfg = Object.assign( cfg, { expanded: false, padded: true } );
	OOJSPlus.ui.panel.ManagerGrid.parent.call( this, cfg );
	this.$element.addClass( 'oojsplus-manager-grid' );

	this.makeToolbar( cfg );
	this.makeGrid( cfg );
};

OO.inheritClass( OOJSPlus.ui.panel.ManagerGrid, OO.ui.PanelLayout );

OOJSPlus.ui.panel.ManagerGrid.prototype.makeToolbar = function ( cfg ) {
	cfg.actions = cfg.actions || this.getToolbarActions();
	this.toolbar = cfg.toolbar instanceof OOJSPlus.ui.toolbar.ManagerToolbar ?
		cfg.toolbar : new OOJSPlus.ui.toolbar.ManagerToolbar( cfg );
	this.$element.append( this.toolbar.$element );
	this.toolbar.connect( this, {
		action: 'onAction',
		save: 'onSave',
		cancel: 'onCancel',
		initialize: 'onInitialize'
	} );
	this.toolbar.setup();
	this.toolbar.initialize();
};

OOJSPlus.ui.panel.ManagerGrid.prototype.getToolbarActions = function () {
	// Override if not specified in constructor's cfg object => Array of OOJSPlus.ui.toolbar.tool.ToolbarTool
	return [];
};

OOJSPlus.ui.panel.ManagerGrid.prototype.makeGrid = function ( cfg ) {
	if ( cfg.grid && cfg.grid instanceof OOJSPlus.ui.data.GridWidget ) {
		this.grid = cfg.grid;
	} else {
		this.store = cfg.grid.store || null;
		if ( !this.store ) {
			throw new Error( 'No store provided for ManagerGrid' );
		}
		this.grid = new OOJSPlus.ui.data.GridWidget( Object.assign( { multiSelect: true, border: 'horizontal' }, cfg.grid ) );
	}
	this.grid.connect( this, {
		rowSelected: function ( item ) {
			this.onItemSelected( item, this.grid.getSelectedRows() );
		},
		action: function ( action, row ) {
			if ( action === 'checkRow' ) {
				return;
			}
			this.onAction( action, row );
		}
	} );

	this.$element.append( this.grid.$element );
};

OOJSPlus.ui.panel.ManagerGrid.prototype.onAction = function ( action, onRow ) { // eslint-disable-line no-unused-vars
	// onRow is the row if action was clicked in the "row action" section
	// otherwise, if user just selected rows and clicked on an action in the toolbar
	// use `this.grid.getSelectedRows()`
	// STUB
};

OOJSPlus.ui.panel.ManagerGrid.prototype.onSave = function () {
	// STUB
};

OOJSPlus.ui.panel.ManagerGrid.prototype.onCancel = function () {
	// STUB
};

OOJSPlus.ui.panel.ManagerGrid.prototype.onItemSelected = function ( item, selectedItems ) { // eslint-disable-line no-unused-vars
	// When selected by clicking on checkboxes
	// useful for setting abilities - this.setAbilities( { actionKey: boolean, ... } );
	// or hiding/showing actions - this.toolbar.getTool( actionKey ).toggle( false )
	// STUB
};

OOJSPlus.ui.panel.ManagerGrid.prototype.onInitialize = function () {
	this.setAbilities( this.getInitialAbilities() );
};

OOJSPlus.ui.panel.ManagerGrid.prototype.getInitialAbilities = function () {
	// Override to set abilities on load without any selection
	return {
		add: true,
		edit: false,
		delete: false
	};
};

OOJSPlus.ui.panel.ManagerGrid.prototype.setAbilities = function ( abilities ) {
	this.toolbar.setAbilities( abilities );
};

// Default actions - for convienence
OOJSPlus.ui.panel.ManagerGrid.prototype.getAddAction = function ( cfg ) {
	return new OOJSPlus.ui.toolbar.tool.ToolbarTool( Object.assign( {
		name: 'add',
		icon: 'add',
		flags: [ 'progressive' ],
		title: mw.msg( 'oojsplus-toolbar-add' )
	}, cfg ) );
};

OOJSPlus.ui.panel.ManagerGrid.prototype.getEditAction = function ( cfg ) {
	return new OOJSPlus.ui.toolbar.tool.ToolbarTool( Object.assign( {
		name: 'edit',
		icon: 'edit',
		title: mw.msg( 'oojsplus-toolbar-edit' )
	}, cfg ) );
};

OOJSPlus.ui.panel.ManagerGrid.prototype.getDeleteAction = function ( cfg ) {
	return new OOJSPlus.ui.toolbar.tool.ToolbarTool( Object.assign( {
		name: 'delete',
		icon: 'trash',
		title: mw.msg( 'oojsplus-toolbar-delete' ),
		flags: [ 'destructive' ]
	}, cfg ) );
};
