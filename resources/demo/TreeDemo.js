( function( mw, $ ) {
	var $el = $( '#oojsplus-data-demos-tree' );

	var data = [
		{
			name: 'root-1',
			label: 'Root 1',
			items: [
				{
					name: 'level-1-1',
					label: 'Level 1 1'
				},
				{
					name: 'level-1-2',
					label: 'Level 1 2'
				}
			]
		},
		{
			name: 'root-2',
			label: 'Root 2',
			items: [
				{
					name: 'level-1-3',
					label: 'Level 1 3',
					items: [
						{
							name: 'level-2-1',
							label: 'Level 2 1'
						},
						{
							name: 'level-2-2',
							label: 'Level 2 2'
						}
					]
				}
			]
		}
	];

	var tree = new OOJSPlus.ui.data.Tree( {
		fixed: true, // Draggable items are still WIP
		data: data
	} );
	$el.append( tree.$element );


} )( mediaWiki, jQuery );