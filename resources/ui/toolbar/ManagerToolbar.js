OOJSPlus.ui.toolbar.ManagerToolbar = function ( cfg ) {
	cfg = cfg || {};

	this.registeredActions = [];
	this.leftActions = [];
	this.rightActions = [];
	this.listActions = [];
	this.toolFactory = new OO.ui.ToolFactory();
	this.toolGroupFactory = new OO.ui.ToolGroupFactory();
	this.tools = {};
	this.sticky = typeof cfg.sticky === 'undefined' ? true : cfg.sticky;

	cfg.actions = cfg.actions || [];
	for ( let i = 0; i < cfg.actions.length; i++ ) {
		if ( cfg.actions[ i ] instanceof OOJSPlus.ui.toolbar.tool.List ) {
			this.listActions.push( cfg.actions[ i ].getDefinition() );
			continue;
		}

		if ( !( cfg.actions[ i ] instanceof OOJSPlus.ui.toolbar.tool.ToolbarTool ) ) {
			console.error( // eslint-disable-line no-console
				'OOJSPlus.ui.toolbar.ManagerToolbar: action is not an instance of OOJSPlus.ui.toolbar.tool.ToolbarTool',
				cfg.actions[ i ]
			);
			continue;
		}
		const action = cfg.actions[ i ];
		action.connect( this, { action: 'onActionSelect' } );
		this.toolFactory.register( action.getToolObject() );
		this.registeredActions.push( action.name );
		if ( action.position === 'right' ) {
			this.rightActions.push( action.name );
		} else if ( action.position !== 'none' ) {
			this.leftActions.push( action.name );
		}
	}

	this.cancelable = cfg.cancelable || false;
	if ( this.cancelable ) {
		const cancelTool = new OOJSPlus.ui.toolbar.tool.ToolbarTool( {
			name: 'cancel',
			icon: 'close',
			title: mw.msg( 'oojsplus-toolbar-cancel' ),
			flags: [ 'destructive' ]
		} );
		cancelTool.connect( this, { action: 'onCancel' } );
		this.toolFactory.register( cancelTool.getToolObject() );
		this.leftActions.push( 'cancel' );
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
	if ( this.sticky ) {
		this.observe();
	}
};

OO.inheritClass( OOJSPlus.ui.toolbar.ManagerToolbar, OO.ui.Toolbar );

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.setup = function () {
	OOJSPlus.ui.toolbar.ManagerToolbar.parent.prototype.setup.apply( this, [ [
		this.getLeftActions(),
		this.getRightActions(),
		...this.listActions
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
	for ( const action in abilities ) {
		if ( !abilities.hasOwnProperty( action ) ) {
			continue;
		}
		if ( !this.tools.hasOwnProperty( action ) ) {
			console.error( 'OOJSPlus.ui.toolbar.ManagerToolbar: action not found', action ); // eslint-disable-line no-console
			continue;
		}
		this.tools[ action ].setDisabled( !abilities[ action ] );

	}
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.getTool = function ( name ) {
	return this.tools[ name ];
};

OOJSPlus.ui.toolbar.ManagerToolbar.prototype.observe = function () {
	const toolbar = this;
	const $offsetElement = $( '.skin-bluespicediscovery #nb-pri' );
	const offsetTop = $offsetElement.length ? $offsetElement.outerHeight() : 0;

	$( window ).on( 'scroll', function () {
		const windowTop = $( this ).scrollTop();
		const contentWidth = $( '#mw-content-text' ).innerWidth();

		if ( windowTop > offsetTop ) {
			toolbar.$element.css( 'top', offsetTop );
			toolbar.$element.css( 'position', 'fixed' );
			toolbar.$element.css( 'width', contentWidth );
			toolbar.$element.css( 'z-index', 11 );
		} else {
			toolbar.$element.removeAttr( 'style' );
		}
	} );
};
