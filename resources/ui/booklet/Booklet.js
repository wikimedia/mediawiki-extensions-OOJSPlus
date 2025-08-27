( function () {
	OOJSPlus.ui.booklet.Booklet = function ( cfg ) {
		config = cfg || {};
		OOJSPlus.ui.booklet.Booklet.super.call( this, config );
		this.clearContentPanel();
		this.clearMenuPanel();

		this.currentPageName = null;
		this.pages = {};
		this.ignoreFocus = false;
		this.stackLayout = new OO.ui.StackLayout( {
			continuous: !!config.continuous,
			expanded: this.expanded
		} );
		this.setContentPanel( this.stackLayout );
		this.autoFocus = config.autoFocus === undefined || !!config.autoFocus;
		this.outlineVisible = false;
		this.outlined = !!config.outlined;
		if ( this.outlined ) {
			this.editable = !!config.editable;
			this.outlineControlsWidget = null;
			this.outlineSelectWidget = new OOJSPlus.ui.widget.OutlineSelectWidget();
			this.outlinePanel = new OO.ui.PanelLayout( {
				expanded: this.expanded,
				scrollable: true
			} );
			this.setMenuPanel( this.outlinePanel );
			this.outlineVisible = true;
			if ( this.editable ) {
				this.outlineControlsWidget = new OO.ui.OutlineControlsWidget(
					this.outlineSelectWidget
				);
			}
		}
		this.toggleMenu( this.outlined );
		// Events
		this.stackLayout.connect( this, {
			set: 'onStackLayoutSet'
		} );
		if ( this.outlined ) {
			this.outlineSelectWidget.connect( this, {
				select: 'onOutlineSelectWidgetSelect'
			} );
		}
		if ( this.autoFocus ) {
			// Event 'focus' does not bubble, but 'focusin' does
			this.stackLayout.$element.on( 'focusin', this.onStackLayoutFocus.bind( this ) );
		}
		// Initialization
		this.$element.addClass( 'oo-ui-bookletLayout' );
		this.stackLayout.$element.addClass( 'oo-ui-bookletLayout-stackLayout' );
		if ( this.outlined ) {
			this.outlinePanel.$element
				.addClass( 'oo-ui-bookletLayout-outlinePanel' )
				.append( this.outlineSelectWidget.$element );
			if ( this.editable ) {
				this.outlinePanel.$element
					.addClass( 'oo-ui-bookletLayout-outlinePanel-editable' )
					.append( this.outlineControlsWidget.$element );
			}
		}
		this.$element.addClass( 'oojsplus-booklet' );
	};

	OO.inheritClass( OOJSPlus.ui.booklet.Booklet, OO.ui.BookletLayout );
}() );