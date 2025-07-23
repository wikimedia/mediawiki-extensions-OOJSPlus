OOJSPlus.ui.data.sorter.SortSelector = function ( cfg ) {
	cfg = cfg || {};
	cfg.title = mw.msg( 'oojsplus-data-sorter-picker' );
	cfg.icon = 'sort';
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
	OOJSPlus.ui.data.sorter.SortSelector.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.sorter.SortSelector, OO.ui.PopupButtonWidget );

OOJSPlus.ui.data.sorter.SortSelector.prototype.initOptions = function ( options ) {
	const popupPanel = new OO.ui.PanelLayout( {
		expanded: false,
		padded: false,
		classes: [ 'oojsplus-data-filter-sorter-options' ]
	} );
	popupPanel.$element.append( new OO.ui.LabelWidget( {
		label: mw.msg( 'oojsplus-data-sorter-picker' ),
		classes: [ 'oojsplus-data-filter-sorter-options-label' ],
	} ).$element );
	for ( const [ key, label ] of Object.entries( options ) ) {
		const option = new OOJSPlus.ui.widget.DropdownMenuOption( key, label );
		this.optionInstances[ key ] = option;
		option.connect( this, {
			select: ( option ) => {
				this.emit( 'sortAdded', option.key );
			}
		} );
		popupPanel.$element.append( option.$element );
	}
	return popupPanel;
};