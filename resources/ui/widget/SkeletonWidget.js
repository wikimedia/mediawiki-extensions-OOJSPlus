OOJSPlus.ui.widget.SkeletonWidget = function ( config ) {
	OOJSPlus.ui.widget.SkeletonWidget.super.call( this, config );

	this.variant = config.variant || 'text';
	this.rows = config.rows || 1;

	this.$element
	.addClass( 'oojsplus-ui-widget-skeleton' )
	.addClass( 'oojsplus-ui-widget-skeleton--' + this.variant )
	.attr( 'aria-hidden', 'true' );

	this.render();

	if ( config.visible === false ) {
		this.hide();
	}
};

OO.inheritClass( OOJSPlus.ui.widget.SkeletonWidget, OO.ui.Widget );

OOJSPlus.ui.widget.SkeletonWidget.prototype.render = function () {
	this.$element.empty();

	for ( let i = 0; i < this.rows; i++ ) {
		this.$element.append(
			$( '<div>' )
				.addClass( 'oojsplus-ui-widget-skeleton__line' )
		);
	}
};

OOJSPlus.ui.widget.SkeletonWidget.prototype.show = function () {
	this.$element.removeClass( 'oojsplus-ui-widget-skeleton--hidden' );
};

OOJSPlus.ui.widget.SkeletonWidget.prototype.hide = function () {
	this.$element.addClass( 'oojsplus-ui-widget-skeleton--hidden' );
};

OOJSPlus.ui.widget.SkeletonWidget.prototype.toggle = function ( visible ) {
	this.$element.toggleClass(
		'oojsplus-ui-widget-skeleton--hidden',
		visible === false
	);
};
