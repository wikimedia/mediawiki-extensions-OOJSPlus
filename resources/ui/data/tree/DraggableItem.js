( function( mw, $ ) {
	OOJSPlus.ui.data.tree.DraggableItem = function ( cfg ) {
		OOJSPlus.ui.data.tree.DraggableItem.parent.call( this, cfg );

		this.$element.data( 'item-name', this.name );
		OO.ui.mixin.DraggableElement.call( this, $.extend( { $handle: this.labelWidget.$element }, cfg ) );

		this.$element.addClass( 'draggable-tree-item' );
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.DraggableItem, OOJSPlus.ui.data.tree.Item );
	OO.mixinClass(  OOJSPlus.ui.data.tree.DraggableItem, OO.ui.mixin.DraggableElement );
} )( mediaWiki, jQuery );
