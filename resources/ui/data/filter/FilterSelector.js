OOJSPlus.ui.data.filter.FilterSelector = function ( cfg ) {
	cfg = cfg || {};
	cfg.title = mw.msg( 'oojsplus-data-filter-picker' );
	cfg.icon = 'funnel';
	cfg.framed = false;

	this.options = cfg.options || [];
	this.optionInstances = {};
	const popupPanel = this.initOptions( this.options );
	cfg.popup = {
		$content: popupPanel.$element,
		padded: false,
		align: 'force-left',
		width: 200
	};
	OOJSPlus.ui.data.filter.FilterSelector.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.FilterSelector, OO.ui.PopupButtonWidget );

OOJSPlus.ui.data.filter.FilterSelector.prototype.initOptions = function ( options ) {
	const popupPanel = new OO.ui.PanelLayout( {
		expanded: false,
		padded: false,
		classes: [ 'oojsplus-data-filter-sorter-options' ]
	} );
	popupPanel.$element.append( new OO.ui.LabelWidget( {
		label: mw.msg( 'oojsplus-data-filter-picker' ),
		classes: [ 'oojsplus-data-filter-sorter-options-label' ],
	} ).$element );
	for ( const [ key, config ] of Object.entries( options ) ) {
		const option = new OOJSPlus.ui.widget.DropdownMenuOption( key, config.label );
		this.optionInstances[ key ] = option;
		option.connect( this, {
			select: ( option ) => {
				this.getPopup().toggle( false );
				this.emit( 'filterAdded', option.key );
			}
		} );
		popupPanel.$element.append( option.$element );
	}
	return popupPanel;
};