OOJSPlus.ui.toolbar.ManagerToolbar = function ( cfg ) {
	cfg = cfg || {};

	this.registeredActions = [];
	this.leftActions = [];
	this.rightActions = [];
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
		if ( action.position === 'right' ) {
			this.rightActions.push( action.name );
		} else {
			this.leftActions.push( action.name );
		}
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
		this.rightActions.push( 'cancel' );
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
		this.rightActions.push( 'save' );
	}


	OOJSPlus.ui.toolbar.ManagerToolbar.parent.call( this, this.toolFactory, this.toolGroupFactory );

	this.$element.addClass( 'oojsplus-manager-toolbar' );
};

OO.inheritClass( OOJSPlus.ui.toolbar.ManagerToolbar, OO.ui.Toolbar );

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.setup = function () {
	OOJSPlus.ui.toolbar.ManagerToolbar.parent.prototype.setup.apply( this, [ [
		this.getLeftActions(),
		this.getRightActions()
	] ] );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.initialize = function () {
	OOJSPlus.ui.toolbar.ManagerToolbar.parent.prototype.initialize.apply( this, arguments );
	this.emit( 'initialize' );
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getLeftActions = function () {
	return {
		name: 'manager-actions',
		classes: [ 'manager-actions' ],
		type: 'bar',
		include: this.leftActions
	};
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getRightActions = function () {
	return {
		name: 'actions',
		classes: [ 'default-actions' ],
		type: 'bar',
		include: this.rightActions
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