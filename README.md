# OOJSPlus

_HINT: THIS IS JUST A PROOF OF CONCEPT! IT IS NOT PRODUCTION READY!_

## Installation
Execute

    composer require mediawiki/oojsplus dev-REL1_31
within MediaWiki root or add `mediawiki/oojsplus` to the
`composer.json` file of your project

## Activation
Add

    wfLoadExtension( 'OOJSPlus' );
to your `LocalSettings.php` or the appropriate `settings.d/` file.

## Examples

### `OOJSPlus.define`

    OOJSPlus.define( 'MyExt.ui.window.Greetings', {
        extend: 'OOPlus.ui.window.Window',
        requires: [ 'OOPlus.panel.Panel', 'OOPlus.ui.SimpleRSSReader' ], //Resolving this is very hard. A dedicated RL module class would need to be written
        title: 'Hello my friend ...',
        makeItems: function() {
            this.rssReader = new OOPlus.ui.SimpleRSSReader( {
                url: 'https://www.bluespice.org/rss'
            } );
            return [
                new OOPlus.panel.Panel( {
                    html: '... stay a while and listen:'
                } ),
                this.rssReader
            ]
        }
    } );