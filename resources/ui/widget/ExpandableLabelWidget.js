OOJSPlus.ui.widget.ExpandableLabelWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.ExpandableLabelWidget.parent.call( this, cfg );
	this.maxLength = cfg.maxLength || 120;
	this.fullLabel = cfg.label;
	this.expanded = false;
	this.trim();
};

OO.inheritClass( OOJSPlus.ui.widget.ExpandableLabelWidget, OO.ui.LabelWidget );

OOJSPlus.ui.widget.ExpandableLabelWidget.prototype.trim = function () {
	let text = this.fullLabel;
	if ( !this.maxLength ) {
		this.setTitle( this.fullLabel );
		this.setLabel( text );
		return;
	}
	if ( text.length > this.maxLength ) {
		text = text.slice( 0, Math.max( 0, this.maxLength ) );
		this.setTitle( this.fullLabel );
		this.setLabel( text );
		this.$expander = $( '<a>' ).text( '...' );
		this.$expander.on( 'click', this.toggle.bind( this ) );
		this.$element.append( this.$expander );
	}
};

OOJSPlus.ui.widget.ExpandableLabelWidget.prototype.toggle = function () {
	if ( this.expanded ) {
		this.trim();
		this.expanded = false;
		return;
	}
	this.setLabel( this.fullLabel );
	this.expanded = true;
	this.$expander.remove();
};
