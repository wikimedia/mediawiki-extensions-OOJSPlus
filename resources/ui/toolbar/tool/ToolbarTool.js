OOJSPlus.ui.toolbar.tool.ToolbarTool = function ( cfg ) {
	cfg = cfg || {};

	this.name = cfg.name || '';
	if ( !this.name ) {
		throw new Error( 'OOJSPlus.ui.toolbar.tool.ToolbarTool: name is required' );
	}
	this.icon = cfg.icon || '';
	this.flags = cfg.flags || [];
	this.title = cfg.title || '';
	this.position = cfg.position || 'left';
	this.displayBothIconAndLabel = cfg.displayBothIconAndLabel || false;
	// Do not use callbacks unless necessary - it splits code in unpredictable ways
	this.callback = cfg.callback || null;
	this.onUpdateState = cfg.onUpdateState || null;

	OO.EventEmitter.call( this );
};

OO.initClass( OOJSPlus.ui.toolbar.tool.ToolbarTool );
OO.mixinClass( OOJSPlus.ui.toolbar.tool.ToolbarTool, OO.EventEmitter );

OOJSPlus.ui.toolbar.tool.ToolbarTool.prototype.getToolObject = function () {
	var self = this;
	const tool = function() {
		tool.super.apply( this, arguments );
	};
	OO.inheritClass( tool, OO.ui.Tool );
	tool.static.name = this.name;
	tool.static.icon = this.icon;
	tool.static.flags = this.flags;
	tool.static.displayBothIconAndLabel = this.displayBothIconAndLabel || false;
	tool.static.title = this.title;
	tool.prototype.onSelect = function(){
		if ( typeof self.callback === 'function' ) {
			self.callback.call( this );
		} else {
			this.setActive( false );
		}
		self.emit( 'action', self.name );
	};
	tool.prototype.onUpdateState = typeof this.onUpdateState === 'function' ?
		this.onUpdateState.bind( this ) :
		function () {
			this.setActive( false );
		};

	return tool;
};
