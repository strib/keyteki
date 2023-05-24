const Card = require('../../Card.js');

class UncommonCurrency extends Card {
    // Action: Swap control of Uncommon Currency and an enemy artifact.
    setupCardAbilities(ability) {
        this.action({
            target: {
                cardType: 'artifact',
                controller: 'opponent',
                location: 'play area',
                gameAction: ability.actions.swap()
            }
        });
    }
}

UncommonCurrency.id = 'uncommon-currency';

module.exports = UncommonCurrency;
