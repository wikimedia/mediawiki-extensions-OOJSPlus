( function( mw, $ ) {
	var $el = $( '#oojsplus-data-demos-tree' );

	var data = [
		{
			name: 'root-1',
			label: 'Root 1',
			// Item Definition supports all configs of OO.ui.ButtonWidget,
			href: 'https://bluespice.com',
			target: '_blank',
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
		fixed: false, // Draggable items are still WIP
		expanded: false,
		data: data
	} );
	$el.append( tree.$element );

	// Adding new root note (or any other node)
	// ---> open dialog for user to type the details of the node
	tree.addSubnode( 'root-1' ); // Insert below "root-1" node. Pass null (or nothing) to add to root
	// ---> ... or, if you already have the data
	tree.addSubnodeWithData( { name: 'mysubnode', label: 'Subnode' }, 'root-1' );


} )( mediaWiki, jQuery );
