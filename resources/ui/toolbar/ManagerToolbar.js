OOJSPlus.ui.toolbar.ManagerToolbar = function ( cfg ) {
	cfg = cfg || {};

	this.registeredActions = [];
	this.toolFactory = new OO.ui.ToolFactory();
	this.toolGroupFactory = new OO.ui.ToolGroupFactory();
	this.tools = {};

	cfg.actions = cfg.actions || [];
	for ( var i = 0; i < cfg.actions.length; i++ ) {
		if ( !( cfg.actions[ i ] instanceof OOJSPlus.ui.toolbar.tool.ToolbarTool ) ) {
			console.error(
				'OOJSPlus.ui.toolbar.ManagerToolbar: action is not an instance of OOJSPlus.ui.toolbar.tool.ToolbarTool',
				cfg.actions[ i ]
			);
			continue;
		}
		var action = cfg.actions[ i ];
		action.connect( this, { action: 'onActionSelect' } );
		this.toolFactory.register( action.getToolObject() );
		this.registeredActions.push( action.name );

	}

	this.saveable = cfg.saveable || false;
	if ( this.saveable ) {
		const saveTool = new OOJSPlus.ui.toolbar.tool.ToolbarTool( {
			name: 'save',
			title: mw.msg( 'oojsplus-toolbar-save' ),
			flags: [ 'primary', 'progressive' ]
		} );
		saveTool.connect( this, { action: 'onSave' } );
		this.toolFactory.register( saveTool.getToolObject() );
	}

	this.cancelable = cfg.cancelable || false;
	if ( this.cancelable ) {
		const cancelTool = new OOJSPlus.ui.toolbar.tool.ToolbarTool( {
			name: 'cancel',
			icon: 'cancel',
			title: mw.msg( 'oojsplus-toolbar-cancel' ),
			flags: [ 'destructive' ]
		} );
		cancelTool.connect( this, { action: 'onCancel' } );
		this.toolFactory.register( cancelTool.getToolObject() );
	}

	OOJSPlus.ui.toolbar.ManagerToolbar.parent.call( this, this.toolFactory, this.toolGroupFactory );

	this.$element.addClass( 'oojsplus-manager-toolbar' );
};

OO.inheritClass( OOJSPlus.ui.toolbar.ManagerToolbar, OO.ui.Toolbar );

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.setup = function () {
	OOJSPlus.ui.toolbar.ManagerToolbar.parent.prototype.setup.apply( this, [ [
		this.getManagerActionsConfig(),
		this.getDefaultActionsConfig()
	] ] );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.initialize = function () {
	OOJSPlus.ui.toolbar.ManagerToolbar.parent.prototype.initialize.apply( this, arguments );
	this.emit( 'initialize' );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getManagerActionsConfig = function () {
	return {
		name: 'manager-actions',
		classes: [ 'manager-actions' ],
		type: 'bar',
		include: this.registeredActions
	};
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getDefaultActionsConfig = function () {
	return {
		name: 'actions',
		classes: [ 'default-actions' ],
		type: 'bar',
		include: this.cancelable ? [ 'cancel', 'save' ] : [ 'save' ]
	};
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.onActionSelect = function ( action ) {
	this.emit( 'action', action );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.onSave = function () {
	this.emit( 'save' );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.onCancel = function () {
	this.emit( 'cancel' );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.setAbilities = function ( abilities ) {
	for ( var action in abilities ) {
		if ( !abilities.hasOwnProperty( action ) ) {
			continue;
		}
		if ( !this.tools.hasOwnProperty( action ) ) {
			console.error( 'OOJSPlus.ui.toolbar.ManagerToolbar: action not found', action );
			continue;
		}
		this.tools[action].setDisabled( !abilities[action] );

	}
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getTool = function ( name ) {
	return this.tools[name];
};