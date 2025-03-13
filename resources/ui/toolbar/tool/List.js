OOJSPlus.ui.toolbar.tool.List = function ( cfg ) {
	cfg = cfg || {};

	this.type = 'list';
	this.indicator = cfg.indicator || '';
	this.icon = cfg.icon || '';
	this.label = cfg.label || '';
	this.include = cfg.include || [];
	this.position = cfg.position || 'left';
	this.classes = cfg.classes || [ 'position-' + this.position ];
};

OO.initClass( OOJSPlus.ui.toolbar.tool.List );

OOJSPlus.ui.toolbar.tool.List.prototype.getDefinition = function () {
	return { // eslint-disable-line mediawiki/class-doc
		type: this.type,
		indicator: this.indicator,
		icon: this.icon,
		label: this.label,
		include: this.include,
		classes: this.classes
	};
};
