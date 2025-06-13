OOJSPlus.ui.widget.OutlineSelectWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.OutlineSelectWidget.super.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.widget.OutlineSelectWidget, OO.ui.OutlineSelectWidget );

// Select widget does not consider focus on element with preselected item
OOJSPlus.ui.widget.OutlineSelectWidget.prototype.onFocus = function ( event ) {
	let item;
	if ( event.target === this.$element[ 0 ] ) {
		if ( !this.findFirstSelectedItem() ) {
			item = this.findFirstSelectableItem();
		} else {
			item = this.findSelectedItem();
		}
	} else {
		if ( event.target.tabIndex === -1 ) {
			item = this.findTargetItem( event );
			if ( item && !( item.isHighlightable() || item.isSelectable() ) ) {
				return;
			}
		} else {
			return;
		}
	}

	if ( item ) {
		if ( item.constructor.static.highlightable ) {
			this.highlightItem( item );
		} else {
			this.selectItem( item );
		}
	}

	if ( event.target !== this.$element[ 0 ] ) {
		this.$focusOwner.trigger( 'focus' );
	}
};
